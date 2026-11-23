import mongoose from "mongoose";

import {
  getAllUsersSafe,
  getUserByIdSafe,
  updateUserProfile,
  deleteUserById,
} from "../models/users.js";

// Convert a database user into a safe API response.
const toSafeUser = (user) => ({
  id: user._id.toString(),
  displayName: user.displayName,
  username: user.username,
  email: user.email,
  role: user.role?.name ?? user.role,
});

// Check whether the signed-in user can manage a target account.
const canManageUser = (sessionUser, targetId) => (
  sessionUser.role === "admin" ||
  sessionUser.id === targetId
);

// Return all users to administrators and only the current user to others.
export const getUsersApi = async (req, res) => {
  try {
    if (req.session.user.role === "admin") {
      const users = await getAllUsersSafe();
      return res.status(200).json(users.map(toSafeUser));
    }

    const user = await getUserByIdSafe(req.session.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json([toSafeUser(user)]);
  } catch (error) {
    console.error("Error retrieving users:", error);
    return res.status(500).json({ message: "Unable to retrieve users." });
  }
};

// Update permitted profile fields for the current user or an admin's target.
export const updateUserApi = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    if (!canManageUser(req.session.user, id)) {
      return res.status(403).json({
        message: "You do not have permission to update this user.",
      });
    }

    const body = req.body ?? {};
    const allowedFields = ["displayName", "username", "email"];
    const suppliedFields = Object.keys(body);

    if (
      suppliedFields.length === 0 ||
      suppliedFields.some((field) => !allowedFields.includes(field))
    ) {
      return res.status(400).json({
        message: "Only displayName, username, and email may be updated.",
      });
    }

    const updates = {};

    for (const field of allowedFields) {
      if (Object.hasOwn(body, field)) {
        if (typeof body[field] !== "string" || !body[field].trim()) {
          return res.status(400).json({
            message: `${field} must be a non-empty string.`,
          });
        }

        updates[field] = body[field].trim();
      }
    }

    if (updates.username) {
      updates.username = updates.username.toLowerCase();
    }

    if (updates.email) {
      updates.email = updates.email.toLowerCase();
    }

    const user = await updateUserProfile(id, updates);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(toSafeUser(user));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "That username or email is already in use.",
      });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: "Invalid user information." });
    }

    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Unable to update user." });
  }
};

// Delete the current user's account or an account targeted by an admin.
export const deleteUserApi = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    if (!canManageUser(req.session.user, id)) {
      return res.status(403).json({
        message: "You do not have permission to delete this user.",
      });
    }

    const user = await deleteUserById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (req.session.user.id === id) {
      return req.session.destroy((error) => {
        if (error) {
          console.error("Error ending deleted user's session:", error);
          return res.status(500).json({
            message: "Account deleted, but unable to end the session.",
          });
        }

        res.clearCookie("connect.sid");
        return res.status(200).json({
          message: "Account deleted successfully.",
          signedOut: true,
        });
      });
    }

    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Unable to delete user." });
  }
};

