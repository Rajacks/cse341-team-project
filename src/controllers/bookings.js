import {
  getAllBookings,
  getBookingById,
} from "../models/bookings.js";

// Return bookings as JSON (Filtered by user role)
export const getAllBookingsApi = async (req, res) => {
  try {
    // 1. Check if the user is authenticated
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const user = req.session.user;
    
    // 2. Fetch all bookings from the database
    const allBookings = await getAllBookings();

    // 3. Filter bookings based on role
    if (user.role === "admin") {
      // Admins can see everything
      return res.status(200).json(allBookings);
    } else {
      // Standard users only see bookings matching their email
      const userBookings = allBookings.filter(
        (booking) => booking.passengerEmail === user.email
      );
      return res.status(200).json(userBookings);
    }
    
  } catch (error) {
    console.error("API Error fetching bookings:", error);
    return res.status(500).json({ message: "Error retrieving bookings" });
  }
};

// Return a single booking as JSON
export const getBookingByIdApi = async (req, res) => {
  try {
    const booking = await getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    // Optional Security: Ensure the user owns this specific booking before returning it
    if (req.session && req.session.user && req.session.user.role !== "admin") {
      if (booking.passengerEmail !== req.session.user.email) {
        return res.status(403).json({ message: "Forbidden. You do not have access to this booking." });
      }
    }
    
    return res.status(200).json(booking);
  } catch (error) {
    console.error("API Error fetching booking by ID:", error);
    return res.status(500).json({ message: "Error retrieving booking" });
  }
};