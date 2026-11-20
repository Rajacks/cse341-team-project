import { describe, expect, test } from "vitest";
import request from "supertest";

import app from "../app.js";

describe("Protected user administration", () => {
  test("GET /api/users rejects unauthenticated requests", async () => {
    const response = await request(app).get("/api/users");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty(
      "message",
      "Authentication required.",
    );
  });

  test("PATCH /api/users/:id rejects unauthenticated requests", async () => {
    const response = await request(app)
      .patch("/api/users/507f1f77bcf86cd799439011")
      .send({ displayName: "Updated Name" });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty(
      "message",
      "Authentication required.",
    );
  });

  test("DELETE /api/users/:id rejects unauthenticated requests", async () => {
    const response = await request(app)
      .delete("/api/users/507f1f77bcf86cd799439011");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty(
      "message",
      "Authentication required.",
    );
  });

  test("GET /users-admin redirects unauthenticated visitors to login", async () => {
    const response = await request(app).get("/users-admin");

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/login");
  });
});
