import {
  getPaginatedBookings,
  getBookingById,
} from "../models/bookings.js";

const allowedSortFields = ["dateBooked", "passengerName", "ticketClass", "numTickets"];
const allowedOrders = ["asc", "desc"];

const parsePositiveInteger = (value, defaultValue) => {
  if (value === undefined) {
    return defaultValue;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
};

// Return paginated bookings as JSON (filtered by user role)
export const getAllBookingsApi = async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const page = parsePositiveInteger(req.query.page, 1);
    const limit = parsePositiveInteger(req.query.limit, 10);

    if (!page) {
      return res.status(400).json({
        errors: [{ field: "page", message: "page must be a positive integer." }],
      });
    }

    if (!limit || limit > 50) {
      return res.status(400).json({
        errors: [{ field: "limit", message: "limit must be an integer between 1 and 50." }],
      });
    }

    const sort = req.query.sort || "dateBooked";
    if (!allowedSortFields.includes(sort)) {
      return res.status(400).json({
        errors: [
          {
            field: "sort",
            message: `sort must be one of: ${allowedSortFields.join(", ")}.`,
          },
        ],
      });
    }

    const orderParam = req.query.order ? req.query.order.toLowerCase() : "desc";
    if (!allowedOrders.includes(orderParam)) {
      return res.status(400).json({
        errors: [{ field: "order", message: "order must be 'asc' or 'desc'." }],
      });
    }

    const order = orderParam === "asc" ? 1 : -1;
    const user = req.session.user;

    // Apply role-based filtering in MongoDB so pagination counts stay accurate
    const filter = user.role === "admin" ? {} : { passengerEmail: user.email };

    const { bookings, totalItems } = await getPaginatedBookings({
      filter,
      page,
      limit,
      sort,
      order,
    });

    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      data: bookings,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
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

    if (req.session && req.session.user && req.session.user.role !== "admin") {
      if (booking.passengerEmail !== req.session.user.email) {
        return res
          .status(403)
          .json({ message: "Forbidden. You do not have access to this booking." });
      }
    }

    return res.status(200).json(booking);
  } catch (error) {
    console.error("API Error fetching booking by ID:", error);
    return res.status(500).json({ message: "Error retrieving booking" });
  }
};