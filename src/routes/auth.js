import { Router } from "express";

import { registerUser, loginUser, logoutUser } from "../controllers/auth.js";

const router = Router();

// Registration
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Logout
router.post("/logout", logoutUser);

export default router;
