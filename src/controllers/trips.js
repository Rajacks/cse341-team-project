import {
  getTripById as findTripById,
  getAllTrips as findAllTrips,
  getTripFilterOptions,
} from "../models/trips.js";

export const getAllTrips = async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const region =
      typeof req.query.region === "string" ? req.query.region.trim() : "";
    const season =
      typeof req.query.season === "string" ? req.query.season.trim() : "";

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

    if (
      (req.query.q !== undefined && typeof req.query.q !== "string") ||
      (req.query.region !== undefined &&
        typeof req.query.region !== "string") ||
      (req.query.season !== undefined && typeof req.query.season !== "string")
    ) {
      return res.status(400).json({
        message: "Search and filter parameters must be strings.",
      });
    }

    if (q.length > 100 || region.length > 100 || season.length > 100) {
      return res.status(400).json({
        message: "Search and filter parameters cannot exceed 100 characters.",
      });
    }

    const { regions, seasons } = await getTripFilterOptions();

    if (region && !regions.includes(region)) {
      return res.status(400).json({
        message: "Invalid region filter.",
      });
    }

    if (season && !seasons.includes(season)) {
      return res.status(400).json({
        message: "Invalid season filter.",
      });
    }

    const { trips, totalItems } = await findAllTrips(page, limit, {
      q,
      region,
      season,
    });

    const totalPages = Math.ceil(totalItems / limit);

    return res.json({
      trips,
      query: {
        q: q || null,
        region: region || null,
        season: season || null,
      },
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
      return res.status(404).json({
        message: "Trip not found.",
      });
    }

    return res.json({ trip });
  } catch (error) {
    return next(error);
  }
};
