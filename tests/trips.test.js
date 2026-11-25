import { describe, expect, test } from "vitest";
import request from "supertest";
import app from "../app.js";
import { getDb } from "../src/db/connect.js";

describe("GET /api/trips pagination", () => {
  test("returns trips with default pagination metadata", async () => {
    const response = await request(app).get("/api/trips");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.body.trips).toBeInstanceOf(Array);

    expect(response.body.pagination).toEqual({
      page: 1,
      limit: 10,
      totalItems: 6,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });

  test("returns only the requested number of trips", async () => {
    const db = getDb();

    const extraTrips = Array.from({ length: 10 }, (_, index) => ({
      id: `test-trip-${index + 1}`,
      name: `Test Trip ${index + 1}`,
      description: "A test trip for pagination.",
      region: "central",
      startStation: "nagoya",
      endStation: "toyama",
      duration: "2 hours",
      distance: 50,
      highlights: ["Test highlight"],
      bestSeason: "spring",
      operatingMonths: [3, 4, 5],
    }));

    await db.collection("trips").insertMany(extraTrips);

    const response = await request(app).get("/api/trips?page=1&limit=10");

    expect(response.status).toBe(200);
    expect(response.body.trips).toHaveLength(10);
    expect(response.body.pagination.totalItems).toBe(16);
    expect(response.body.pagination.totalPages).toBe(2);
    expect(response.body.pagination.hasNextPage).toBe(true);
    expect(response.body.pagination.hasPreviousPage).toBe(false);
  });

  test("returns the correct second page", async () => {
    const db = getDb();

    const extraTrips = Array.from({ length: 10 }, (_, index) => ({
      id: `second-page-trip-${index + 1}`,
      name: `Second Page Trip ${index + 1}`,
      description: "A test trip for the second page.",
      region: "central",
      startStation: "nagoya",
      endStation: "toyama",
      duration: "2 hours",
      distance: 50,
      highlights: ["Test highlight"],
      bestSeason: "spring",
      operatingMonths: [3, 4, 5],
    }));

    await db.collection("trips").insertMany(extraTrips);

    const response = await request(app).get("/api/trips?page=2&limit=10");

    expect(response.status).toBe(200);
    expect(response.body.trips).toHaveLength(6);
    expect(response.body.pagination.page).toBe(2);
    expect(response.body.pagination.totalItems).toBe(16);
    expect(response.body.pagination.totalPages).toBe(2);
    expect(response.body.pagination.hasNextPage).toBe(false);
    expect(response.body.pagination.hasPreviousPage).toBe(true);
  });

  test("rejects a page number less than 1", async () => {
    const response = await request(app).get("/api/trips?page=0&limit=10");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Page and limit must be positive integers.",
    );
  });

  test("rejects a limit greater than 50", async () => {
    const response = await request(app).get("/api/trips?page=1&limit=100");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Limit cannot exceed 50.");
  });

  test("rejects non-integer pagination values", async () => {
    const response = await request(app).get("/api/trips?page=1.5&limit=10");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Page and limit must be positive integers.",
    );
  });
});
