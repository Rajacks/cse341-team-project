import mongoose from 'mongoose';
import bookingSchema from './schemas/booking.js';

// Register the model here, exactly as your instructor requested!
const Booking = mongoose.model('Booking', bookingSchema);

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