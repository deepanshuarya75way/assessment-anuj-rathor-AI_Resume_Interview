// // const resumeService =
// // require("../services/resume.service");

// // // ========================================
// // // SAVE RESUME
// // // ========================================

// // exports.saveResumeController =
// // async (req, res) => {

// //   try {

// //     const userId =
// //       req.user?.id;

// //     if (!userId) {

// //       return res.status(401)
// //       .json({
// //         success: false,
// //         message: "Unauthorized"
// //       });
// //     }

// //     const resume =
// //       await resumeService
// //       .saveResume(
// //         userId,
// //         req.body
// //       );

// //     return res.json({
// //       success: true,
// //       resume
// //     });

// //   } catch (err) {

// //     console.error(err);

// //     return res.status(500)
// //     .json({
// //       success: false,
// //       message:
// //         "Failed to save resume"
// //     });
// //   }
// // };

// // // ========================================
// // // GET RESUME
// // // ========================================

// // exports.getResumeController =
// // async (req, res) => {

// //   try {

// //     const userId =
// //       req.user?.id;

// //     const resume =
// //       await resumeService
// //       .getResume(userId);

// //     return res.json({
// //       success: true,
// //       resume
// //     });

// //   } catch (err) {

// //     console.error(err);

// //     return res.status(500)
// //     .json({
// //       success: false,
// //       message:
// //         "Failed to fetch resume"
// //     });
// //   }
// // };

// // // ========================================
// // // AI IMPROVE
// // // ========================================

// // exports.improveResumeController =
// // async (req, res) => {

// //   try {

// //     const improved =
// //       await resumeService
// //       .improveResume(
// //         req.body
// //       );

// //     return res.json({
// //       success: true,
// //       resume: improved
// //     });

// //   } catch (err) {

// //     console.error(err);

// //     return res.status(500)
// //     .json({
// //       success: false,
// //       message:
// //         "AI improve failed"
// //     });
// //   }
// // };

// // // ========================================
// // // ATS ANALYZE
// // // ========================================

// // exports.analyzeResumeController =
// // async (req, res) => {

// //   try {

// //     const analysis =
// //       await resumeService
// //       .analyzeResume(
// //         req.body
// //       );

// //     return res.json({
// //       success: true,
// //       analysis
// //     });

// //   } catch (err) {

// //     console.error(err);

// //     return res.status(500)
// //     .json({
// //       success: false,
// //       message:
// //         "ATS analysis failed"
// //     });
// //   }
// // };

// // // ========================================
// // // PDF GENERATION
// // // ========================================

// // exports.generateResumePdfController =
// // async (req, res) => {

// //   try {

// //     const pdfBuffer =
// //       await resumeService
// //       .generateResumePDF(
// //         req.body
// //       );

// //     res.set({
// //       "Content-Type":
// //         "application/pdf",

// //       "Content-Disposition":
// //         "attachment; filename=resume.pdf"
// //     });

// //     return res.send(
// //       pdfBuffer
// //     );

// //   } catch (err) {

// //     console.error(
// //       "PDF ERROR:",
// //       err
// //     );

// //     return res.status(500)
// //     .json({
// //       success: false,
// //       message:
// //         "PDF generation failed"
// //     });
// //   }
// // };

// // // ========================================
// // // REWRITE BULLETS
// // // ========================================

// // exports.rewriteBulletsController =
// // async (req, res) => {

// //   try {

// //     const bullets =
// //       await resumeService
// //       .rewriteBullets(
// //         req.body
// //       );

// //     return res.json({
// //       success: true,
// //       bullets
// //     });

// //   } catch (err) {

// //     console.error(err);

// //     return res.status(500)
// //     .json({
// //       success: false,
// //       message:
// //         "Rewrite failed"
// //     });
// //   }
// // };

// // // ========================================
// // // GENERATE SUMMARY
// // // ========================================

// // exports.generateSummaryController =
// // async (req, res) => {

// //   try {

// //     const summary =
// //       await resumeService
// //       .generateSummary(
// //         req.body
// //       );

// //     return res.json({
// //       success: true,
// //       summary
// //     });

// //   } catch (err) {

// //     console.error(err);

// //     return res.status(500)
// //     .json({
// //       success: false,
// //       message:
// //         "Summary failed"
// //     });
// //   }
// // };

// // // ========================================
// // // SUGGEST SKILLS
// // // ========================================

// // exports.suggestSkillsController =
// // async (req, res) => {

// //   try {

// //     const skills =
// //       await resumeService
// //       .suggestSkills(
// //         req.body
// //       );

// //     return res.json({
// //       success: true,
// //       skills
// //     });

// //   } catch (err) {

// //     console.error(err);

// //     return res.status(500)
// //     .json({
// //       success: false,
// //       message:
// //         "Skill suggestion failed"
// //     });
// //   }
// // };

// // // ========================================
// // // AI CHAT ASSISTANT
// // // ========================================

// // exports.chatAssistantController =
// // async (req, res) => {

// //   try {

// //     const reply =
// //       await resumeService
// //       .chatAssistant(
// //         req.body
// //       );

// //     return res.json({
// //       success: true,
// //       reply
// //     });

// //   } catch (err) {

// //     console.error(err);

// //     return res.status(500)
// //     .json({
// //       success: false,
// //       message:
// //         "Chat assistant failed"
// //     });
// //   }
// // };


// // ============================================================
// // resume.controller.js — Complete controller with all features
// // ============================================================

// const resumeService = require("../services/resume.service");

// // ── Shared error handler ──────────────────────────────────
// function handleError(res, err, message, status = 500) {
//   console.error(`[ResumeController] ${message}:`, err?.message || err);
//   return res.status(status).json({ success: false, message });
// }

// // ============================================================
// // SAVE / UPSERT RESUME
// // ============================================================

// exports.saveResumeController = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

//     const resume = await resumeService.saveResume(userId, req.body);
//     return res.json({ success: true, resume });
//   } catch (err) {
//     return handleError(res, err, "Failed to save resume");
//   }
// };

// // ============================================================
// // GET RESUME
// // ============================================================

// exports.getResumeController = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

//     const resume = await resumeService.getResume(userId);
//     return res.json({ success: true, resume });
//   } catch (err) {
//     return handleError(res, err, "Failed to fetch resume");
//   }
// };

// // ============================================================
// // AI IMPROVE — Full resume optimization
// // ============================================================

// exports.improveResumeController = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

//     const improved = await resumeService.improveResume(req.body);
//     return res.json({ success: true, resume: improved });
//   } catch (err) {
//     return handleError(res, err, "AI improve failed");
//   }
// };

// // ============================================================
// // ATS ANALYZE
// // ============================================================

// exports.analyzeResumeController = async (req, res) => {
//   try {
//     const { resume, jobDescription = "" } = req.body;

//     if (!resume) {
//       return res.status(400).json({ success: false, message: "Resume data required" });
//     }

//     const analysis = await resumeService.analyzeResume({ resume, jobDescription });
//     return res.json({ success: true, analysis });
//   } catch (err) {
//     return handleError(res, err, "ATS analysis failed");
//   }
// };

// // ============================================================
// // PDF GENERATION
// // ============================================================

// exports.generateResumePdfController = async (req, res) => {
//   try {
//     const pdfBuffer = await resumeService.generateResumePDF(req.body);

//     res.set({
//       "Content-Type": "application/pdf",
//       "Content-Disposition": `attachment; filename="${req.body.name || "resume"}.pdf"`,
//       "Cache-Control": "no-cache"
//     });

//     return res.send(pdfBuffer);
//   } catch (err) {
//     console.error("[PDF] Generation error:", err);
//     return handleError(res, err, "PDF generation failed");
//   }
// };

// // ============================================================
// // REWRITE BULLETS
// // ============================================================

// exports.rewriteBulletsController = async (req, res) => {
//   try {
//     if (!req.body.resume) {
//       return res.status(400).json({ success: false, message: "Resume data required" });
//     }

//     const result = await resumeService.rewriteBullets(req.body);
//     return res.json({ success: true, ...result });
//   } catch (err) {
//     return handleError(res, err, "Bullet rewrite failed");
//   }
// };

// // ============================================================
// // GENERATE SUMMARY
// // ============================================================

// exports.generateSummaryController = async (req, res) => {
//   try {
//     if (!req.body.resume) {
//       return res.status(400).json({ success: false, message: "Resume data required" });
//     }

//     const summary = await resumeService.generateSummary(req.body);
//     return res.json({ success: true, summary });
//   } catch (err) {
//     return handleError(res, err, "Summary generation failed");
//   }
// };

// // ============================================================
// // SUGGEST SKILLS
// // ============================================================

// exports.suggestSkillsController = async (req, res) => {
//   try {
//     if (!req.body.resume) {
//       return res.status(400).json({ success: false, message: "Resume data required" });
//     }

//     const skills = await resumeService.suggestSkills(req.body);
//     return res.json({ success: true, skills });
//   } catch (err) {
//     return handleError(res, err, "Skill suggestion failed");
//   }
// };

// // ============================================================
// // AI CHAT ASSISTANT
// // ============================================================

// exports.chatAssistantController = async (req, res) => {
//   try {
//     const { resume, message, history } = req.body;

//     if (!message?.trim()) {
//       return res.status(400).json({ success: false, message: "Message is required" });
//     }

//     const reply = await resumeService.chatAssistant({ resume, message, history });
//     return res.json({ success: true, reply });
//   } catch (err) {
//     return handleError(res, err, "Chat assistant failed");
//   }
// };

// // ============================================================
// // GENERATE COVER LETTER
// // ============================================================

// exports.generateCoverLetterController = async (req, res) => {
//   try {
//     const { resume, jobDescription, companyName } = req.body;

//     if (!resume || !jobDescription) {
//       return res.status(400).json({
//         success: false,
//         message: "Resume and job description are required"
//       });
//     }

//     const coverLetter = await resumeService.generateCoverLetter({
//       resume, jobDescription, companyName
//     });

//     return res.json({ success: true, coverLetter });
//   } catch (err) {
//     return handleError(res, err, "Cover letter generation failed");
//   }
// };

// // ============================================================
// // PREDICT INTERVIEW CHANCE
// // ============================================================

// exports.predictInterviewChanceController = async (req, res) => {
//   try {
//     const { resume, jobDescription } = req.body;

//     if (!resume || !jobDescription) {
//       return res.status(400).json({
//         success: false,
//         message: "Resume and job description are required"
//       });
//     }

//     const prediction = await resumeService.predictInterviewChance({ resume, jobDescription });
//     return res.json({ success: true, prediction });
//   } catch (err) {
//     return handleError(res, err, "Interview prediction failed");
//   }
// };


// ============================================================
// resume.controller.js — Fixed & complete
// FIX: improveResume now passes userId guard (was missing in original)
// FIX: generateResumePdfController checks for body presence
// ============================================================

const resumeService = require("../services/resume.service");

// ── Shared error handler ──────────────────────────────────────
function handleError(res, err, message, status = 500) {
  console.error(`[ResumeController] ${message}:`, err?.message || err);
  return res.status(status).json({ success: false, message });
}

// ============================================================
// SAVE / UPSERT RESUME
// ============================================================

exports.saveResumeController = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const resume = await resumeService.saveResume(userId, req.body);
    return res.json({ success: true, resume });
  } catch (err) {
    return handleError(res, err, "Failed to save resume");
  }
};

// ============================================================
// GET RESUME
// ============================================================

exports.getResumeController = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const resume = await resumeService.getResume(userId);
    return res.json({ success: true, resume });
  } catch (err) {
    return handleError(res, err, "Failed to fetch resume");
  }
};

// ============================================================
// AI IMPROVE
// FIX: added body validation
// ============================================================

exports.improveResumeController = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: "Resume data required" });
    }

    const improved = await resumeService.improveResume(req.body);
    return res.json({ success: true, resume: improved });
  } catch (err) {
    return handleError(res, err, "AI improve failed");
  }
};

// ============================================================
// ATS ANALYZE
// ============================================================

exports.analyzeResumeController = async (req, res) => {
  try {
    const { resume, jobDescription = "" } = req.body;

    if (!resume) {
      return res.status(400).json({ success: false, message: "Resume data required" });
    }

    const analysis = await resumeService.analyzeResume({ resume, jobDescription });
    return res.json({ success: true, analysis });
  } catch (err) {
    return handleError(res, err, "ATS analysis failed");
  }
};

// ============================================================
// PDF GENERATION
// FIX: validate body is present
// ============================================================

exports.generateResumePdfController = async (req, res) => {
  try {
    if (!req.body || !req.body.name) {
      return res.status(400).json({ success: false, message: "Resume data required" });
    }

    const pdfBuffer = await resumeService.generateResumePDF(req.body);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${req.body.name || "resume"}.pdf"`,
      "Cache-Control": "no-cache"
    });

    return res.send(pdfBuffer);
  } catch (err) {
    console.error("[PDF] Generation error:", err);
    return handleError(res, err, "PDF generation failed");
  }
};

// ============================================================
// REWRITE BULLETS
// ============================================================

exports.rewriteBulletsController = async (req, res) => {
  try {
    if (!req.body.resume) {
      return res.status(400).json({ success: false, message: "Resume data required" });
    }

    const result = await resumeService.rewriteBullets(req.body);
    return res.json({ success: true, ...result });
  } catch (err) {
    return handleError(res, err, "Bullet rewrite failed");
  }
};

// ============================================================
// GENERATE SUMMARY
// ============================================================

exports.generateSummaryController = async (req, res) => {
  try {
    if (!req.body.resume) {
      return res.status(400).json({ success: false, message: "Resume data required" });
    }

    const summary = await resumeService.generateSummary(req.body);
    return res.json({ success: true, summary });
  } catch (err) {
    return handleError(res, err, "Summary generation failed");
  }
};

// ============================================================
// SUGGEST SKILLS
// ============================================================

exports.suggestSkillsController = async (req, res) => {
  try {
    if (!req.body.resume) {
      return res.status(400).json({ success: false, message: "Resume data required" });
    }

    const skills = await resumeService.suggestSkills(req.body);
    return res.json({ success: true, skills });
  } catch (err) {
    return handleError(res, err, "Skill suggestion failed");
  }
};

// ============================================================
// AI CHAT ASSISTANT
// ============================================================

exports.chatAssistantController = async (req, res) => {
  try {
    const { resume, message, history } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const reply = await resumeService.chatAssistant({ resume, message, history });
    return res.json({ success: true, reply });
  } catch (err) {
    return handleError(res, err, "Chat assistant failed");
  }
};

// ============================================================
// GENERATE COVER LETTER
// ============================================================

exports.generateCoverLetterController = async (req, res) => {
  try {
    const { resume, jobDescription, companyName } = req.body;

    if (!resume || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: "Resume and job description are required"
      });
    }

    const coverLetter = await resumeService.generateCoverLetter({
      resume, jobDescription, companyName
    });

    return res.json({ success: true, coverLetter });
  } catch (err) {
    return handleError(res, err, "Cover letter generation failed");
  }
};

// ============================================================
// PREDICT INTERVIEW CHANCE
// ============================================================

exports.predictInterviewChanceController = async (req, res) => {
  try {
    const { resume, jobDescription } = req.body;

    if (!resume || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: "Resume and job description are required"
      });
    }

    const prediction = await resumeService.predictInterviewChance({ resume, jobDescription });
    return res.json({ success: true, prediction });
  } catch (err) {
    return handleError(res, err, "Interview prediction failed");
  }
};
