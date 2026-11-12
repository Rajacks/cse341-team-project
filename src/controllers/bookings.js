import {
  getAllBookings,
  getBookingById,
  createBooking,
} from "../models/bookings.js";

// Return all bookings as JSON
export const getAllBookingsApi = async (req, res) => {
  try {
    const bookings = await getAllBookings();
    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving bookings" });
  }
};

// Optional: Return a single booking as JSON
export const getBookingByIdApi = async (req, res) => {
  try {
    const booking = await getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving booking" });
  }
};