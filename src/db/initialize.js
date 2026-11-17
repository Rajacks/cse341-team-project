import trips from "./seeds/trips.json" with { type: "json" };
import schedules from "./seeds/schedules.json" with { type: "json" };
import stations from "./seeds/stations.json" with { type: "json" };
import ticketClasses from "./seeds/ticket-classes.json" with { type: "json" };
import trains from "./seeds/trains.json" with { type: "json" };

const starterCollections = [
  ["trips", trips],
  ["schedules", schedules],
  ["stations", stations],
  ["ticketClasses", ticketClasses],
  ["trains", trains],
];

// Safely create standard user roles without deleting existing roles.
const seedRoles = async (db) => {
  if (!db) {
    throw new Error("A database connection is required to seed roles.");
  }

  const roles = db.collection("roles");

  await roles.createIndex({ name: 1 }, { unique: true });

  for (const name of ["admin", "user"]) {
    await roles.updateOne(
      { name },
      {
        $setOnInsert: {
          name,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );
  }
};

const initializeDatabase = async (db) => {
  if (!db) {
    throw new Error("A database connection is required to initialize data.");
  }

  // Initialize the existing starter collections.
  for (const [collectionName, documents] of starterCollections) {
    const collection = db.collection(collectionName);
    await collection.deleteMany({});
    await collection.insertMany(documents);
  }

  // Initialize confirmations.
  const confirmations = db.collection("confirmations");
  await confirmations.deleteMany({});
  await confirmations.createIndex({ id: 1 }, { unique: true });

  // Initialize standard roles.
  await seedRoles(db);
};

export { initializeDatabase, starterCollections, seedRoles };
