import { Router } from "express";
import { bookingPage, processBookingRequest } from "./book.js";
import confirmationPage from "./confirm.js";
import listTripsPage from "./list.js";
import tripDetailsPage from "./details.js";
import { trainsPage } from "./trains.js";
import schedulesPage from "./schedules-page.js";
import bookingsAdminPage from "./bookings-admin-page.js";
import { homePage, aboutPage, testErrorPage } from "./index.js";

import { requirePageLogin, requirePageRole } from "../middleware/auth.js";

const router = Router();

// Home page
router.get("/", homePage);

// About page
router.get("/about", aboutPage);

// Authentication pages
router.get("/register", (req, res) => {
  res.render("register", {
    title: "Register",
    error: null,
  });
});

router.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
    error: null,
    registered: req.query.registered === "true",
  });
});

// Protected user dashboard
router.get("/dashboard", requirePageLogin, (req, res) => {
  res.render("dashboard", {
    title: "User Dashboard",
  });
});

// Protected user administration page
router.get("/users-admin", requirePageLogin, (req, res) => {
  res.render("users-admin", {
    title: "User Administration",
  });
});

// Protected administrator dashboard
router.get("/admin-dashboard", requirePageRole("admin"), (req, res) => {
  res.render("admin-dashboard", {
    title: "Admin Dashboard",
  });
});

// Trains page
router.get("/trains", trainsPage);

// Schedules page
router.get("/schedules", schedulesPage);

// Bookings page
router.get("/bookings", bookingsAdminPage);

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
