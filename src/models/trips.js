import Trip from "./schemas/trips.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getTripById(id) {
  return Trip.findOne({ id }).lean();
}

export async function getAllTrips(page = 1, limit = 10, filters = {}) {
  const skip = (page - 1) * limit;
  const query = {};

  if (filters.region) {
    query.region = filters.region;
  }

  if (filters.season) {
    query.bestSeason = filters.season;
  }

  if (filters.q) {
    const searchRegex = escapeRegex(filters.q);

    query.$or = [
      { name: { $regex: searchRegex, $options: "i" } },
      { description: { $regex: searchRegex, $options: "i" } },
    ];
  }

  const [trips, totalItems] = await Promise.all([
    Trip.find(query).sort({ name: 1 }).skip(skip).limit(limit).lean(),
    Trip.countDocuments(query),
  ]);

  return {
    trips,
    totalItems,
  };
}

export async function getTripFilterOptions() {
  const [regions, seasons] = await Promise.all([
    Trip.distinct("region"),
    Trip.distinct("bestSeason"),
  ]);

  return { regions, seasons };
}
