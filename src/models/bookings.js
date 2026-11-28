import Booking from "./schemas/booking.js";

// Create a new booking
export async function createBooking(bookingData) {
  const booking = new Booking(bookingData);
  return await booking.save();
}

// Get all bookings
export async function getAllBookings() {
  return await Booking.find({});
}

// Get paginated bookings with total count
export async function getPaginatedBookings({
  filter = {},
  page = 1,
  limit = 10,
  sort = "dateBooked",
  order = -1,
}) {
  const skip = (page - 1) * limit;
  const sortOptions = { [sort]: order };

  const [bookings, totalItems] = await Promise.all([
    Booking.find(filter).sort(sortOptions).skip(skip).limit(limit),
    Booking.countDocuments(filter),
  ]);

  return { bookings, totalItems };
}

// Get booking by ID
export async function getBookingById(id) {
  return await Booking.findById(id);
}