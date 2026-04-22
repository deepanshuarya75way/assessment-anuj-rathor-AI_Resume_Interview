const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const monitoringController = require("../controllers/monitoring.controller");

// 🔥 Record monitoring event
router.post("/event", authMiddleware, monitoringController.monitorEvent);

// 🔎 Get current session state
router.get("/session/:id", authMiddleware, monitoringController.getSessionState);

// ❤️ Heartbeat (optional but useful)
router.post("/heartbeat", authMiddleware, monitoringController.heartbeat);

module.exports = router;