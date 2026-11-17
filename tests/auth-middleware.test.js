import { describe, expect, test, vi } from "vitest";

import {
  requireApiLogin,
  requirePageLogin,
  requireApiRole,
  requirePageRole,
} from "../src/middleware/auth.js";

// Helper to create mock Express request and response objects.
const createMocks = (user = null) => {
  const req = {
    session: user ? { user } : {},
  };

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    redirect: vi.fn().mockReturnThis(),
    render: vi.fn().mockReturnThis(),
  };

  const next = vi.fn();

  return { req, res, next };
};

describe("Authentication middleware", () => {
  test("API login returns 401 when user is not authenticated", () => {
    const { req, res, next } = createMocks();

    requireApiLogin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Authentication required.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("API login allows an authenticated user", () => {
    const { req, res, next } = createMocks({
      id: "user-123",
      role: "user",
    });

    requireApiLogin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("Page login redirects unauthenticated users", () => {
    const { req, res, next } = createMocks();

    requirePageLogin(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith("/login");
    expect(next).not.toHaveBeenCalled();
  });

  test("API role returns 403 when user has the wrong role", () => {
    const { req, res, next } = createMocks({
      id: "user-123",
      role: "user",
    });

    requireApiRole("admin")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "You do not have permission to access this resource.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("API role allows a user with the required role", () => {
    const { req, res, next } = createMocks({
      id: "admin-123",
      role: "admin",
    });

    requireApiRole("admin")(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("Page role redirects unauthenticated users", () => {
    const { req, res, next } = createMocks();

    requirePageRole("admin")(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith("/login");
    expect(next).not.toHaveBeenCalled();
  });

  test("Page role blocks users with the wrong role", () => {
    const { req, res, next } = createMocks({
      id: "user-123",
      role: "user",
    });

    requirePageRole("admin")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.render).toHaveBeenCalledWith(
      "errors/403",
      expect.objectContaining({
        title: "Access Denied",
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("Page role allows an administrator", () => {
    const { req, res, next } = createMocks({
      id: "admin-123",
      role: "admin",
    });

    requirePageRole("admin")(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
