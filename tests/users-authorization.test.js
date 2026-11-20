import bcrypt from "bcryptjs";
import { describe, expect, test } from "vitest";
import request from "supertest";

import app from "../app.js";
import { createUser } from "../src/models/users.js";
import { getRoleByName } from "../src/models/roles.js";

const password = "TestPassword123!";

async function createAccount({ displayName, username, email, roleName }) {
  const role = await getRoleByName(roleName);

  if (!role) {
    throw new Error(`Missing test role: ${roleName}`);
  }

  const passwordHash = await bcrypt.hash(password, 4);

  const user = await createUser({
    displayName,
    username,
    email,
    passwordHash,
    role: role._id,
  });

  return {
    id: user._id.toString(),
    displayName,
    username,
    email,
    role: roleName,
  };
}

async function signIn(account) {
  const agent = request.agent(app);

  const response = await agent
    .post("/login")
    .type("form")
    .send({
      identifier: account.username,
      password,
    });

  expect(response.status).toBe(302);

  return agent;
}

describe("User administration authorization", () => {
  test("a standard user sees only their own profile without a password hash", async () => {
    const user = await createAccount({
      displayName: "Test User",
      username: "testuser",
      email: "testuser@example.com",
      roleName: "user",
    });

    await createAccount({
      displayName: "Another User",
      username: "anotheruser",
      email: "anotheruser@example.com",
      roleName: "user",
    });

    const agent = await signIn(user);
    const response = await agent.get("/api/users");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe(user.id);
    expect(response.body[0]).not.toHaveProperty("passwordHash");
  });

  test("a standard user cannot update another user's profile", async () => {
    const user = await createAccount({
      displayName: "Test User",
      username: "testuser",
      email: "testuser@example.com",
      roleName: "user",
    });

    const otherUser = await createAccount({
      displayName: "Another User",
      username: "anotheruser",
      email: "anotheruser@example.com",
      roleName: "user",
    });

    const agent = await signIn(user);
    const response = await agent
      .patch(`/api/users/${otherUser.id}`)
      .send({ displayName: "Unauthorized Change" });

    expect(response.status).toBe(403);
  });

  test("a standard user cannot delete another user's account", async () => {
    const user = await createAccount({
      displayName: "Test User",
      username: "testuser",
      email: "testuser@example.com",
      roleName: "user",
    });

    const otherUser = await createAccount({
      displayName: "Another User",
      username: "anotheruser",
      email: "anotheruser@example.com",
      roleName: "user",
    });

    const agent = await signIn(user);
    const response = await agent.delete(`/api/users/${otherUser.id}`);

    expect(response.status).toBe(403);
  });

  test("a standard user cannot change their role or password hash", async () => {
    const user = await createAccount({
      displayName: "Test User",
      username: "testuser",
      email: "testuser@example.com",
      roleName: "user",
    });

    const agent = await signIn(user);

    const roleResponse = await agent
      .patch(`/api/users/${user.id}`)
      .send({ role: "admin" });

    expect(roleResponse.status).toBe(400);

    const passwordResponse = await agent
      .patch(`/api/users/${user.id}`)
      .send({ passwordHash: "forged-hash" });

    expect(passwordResponse.status).toBe(400);
  });

  test("an administrator can see multiple users and update another user", async () => {
    const admin = await createAccount({
      displayName: "Test Admin",
      username: "testadmin",
      email: "testadmin@example.com",
      roleName: "admin",
    });

    const user = await createAccount({
      displayName: "Test User",
      username: "testuser",
      email: "testuser@example.com",
      roleName: "user",
    });

    const agent = await signIn(admin);

    const listResponse = await agent.get("/api/users");

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.length).toBeGreaterThanOrEqual(2);
    expect(listResponse.body.map((item) => item.id)).toContain(user.id);
    expect(listResponse.body.every((item) => !("passwordHash" in item))).toBe(true);

    const updateResponse = await agent
      .patch(`/api/users/${user.id}`)
      .send({ displayName: "Admin Updated User" });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.displayName).toBe("Admin Updated User");
    expect(updateResponse.body).not.toHaveProperty("passwordHash");
  });
});
