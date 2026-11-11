import { Router } from "express";
import { getAllBookingsApi } from "../controllers/bookings.js";

const router = Router();

// GET /api/bookings
// #swagger.tags = ['Bookings']
// #swagger.summary = 'Get all bookings'
// #swagger.description = 'Returns a JSON array of all passenger bookings'
/* #swagger.responses[200] = { 
      description: 'Successful response' 
} */
/* #swagger.responses[500] = { 
      description: 'Internal Server Error' 
} */
router.get("/", getAllBookingsApi);

export default router;