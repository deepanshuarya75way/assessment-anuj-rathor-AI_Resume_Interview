const resumeService = require("../services/resume.service");

// 🔥 SAVE
exports.saveResumeController = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const resume = await resumeService.saveResume(userId, req.body);

    res.json({ success: true, resume });

  } catch (err) {
    console.error("SAVE ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to save resume" });
  }
};

// 🔥 GET
exports.getResumeController = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const resume = await resumeService.getResume(userId);

    res.json({ success: true, resume });

  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch resume" });
  }
};

// 🔥 AI IMPROVE
exports.improveResumeController = async (req, res) => {
  try {
    const improved = await resumeService.improveResume(req.body);

    res.json({ success: true, resume: improved });

  } catch (err) {
    res.status(500).json({ success: false, message: "AI improve failed" });
  }
};

// 🔥 PDF
exports.generateResumePdfController = async (req, res) => {
  try {
    const pdfBuffer = await resumeService.generateResumePDF(req.body);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=resume.pdf"
    });

    res.send(pdfBuffer);

  } catch (err) {
    console.error("PDF ERROR:", err);
    res.status(500).json({ success: false, message: "PDF failed" });
  }
};

exports.analyzeResumeController = async (req, res) => {
  try {
    const analysis = await resumeService.analyzeResume(req.body);

    res.json({ success: true, analysis });

  } catch (err) {
    console.error("ANALYZE ERROR:", err);
    res.status(500).json({ success: false, message: "Analysis failed" });
  }
};