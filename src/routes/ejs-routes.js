import { Router } from "express";
import { bookingPage, processBookingRequest } from "./book.js";
import confirmationPage from "./confirm.js";
import listTripsPage from "./list.js";
import tripDetailsPage from "./details.js";
import { trainsPage } from "./trains.js";
import schedulesPage from "./schedules-page.js";
import bookingsAdminPage from "./bookings-admin-page.js";
import { homePage, aboutPage, testErrorPage } from "./index.js";

const router = Router();

// Home page
router.get("/", homePage);

// About page
router.get("/about", aboutPage);

// Trains page
router.get("/trains", trainsPage);

// Schedules page
router.get("/schedules", schedulesPage);

// Bookings Admin page
router.get("/bookings-admin", bookingsAdminPage);

// Trips list
router.get("/trips", listTripsPage);

// Trip details
router.get("/trips/:tripId", tripDetailsPage);

// Booking page
router.get("/trips/booking/:scheduleId", bookingPage);

// Process booking
router.post("/trips/book", processBookingRequest);

// Booking confirmation
router.get("/trips/confirmation/:confirmationId", confirmationPage);

// Test 500 error page
router.get("/500", testErrorPage);

export default router;