import bcrypt from "bcryptjs";

import {
  getUserByEmail,
  getUserByUsername,
  createUser,
} from "../models/users.js";

import { getRoleByName } from "../models/roles.js";

// Register a new user.
export const registerUser = async (req, res) => {
  try {
    const { displayName, username, email, password } = req.body;

    // Validate required fields.
    if (!displayName || !username || !email || !password) {
      return res.status(400).render("register", {
        title: "Register",
        error: "All fields are required.",
      });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).render("register", {
        title: "Register",
        error: "Password must contain at least 8 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    if (!normalizedEmail || !normalizedUsername) {
      return res.status(400).render("register", {
        title: "Register",
        error: "Email and username are required.",
      });
    }

    // Check whether the email or username already exists.
    const existingEmail = await getUserByEmail(normalizedEmail);

    if (existingEmail) {
      return res.status(409).render("register", {
        title: "Register",
        error: "Email is already registered.",
      });
    }

    const existingUsername = await getUserByUsername(normalizedUsername);

    if (existingUsername) {
      return res.status(409).render("register", {
        title: "Register",
        error: "Username is already taken.",
      });
    }

    // Assign the standard user role.
    const userRole = await getRoleByName("user");

    if (!userRole) {
      return res.status(500).render("register", {
        title: "Register",
        error: "User role is not configured.",
      });
    }

    // Hash the password before saving.
    const passwordHash = await bcrypt.hash(password, 12);

    await createUser({
      displayName: displayName.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      role: userRole._id,
    });

    return res.redirect("/login?registered=true");
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).render("register", {
      title: "Register",
      error: "Unable to register your account. Please try again.",
    });
  }
};

// Log in an existing user.
export const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (
      typeof identifier !== "string" ||
      !identifier.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).render("login", {
        title: "Login",
        error: "Username/email and password are required.",
      });
    }

    const normalizedIdentifier = identifier.trim().toLowerCase();

    // Allow login using either email or username.
    const user = normalizedIdentifier.includes("@")
      ? await getUserByEmail(normalizedIdentifier)
      : await getUserByUsername(normalizedIdentifier);

    if (!user) {
      return res.status(401).render("login", {
        title: "Login",
        error: "Invalid username/email or password.",
      });
    }

    // Verify the password.
    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).render("login", {
        title: "Login",
        error: "Invalid username/email or password.",
      });
    }

    // Get the user's role name.
    const populatedUser = await user.populate("role", "name");

    if (!populatedUser.role) {
      return res.status(500).render("login", {
        title: "Login",
        error: "User role could not be verified.",
      });
    }

    // Regenerate the session after successful authentication.
    return req.session.regenerate((error) => {
      if (error) {
        console.error("Session regeneration error:", error);

        res.status(500).render("login", {
          title: "Login",
          error: "Unable to start your session. Please try again.",
        });

        return;
      }

      // Store only safe user information in the session.
      req.session.user = {
        id: user._id.toString(),
        displayName: user.displayName,
        username: user.username,
        email: user.email,
        role: populatedUser.role.name,
      };

      req.session.save((saveError) => {
        if (saveError) {
          console.error("Session save error:", saveError);

          res.status(500).render("login", {
            title: "Login",
            error: "Unable to save your session. Please try again.",
          });

          return;
        }

        // Feature Set 2: Redirect admins to the admin dashboard
        if (populatedUser.role.name === "admin") {
          res.redirect("/admin-dashboard");
        } else {
          res.redirect("/dashboard");
        }
      });
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).render("login", {
      title: "Login",
      error: "Unable to log in. Please try again.",
    });
  }
};

// Log out the current user.
export const logoutUser = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Logout error:", error);
      return res.status(500).send("Unable to log out.");
    }

    res.clearCookie("connect.sid");

    return res.redirect("/login");
  });
};