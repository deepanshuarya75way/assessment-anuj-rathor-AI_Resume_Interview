const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const controller = require("../controllers/resume.controller");

const router = express.Router();

// 🔥 SAVE / UPDATE
router.post("/", authMiddleware, controller.saveResumeController);

// 🔥 GET
router.get("/", authMiddleware, controller.getResumeController);

// 🔥 AI IMPROVE
router.post("/improve", authMiddleware, controller.improveResumeController);

// 🔥 PDF
router.post("/pdf", authMiddleware, controller.generateResumePdfController);

router.post("/analyze", authMiddleware, controller.analyzeResumeController);

module.exports = router;