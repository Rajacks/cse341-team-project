import { Router } from "express";
import { getAllSchedules, getScheduleById } from "../controllers/schedules.js";

const router = Router();

router.get("/", getAllSchedules);
router.get("/:id", getScheduleById);

export default router;
