// // const express = require("express");
// // const authMiddleware = require("../middlewares/auth.middleware");
// // const controller = require("../controllers/resume.controller");

// // const router = express.Router();

// // // 🔥 SAVE / UPDATE
// // router.post("/", authMiddleware, controller.saveResumeController);

// // // 🔥 GET
// // router.get("/", authMiddleware, controller.getResumeController);

// // // 🔥 AI IMPROVE
// // router.post("/improve", authMiddleware, controller.improveResumeController);

// // // 🔥 PDF
// // router.post("/pdf", authMiddleware, controller.generateResumePdfController);

// // router.post("/analyze", authMiddleware, controller.analyzeResumeController);

// // router.post(
// //   "/rewrite-bullets",
// //   authMiddleware,
// //   controller.rewriteBulletsController
// // );

// // router.post(
// //   "/generate-summary",
// //   authMiddleware,
// //   controller.generateSummaryController
// // );

// // router.post(
// //   "/suggest-skills",
// //   authMiddleware,
// //   controller.suggestSkillsController
// // );

// // router.post(
// //   "/chat",
// //   authMiddleware,
// //   controller.chatAssistantController
// // );
// // module.exports = router;


// // ============================================================
// // resume.routes.js — All resume endpoints
// // ============================================================

// const express = require("express");
// const authMiddleware = require("../middlewares/auth.middleware");
// const controller = require("../controllers/resume.controller");

// const router = express.Router();

// // ── Core CRUD ────────────────────────────────────────────────
// router.get("/", authMiddleware, controller.getResumeController);
// router.post("/", authMiddleware, controller.saveResumeController);

// // ── AI Features ──────────────────────────────────────────────
// router.post("/improve", authMiddleware, controller.improveResumeController);
// router.post("/analyze", authMiddleware, controller.analyzeResumeController);
// router.post("/rewrite-bullets", authMiddleware, controller.rewriteBulletsController);
// router.post("/generate-summary", authMiddleware, controller.generateSummaryController);
// router.post("/suggest-skills", authMiddleware, controller.suggestSkillsController);
// router.post("/chat", authMiddleware, controller.chatAssistantController);

// // ── Advanced AI ───────────────────────────────────────────────
// router.post("/cover-letter", authMiddleware, controller.generateCoverLetterController);
// router.post("/interview-chance", authMiddleware, controller.predictInterviewChanceController);

// // ── Export ───────────────────────────────────────────────────
// router.post("/pdf", authMiddleware, controller.generateResumePdfController);

// module.exports = router;


// ============================================================
// resume.routes.js — Fixed & complete
// FIX: routes ordered correctly (specific before generic)
// ============================================================

const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const controller = require("../controllers/resume.controller");

const router = express.Router();

// ── Core CRUD ─────────────────────────────────────────────────
router.get("/", authMiddleware, controller.getResumeController);
router.post("/", authMiddleware, controller.saveResumeController);

// ── AI Features ───────────────────────────────────────────────
router.post("/improve", authMiddleware, controller.improveResumeController);
router.post("/analyze", authMiddleware, controller.analyzeResumeController);
router.post("/rewrite-bullets", authMiddleware, controller.rewriteBulletsController);
router.post("/generate-summary", authMiddleware, controller.generateSummaryController);
router.post("/suggest-skills", authMiddleware, controller.suggestSkillsController);
router.post("/chat", authMiddleware, controller.chatAssistantController);

// ── Advanced AI ───────────────────────────────────────────────
router.post("/cover-letter", authMiddleware, controller.generateCoverLetterController);
router.post("/interview-chance", authMiddleware, controller.predictInterviewChanceController);

// ── Export ────────────────────────────────────────────────────
router.post("/pdf", authMiddleware, controller.generateResumePdfController);

module.exports = router;
