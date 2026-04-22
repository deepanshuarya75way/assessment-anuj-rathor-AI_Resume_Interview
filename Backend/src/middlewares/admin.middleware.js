module.exports = function adminMiddleware(req, res, next) {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin only."
      });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Admin auth error" });
  }
};