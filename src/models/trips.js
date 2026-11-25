import Trip from "./schemas/trips.js";

export async function getTripById(id) {
  return Trip.findOne({ id }).lean();
}

export async function getAllTrips(page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [trips, totalItems] = await Promise.all([
    Trip.find({}).sort({ name: 1 }).skip(skip).limit(limit).lean(),

    Trip.countDocuments({}),
  ]);

  return {
    trips,
    totalItems,
  };
}
