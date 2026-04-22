const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const interviewController = require("../controllers/interview.controller")
const upload = require("../middlewares/file.middleware")

const interviewRouter = express.Router()



/**
 * @route POST /api/interview/
 * @description generate new interview report on the basis of user self description,resume pdf and job description.
 * @access private
 */
interviewRouter.post("/", authMiddleware, upload.single("resume"), interviewController.generateInterViewReportController)

/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by interviewId.
 * @access private
 */
interviewRouter.get("/report/:interviewId", authMiddleware, interviewController.getInterviewReportByIdController)


/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user.
 * @access private
 */
interviewRouter.get("/", authMiddleware, interviewController.getAllInterviewReportsController)


/**
 * @route GET /api/interview/resume/pdf
 * @description generate resume pdf on the basis of user self description, resume content and job description.
 * @access private
 */
interviewRouter.post("/resume/pdf/:interviewReportId", authMiddleware, interviewController.generateResumePdfController)


/**
 * 🔥 DELETE ROUTE (ADD THIS)
 */
interviewRouter.delete("/:id", authMiddleware, interviewController.deleteInterviewReport);

// generate more question
interviewRouter.post(
  "/:interviewId/more-questions",
  authMiddleware,
  interviewController.generateMoreQuestions
);

// generate behavioural questions more 
interviewRouter.post(
  "/:interviewId/more-behavioral",
  authMiddleware,
  interviewController.generateMoreBehavioralQuestions
);
// follow up questions
interviewRouter.post(
  "/follow-up",
  authMiddleware,
  interviewController.generateFollowUp
);

// interview - questions and mock
interviewRouter.post(
  "/mock/evaluate",
  authMiddleware,
  interviewController.evaluateMockController
);

// 🔥 for custom test questions
interviewRouter.post(
  "/mock/generate-question",
  authMiddleware,
  interviewController.generateQuestionController
);

// 🔥 ROADMAP UPDATE
interviewRouter.put(
  "/:interviewId/roadmap/:day",
  authMiddleware,
  interviewController.updateRoadmap
);

interviewRouter.post(
  "/live",
  authMiddleware,
  interviewController.liveInterviewController
);

interviewRouter.post(
  "/end",
  authMiddleware,
  interviewController.endInterview
);
module.exports = interviewRouter