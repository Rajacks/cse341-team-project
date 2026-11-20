import mongoose from "mongoose";
import { afterAll, beforeAll, beforeEach, inject } from "vitest";

import { closeDb, connectToDb, getDb } from "../src/db/connect.js";
import { initializeDatabase } from "../src/db/initialize.js";

process.env.SESSION_SECRET ||= "test-only-session-secret-for-vitest";

const connectionString = inject("MONGODB_TEST_URI");
const databaseName = "kizuna-rail-test";

beforeAll(async () => {
  await connectToDb({
    connectionString,
    databaseName,
  });

  await mongoose.connect(connectionString, {
    dbName: databaseName,
  });
});

beforeEach(async () => {
  const db = getDb();
  await db.dropDatabase();
  await initializeDatabase(db);
});

afterAll(async () => {
  await mongoose.disconnect();
  await closeDb();
});
