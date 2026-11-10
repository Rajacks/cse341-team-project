import {
  getTripById as findTripById,
  getAllTrips as findAllTrips,
} from "../models/trips.js";

export const getAllTrips = async (req, res, next) => {
  try {
    const trips = await findAllTrips();
    return res.json({ trips });
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
