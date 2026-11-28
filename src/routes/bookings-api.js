import { Router } from "express";
import { getAllBookingsApi } from "../controllers/bookings.js";

const router = Router();

// GET /api/bookings
// #swagger.tags = ['Bookings']
// #swagger.summary = 'Get paginated bookings'
// #swagger.description = 'Returns a paginated list of passenger bookings sorted by booking date by default.'
/* #swagger.parameters['page'] = {
      in: 'query',
      description: 'Page number to retrieve (default: 1)',
      type: 'integer'
} */
/* #swagger.parameters['limit'] = {
      in: 'query',
      description: 'Number of bookings per page (default: 10, max: 50)',
      type: 'integer'
} */
/* #swagger.parameters['sort'] = {
      in: 'query',
      description: 'Field to sort by: dateBooked, passengerName, ticketClass, numTickets (default: dateBooked)',
      type: 'string'
} */
/* #swagger.parameters['order'] = {
      in: 'query',
      description: 'Sort direction: asc or desc (default: desc)',
      type: 'string'
} */
/* #swagger.responses[200] = {
      description: 'Successful paginated response with data and pagination metadata'
} */
/* #swagger.responses[400] = {
      description: 'Invalid pagination or sorting query parameters'
} */
/* #swagger.responses[401] = {
      description: 'Unauthorized - authentication required'
} */
/* #swagger.responses[500] = {
      description: 'Internal Server Error'
} */
router.get("/", getAllBookingsApi);

export default router;