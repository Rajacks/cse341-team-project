import {
  getTripById as findTripById,
  getAllTrips as findAllTrips,
} from "../models/trips.js";

export const getAllTrips = async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page < 1 ||
      limit < 1
    ) {
      return res.status(400).json({
        message: "Page and limit must be positive integers.",
      });
    }

    if (limit > 50) {
      return res.status(400).json({
        message: "Limit cannot exceed 50.",
      });
    }

    const { trips, totalItems } = await findAllTrips(page, limit);

    const totalPages = Math.ceil(totalItems / limit);

    return res.json({
      trips,
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
    return next(error);
  }
};

export const getTripById = async (req, res, next) => {
  try {
    const trip = await findTripById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found." });
    }

    return res.json({ trip });
  } catch (error) {
    return next(error);
  }
};
