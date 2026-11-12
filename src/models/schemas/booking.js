import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    tripId: {
      type: String,
      required: true,
      trim: true,
    },
    passengerName: {
      type: String,
      required: true,
      trim: true,
    },
    passengerEmail: {
      type: String,
      required: true,
      trim: true,
    },
    ticketClass: {
      type: String,
      required: true,
      trim: true,
    },
    numTickets: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    dateBooked: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// The Fix: Compile the schema into a Mongoose Model before exporting
const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;