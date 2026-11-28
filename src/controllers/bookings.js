import {
  getPaginatedBookings,
  getBookingById,
} from "../models/bookings.js";

const allowedSortFields = ["dateBooked", "passengerName", "ticketClass", "numTickets"];
const allowedOrders = ["asc", "desc"];
const allowedTicketClasses = ["standard", "premium", "first"];

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

const parseIsoDate = (value, endOfDay = false) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return null;
  }

  const suffix = endOfDay ? "T23:59:59.999Z" : "T00:00:00.000Z";
  const parsed = new Date(`${value.trim()}${suffix}`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

// Return paginated and filtered bookings as JSON (filtered by user role)
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

    // Build MongoDB filter object from validated parameters
    const filter = user.role === "admin" ? {} : { passengerEmail: user.email };
    const appliedQuery = {
      sort,
      order: orderParam,
    };

    // Ticket class filter
    if (req.query.ticketClass !== undefined && req.query.ticketClass !== "") {
      if (typeof req.query.ticketClass !== "string") {
        return res.status(400).json({
          errors: [{ field: "ticketClass", message: "ticketClass must be a string." }],
        });
      }

      const normalizedClass = req.query.ticketClass.trim().toLowerCase();
      if (!allowedTicketClasses.includes(normalizedClass)) {
        return res.status(400).json({
          errors: [
            {
              field: "ticketClass",
              message: `ticketClass must be one of: ${allowedTicketClasses.join(", ")}.`,
            },
          ],
        });
      }

      filter.ticketClass = new RegExp(`^${normalizedClass}$`, "i");
      appliedQuery.ticketClass = normalizedClass;
    }

    // Booking date range filter
    let parsedStartDate = null;
    let parsedEndDate = null;

    if (req.query.startDate !== undefined && req.query.startDate !== "") {
      parsedStartDate = parseIsoDate(req.query.startDate, false);
      if (!parsedStartDate) {
        return res.status(400).json({
          errors: [{ field: "startDate", message: "startDate must be a valid YYYY-MM-DD date." }],
        });
      }
      appliedQuery.startDate = req.query.startDate.trim();
    }

    if (req.query.endDate !== undefined && req.query.endDate !== "") {
      parsedEndDate = parseIsoDate(req.query.endDate, true);
      if (!parsedEndDate) {
        return res.status(400).json({
          errors: [{ field: "endDate", message: "endDate must be a valid YYYY-MM-DD date." }],
        });
      }
      appliedQuery.endDate = req.query.endDate.trim();
    }

    if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
      return res.status(400).json({
        errors: [
          {
            field: "dateRange",
            message: "startDate cannot be after endDate.",
          },
        ],
      });
    }

    if (parsedStartDate || parsedEndDate) {
      filter.dateBooked = {};
      if (parsedStartDate) {
        filter.dateBooked.$gte = parsedStartDate;
      }
      if (parsedEndDate) {
        filter.dateBooked.$lte = parsedEndDate;
      }
    }

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
      query: appliedQuery,
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