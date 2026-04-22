const Resume = require("../Models/resume.model");
const { generateResumePdf, safeParseJSON } = require("./ai.service");
const { generateAI } = require("./ai.engine");
// 🔥 CREATE / UPDATE
const PDFDocument = require("pdfkit");

async function saveResume(userId, data) {
  let resume = await Resume.findOne({ user: userId });

  if (resume) {
    resume.set(data); // ✅ safer than Object.assign
    await resume.save();
  } else {
    resume = await Resume.create({ user: userId, ...data });
  }
  return resume;
}

// 🔥 GET USER RESUME
async function getResume(userId) {
  return await Resume.findOne({ user: userId }).lean(); // ✅ performance
}

// 🔥 AI IMPROVE
async function improveResume(data) {
  const prompt = `
Improve this resume to be ATS optimized.

Return FULL JSON:

{
  "name": "",
  "summary": "",
  "skills": [],
  "projects": [],
  "experience": [],
  "education": []
}

Rules:
- improve bullet points with impact
- use action verbs
- add metrics (%, numbers)
- optimize for ATS keywords

Resume:
${JSON.stringify(data)}
`;

  const text = await generateAI(prompt);

  const parsed = safeParseJSON(text); // ✅ SAFE PARSE

  return parsed || data;
}

// 🔥 GENERATE PDF

async function generateResumePDF(data) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 40 });

    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    // 🔥 HEADER
    doc.fontSize(20).text(data.name || "", { bold: true });
    doc.fontSize(12).text(`${data.role || ""}`);
    doc.text(`${data.email || ""} | ${data.phone || ""}`);
    doc.moveDown();

    // 🔥 SUMMARY
    if (data.summary) {
      doc.fontSize(14).text("Summary", { underline: true });
      doc.fontSize(11).text(data.summary);
      doc.moveDown();
    }

    // 🔥 EXPERIENCE
    if (data.experience?.length) {
      doc.fontSize(14).text("Experience", { underline: true });

      data.experience.forEach((job) => {
        doc.fontSize(12).text(`${job.title} - ${job.company}`);
        doc.fontSize(10).text(`${job.startDate} - ${job.endDate}`);

        job.points?.forEach((p) => {
          doc.text(`• ${p}`);
        });

        doc.moveDown();
      });
    }

    // 🔥 PROJECTS
    if (data.projects?.length) {
      doc.fontSize(14).text("Projects", { underline: true });

      data.projects.forEach((proj) => {
        doc.fontSize(12).text(`${proj.name}`);
        doc.text(proj.stack || "");

        proj.points?.forEach((p) => {
          doc.text(`• ${p}`);
        });

        doc.moveDown();
      });
    }

    // 🔥 SKILLS
    if (data.skills?.length) {
      doc.fontSize(14).text("Skills", { underline: true });
      doc.text(data.skills.join(", "));
      doc.moveDown();
    }

    // 🔥 EDUCATION
    if (data.education?.length) {
      doc.fontSize(14).text("Education", { underline: true });

      data.education.forEach((edu) => {
        doc.text(`${edu.degree} - ${edu.school}`);
        doc.text(`${edu.startDate} - ${edu.endDate}`);
        doc.moveDown();
      });
    }

    doc.end();
  });
}

async function analyzeResume(data) {
  const prompt = `
You are an ATS (Applicant Tracking System).

Analyze this resume and return JSON:

{
  "score": number,
  "keywords": ["missing keywords"],
  "suggestions": ["improvement suggestions"]
}

Rules:
- score between 0-100
- identify missing skills
- suggest improvements

Resume:
${JSON.stringify(data)}
`;

  const { generateAI } = require("./ai.engine");
  const { safeParseJSON } = require("./ai.service");

  const text = await generateAI(prompt);

  const parsed = safeParseJSON(text);

  return parsed || {
    score: 60,
    keywords: [],
    suggestions: []
  };
}
module.exports = {
  saveResume,
  getResume,
  improveResume,
  generateResumePDF,
  analyzeResume
};
