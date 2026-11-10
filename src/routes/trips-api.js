import { Router } from "express";
import { getAllTrips, getTripById } from "../controllers/trips.js";

const router = Router();

router.get("/", getAllTrips);
router.get("/:id", getTripById);

export default router;
