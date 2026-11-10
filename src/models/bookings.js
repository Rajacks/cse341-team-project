import Booking from './schemas/booking.js';

// Create a new booking
export async function createBooking(bookingData) {
  try {
    const booking = new Booking(bookingData);
    return await booking.save();
  } catch (error) {
    throw error;
  }
}

// Get all bookings
export async function getAllBookings() {
  try {
    return await Booking.find({});
  } catch (error) {
    throw error;
  }
}

// Get booking by ID
export async function getBookingById(id) {
  try {
    return await Booking.findById(id);
  } catch (error) {
    throw error;
  }
}