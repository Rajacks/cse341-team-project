import { Router } from "express";
import { getAllBookingsApi } from "../controllers/bookings.js";

const router = Router();

// GET /api/bookings
// #swagger.tags = ['Bookings']
// #swagger.summary = 'Get paginated and filtered bookings'
// #swagger.description = 'Returns a paginated list of passenger bookings with optional ticket class and booking date range filters.'
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
/* #swagger.parameters['ticketClass'] = {
      in: 'query',
      description: 'Filter by ticket class: standard, premium, or first',
      type: 'string'
} */
/* #swagger.parameters['startDate'] = {
      in: 'query',
      description: 'Filter bookings on or after this date (YYYY-MM-DD)',
      type: 'string'
} */
/* #swagger.parameters['endDate'] = {
      in: 'query',
      description: 'Filter bookings on or before this date (YYYY-MM-DD)',
      type: 'string'
} */
/* #swagger.responses[200] = {
      description: 'Successful response with data, applied query filters, and pagination metadata'
} */
/* #swagger.responses[400] = {
      description: 'Invalid pagination, sorting, or filtering query parameters'
} */
/* #swagger.responses[401] = {
      description: 'Unauthorized - authentication required'
} */
/* #swagger.responses[500] = {
      description: 'Internal Server Error'
} */
router.get("/", getAllBookingsApi);

export default router;