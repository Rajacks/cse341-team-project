/**
 * Middleware to check whether a user is authenticated.
 */

// Protect API endpoints.
export const requireApiLogin = (req, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  return next();
};

// Protect EJS pages.
export const requirePageLogin = (req, res, next) => {
  if (!req.session?.user) {
    return res.redirect("/login");
  }

  return next();
};

/**
 * Middleware to check whether an authenticated user
 * has the required role.
 */

// Protect API endpoints based on role.
export const requireApiRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.session?.user) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    if (req.session.user.role !== requiredRole) {
      return res.status(403).json({
        message: "You do not have permission to access this resource.",
      });
    }

    return next();
  };
};

// Protect EJS pages based on role.
export const requirePageRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.session?.user) {
      return res.redirect("/login");
    }

    if (req.session.user.role !== requiredRole) {
      return res.status(403).render("errors/403", {
        title: "Access Denied",
      });
    }

    return next();
  };
};
