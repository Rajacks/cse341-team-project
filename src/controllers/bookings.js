
import {
  getAllBookings,
  getBookingById,
} from "../models/bookings.js";

// Return all bookings as JSON
export const getAllBookingsApi = async (req, res) => {
  try {
    const bookings = await getAllBookings();
    return res.status(200).json(bookings);
  } catch (error) {
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
    return res.status(200).json(booking);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving booking" });
  }
};
