import { Router } from "express";
import ejsRoutes from "./ejs-routes.js";
import tripsApiRouter from "./trips-api.js";
import schedulesApiRouter from "./schedules-api.js";
import bookingsApiRouter from "./bookings-api.js";
import { trainsApi } from "./trains.js";

const router = Router();

// EJS frontend routes
router.use("/", ejsRoutes);

// Trips API
router.use("/api/trips", tripsApiRouter);

// Schedules API
router.use("/api/schedules", schedulesApiRouter);

// Bookings API
router.use("/api/bookings", bookingsApiRouter);

// Trains API
router.get("/api/trains", trainsApi);

export default router;