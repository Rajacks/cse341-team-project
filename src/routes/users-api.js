import { Router } from "express";

import {
  getUsersApi,
  updateUserApi,
  deleteUserApi,
} from "../controllers/users.js";

import { requireApiLogin } from "../middleware/auth.js";

const router = Router();

// All user API endpoints require an authenticated session.
router.use(requireApiLogin);

// GET /api/users
router.get("/", getUsersApi);

// PATCH /api/users/:id
router.patch("/:id", updateUserApi);

// DELETE /api/users/:id
router.delete("/:id", deleteUserApi);

export default router;
