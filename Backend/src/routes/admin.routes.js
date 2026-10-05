const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");

// 🔐 protect all admin routes
router.use(authMiddleware, adminMiddleware);

// 📊 get all sessions
router.get("/sessions", adminController.getAllSessions);

// 🔍 get one session
router.get("/sessions/:id", adminController.getSessionById);

// 🟢 active sessions
router.get("/sessions-active", adminController.getActiveSessions);

// ⛔ terminate
router.post("/terminate", adminController.terminateSession);

// ⚙️ override
router.post("/override", adminController.overrideSession);

module.exports = router;