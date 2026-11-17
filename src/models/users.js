import mongoose from "mongoose";
import userSchema from "./schemas/user.js";

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;

// Find a user by email
export async function getUserByEmail(email) {
  return User.findOne({ email: email.toLowerCase() });
}

// Find a user by username
export async function getUserByUsername(username) {
  return User.findOne({ username: username.toLowerCase() });
}

// Find a user by ID
export async function getUserById(id) {
  return User.findById(id);
}

// Create a new user
export async function createUser(userData) {
  return User.create(userData);
}

// Get all users
export async function getAllUsers() {
  return User.find({}).populate("role", "name");
}
