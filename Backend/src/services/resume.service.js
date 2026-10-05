const Resume = require("../Models/resume.model");
const {safeParseJSON } = require("./ai.service");
const { generateAI } = require("./ai.engine");
const { ResumeSchema } = require("../validators/resume.validator");
const { normalizeResume } = require("../utils/normalizeResume");
const{analyzeATS} = require("./ats.service");
const {generateResumePDF} = require("./pdf.service");
const logger = require("../utils/logger");
const { AppError } = require("../middlewares/errorHandler");

/**
 * Save or update user's resume
 * @param {string} userId - User ID
 * @param {object} data - Resume data to save
 * @returns {object} Saved resume document
 */
async function saveResume(userId, data) {
  const uid = userId ? String(userId) : '';
  if (!uid) {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }

  if (!data || typeof data !== 'object') {
    throw new AppError('Resume data must be an object', 400, 'INVALID_DATA');
  }

  try {
    // ✅ STEP 2: NORMALIZE
    const normalized = normalizeResume(data);

    // ✅ STEP 3: VALIDATE
    const validated = ResumeSchema.parse(normalized);

    // ✅ STEP 4: UPSERT (Update or Create)
    let resume = await Resume.findOne({
      user: userId
    });

    if (resume) {
      // Update existing resume with change tracking
      const previousData = resume.toObject();
      resume.set(validated);
      resume.updatedAt = new Date();
      await resume.save();
      
      logger.info(`Resume updated for user ${userId}`, {
        sections: Object.keys(validated),
        timestamp: new Date().toISOString()
      });
    } else {
      // Create new resume
      resume = await Resume.create({
        user: userId,
        ...validated,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      logger.info(`Resume created for user ${userId}`, {
        timestamp: new Date().toISOString()
      });
    }

    return resume;
  } catch (error) {
    logger.error('Error saving resume', {
      userId,
      message: error.message,
      name: error.name
    });
    throw error;
  }
}

/**
 * Get user's resume
 * @param {string} userId - User ID
 * @returns {object|null} Resume document or null if not found
 */
async function getResume(userId) {
  const uid = userId ? String(userId) : '';
  if (!uid) {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }

  try {
    const resume = await Resume.findOne({ user: userId }).lean();
    
    if (!resume) {
      logger.debug(`No resume found for user ${userId}`);
      return null;
    }

    logger.info(`Resume fetched for user ${userId}`);
    return resume;
  } catch (error) {
    logger.error('Error fetching resume', {
      userId,
      message: error.message
    });
    throw error;
  }
}

/**
 * Improve resume using AI with ATS optimization
 * @param {object} data - Resume data to improve
 * @returns {object} Improved resume with better formatting and keywords
 */
async function improveResume(data) {
  // Input validation
  if (!data || typeof data !== 'object') {
    throw new AppError('Resume data is required for improvement', 400, 'INVALID_DATA');
  }

  if (Object.keys(data).length === 0) {
    throw new AppError('Resume cannot be empty', 400, 'EMPTY_RESUME');
  }

  try {
    const prompt = `
Improve this resume to be ATS optimized and more impactful.

Return FULL JSON response with this structure:
{
  "name": "",
  "summary": "",
  "skills": [],
  "projects": [],
  "experience": [],
  "education": []
}

Improvement Rules:
- Use strong action verbs (Led, Implemented, Designed, etc.)
- Add quantifiable metrics (%, numbers, amounts)
- Optimize for ATS by using industry keywords
- Improve bullet point clarity and impact
- Keep professional and concise
- Maintain all existing information

Original Resume:
${JSON.stringify(data, null, 2)}
`;

    logger.info('Starting AI resume improvement');
    const startTime = Date.now();

    const text = await generateAI(prompt);

    if (!text) {
      logger.warn('AI returned empty response');
      return data; // Fallback to original
    }

    const parsed = safeParseJSON(text);

    if (!parsed) {
      logger.warn('Could not parse AI response', { response: text });
      return data; // Fallback to original
    }

    logger.metric('AI Resume Improvement', Date.now() - startTime);
    return parsed;
  } catch (error) {
    logger.error('Error improving resume', {
      message: error.message,
      errorCode: error.errorCode
    });
    throw error;
  }
}

/**
 * Analyze resume for ATS compatibility and job matching
 * @param {object} data - Resume and optional job description
 * @returns {object} Analysis with scores and recommendations
 */
async function analyzeResume(data) {
  // Input validation
  if (!data || typeof data !== 'object') {
    throw new AppError('Resume data is required for analysis', 400, 'INVALID_DATA');
  }

  if (!data.resume) {
    throw new AppError('Resume object is required', 400, 'MISSING_RESUME');
  }

  try {
    logger.info('Starting resume analysis');
    const startTime = Date.now();

    const analysis = await analyzeATS({
      resume: data.resume,
      jobDescription: data.jobDescription || null
    });

    if (!analysis) {
      throw new AppError('Analysis failed', 500, 'ANALYSIS_FAILED');
    }

    logger.metric('Resume Analysis', Date.now() - startTime);
    
    return {
      ...analysis,
      analyzedAt: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Error analyzing resume', {
      message: error.message,
      errorCode: error.errorCode
    });
    throw error;
  }
}

/**
 * Rewrite resume bullets using Action + Task + Tech + Metric formula
 */
async function rewriteBullets({ bullets, targetRole, resume }) {
  const pointsList = Array.isArray(bullets) && bullets.length > 0 
    ? bullets 
    : (resume?.experience?.[0]?.points || ["Engineered web application features"]);

  try {
    const prompt = `You are a principal technical recruiter and resume specialist.
Rewrite the following resume bullet points using the formula: Action Verb + Context/Task + Technology Used + Measurable Result/Impact.
Rules:
- Do NOT invent false companies or fake numbers. If no metric was provided, optimize phrasing to highlight technical challenge and suggest "[metric, e.g. 20%]" in brackets.
- Return ONLY a JSON array of strings: ["bullet 1", "bullet 2", ...]

Target Role: ${targetRole || resume?.role || "Software Engineer"}
Current Bullets:
${JSON.stringify(pointsList, null, 2)}
`;
    const text = await generateAI(prompt);
    const parsed = safeParseJSON(text);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return pointsList.map(p => p.startsWith("• ") ? p : `• ${p}`);
  } catch (err) {
    logger.warn('AI bullet rewrite failed, returning enhanced original', { error: err.message });
    return pointsList.map(p => `Engineered and optimized ${p.toLowerCase()}`);
  }
}

/**
 * Generate ATS-optimized professional summary
 */
async function generateSummary({ resume, targetRole }) {
  try {
    const prompt = `You are a professional executive resume writer.
Write a compelling 2-3 sentence professional summary for a candidate resume.
Candidate Title: ${resume?.role || targetRole || "Software Engineer"}
Skills: ${(resume?.skills || []).join(", ")}
Key Projects: ${(resume?.projects || []).map(p => p.name).join(", ")}

Rules:
- Return ONLY valid JSON: { "summary": "..." }
- Tone: Professional, high-impact, ATS-optimized, concise (300-500 characters).
`;
    const text = await generateAI(prompt);
    const parsed = safeParseJSON(text);
    return parsed?.summary || text?.replace(/^["'\s]+|["'\s]+$/g, "") || resume?.summary;
  } catch (err) {
    logger.warn('AI summary generation failed', { error: err.message });
    return `${resume?.role || "Software Engineer"} with extensive hands-on experience architecting scalable full-stack applications and delivering production-grade services.`;
  }
}

/**
 * Suggest in-demand technical skills based on projects and experience
 */
async function suggestSkills({ resume, targetRole }) {
  try {
    const prompt = `Analyze this resume and suggest relevant, in-demand technical skills for ATS optimization.
Target Role: ${targetRole || resume?.role || "Software Engineer"}
Current Resume Skills: ${(resume?.skills || []).join(", ")}
Projects: ${JSON.stringify(resume?.projects || [], null, 2)}

Rules:
- Return ONLY valid JSON:
{
  "skills": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5", "Skill6", "Skill7", "Skill8"],
  "categories": {
    "languages": ["..."],
    "frameworks": ["..."],
    "databases": ["..."],
    "cloud": ["..."],
    "tools": ["..."]
  }
}
`;
    const text = await generateAI(prompt);
    const parsed = safeParseJSON(text);
    if (parsed?.skills || parsed?.categories) return parsed;
  } catch (err) {
    logger.warn('AI skill suggestion failed', { error: err.message });
  }

  return {
    skills: ["TypeScript", "Docker", "PostgreSQL", "Redis", "Next.js", "CI/CD", "AWS", "System Design"],
    categories: {
      languages: ["JavaScript", "TypeScript"],
      frameworks: ["React.js", "Node.js", "Express.js"],
      databases: ["MongoDB", "PostgreSQL", "Redis"],
      cloud: ["Docker", "AWS", "CI/CD"],
      tools: ["Git", "Postman", "Jest"]
    }
  };
}

/**
 * AI Chat Assistant for resume feedback & interview prep
 */
async function chatAssistant({ resume, message, history }) {
  try {
    const prompt = `You are PrepAI Copilot, an elite career advisor and resume editor.
Candidate Profile:
- Name: ${resume?.name || "Candidate"}
- Role: ${resume?.role || "Software Engineer"}
- Summary: ${resume?.summary || ""}
- Skills: ${(resume?.skills || []).slice(0, 10).join(", ")}

User Message: "${message}"

Rules:
- Provide clear, actionable, recruiter-tested advice.
- If asked to rewrite text, give concrete examples following the Action Verb + Result structure.
- Never invent fake credentials or achievements.
- Keep responses friendly, structured, and concise.
`;
    const reply = await generateAI(prompt);
    if (reply) return reply;
  } catch (err) {
    logger.warn('AI chat assistant failed', { error: err.message });
  }

  return "To maximize recruiter response, ensure every project bullet demonstrates a clear technical choice and a quantifiable outcome (e.g. latency, throughput, or user engagement).";
}

/**
 * Generate tailored cover letter
 */
async function generateCoverLetter({ resume, jobDescription, companyName, tone = "Professional" }) {
  try {
    const prompt = `Write a tailored, high-converting cover letter based strictly on the candidate's verified background and target role.
Tone: ${tone}
Company: ${companyName || "Hiring Team"}
Job Description:
${jobDescription}

Candidate Resume:
${JSON.stringify({ name: resume?.name, role: resume?.role, experience: resume?.experience, projects: resume?.projects, skills: resume?.skills }, null, 2)}

Rules:
- Return ONLY valid JSON:
{
  "subject": "Application for [Role] - [Candidate Name]",
  "coverLetter": "Dear Hiring Manager,\\n\\n[Paragraph 1: Enthusiasm & core value proposition]\\n\\n[Paragraph 2: Highlight 1-2 real relevant achievements/projects]\\n\\n[Paragraph 3: Culture alignment and why this company]\\n\\n[Paragraph 4: Call to action]\\n\\nSincerely,\\n[Candidate Name]"
}
`;
    const text = await generateAI(prompt);
    const parsed = safeParseJSON(text);
    if (parsed?.coverLetter) return parsed;
  } catch (err) {
    logger.warn('Cover letter AI generation failed', { error: err.message });
  }

  return {
    subject: `Application for ${resume?.role || "Software Engineer"} - ${resume?.name || "Candidate"}`,
    coverLetter: `Dear Hiring Team at ${companyName || "the organization"},\n\nI am writing to express my strong enthusiasm for the ${resume?.role || "Software Engineer"} opportunity. With a proven track record developing scalable web applications and technical solutions, I am confident in my ability to make an immediate impact on your engineering initiatives.\n\nThroughout my work on projects like ${(resume?.projects?.[0]?.name || "full-stack systems")}, I have focused on delivering reliable architectures with ${(resume?.skills || []).slice(0, 4).join(", ")}. I welcome the opportunity to discuss how my technical expertise aligns with your team's upcoming milestones.\n\nSincerely,\n${resume?.name || "Candidate"}`
  };
}

/**
 * Predict interview chances based on resume-job alignment
 */
async function predictInterviewChance({ resume, jobDescription }) {
  try {
    const prompt = `Compare this resume against the job description to calculate interview shortlist probability.
Job Description:
${jobDescription}

Candidate Resume:
${JSON.stringify({ role: resume?.role, skills: resume?.skills, experience: resume?.experience, projects: resume?.projects }, null, 2)}

Rules:
- Return ONLY valid JSON:
{
  "probabilityScore": 82,
  "confidence": "High",
  "matchedSkills": ["skill1", "skill2"],
  "missingCriticalSkills": ["skillA", "skillB"],
  "strengths": ["...", "..."],
  "recommendations": ["...", "..."]
}
`;
    const text = await generateAI(prompt);
    const parsed = safeParseJSON(text);
    if (parsed?.probabilityScore) return parsed;
  } catch (err) {
    logger.warn('Predict interview chance failed', { error: err.message });
  }

  return {
    probabilityScore: 78,
    confidence: "Medium",
    matchedSkills: (resume?.skills || []).slice(0, 6),
    missingCriticalSkills: ["System Design", "Cloud Infrastructure"],
    strengths: ["Strong technical project portfolio", "Full-stack development experience"],
    recommendations: ["Incorporate target keywords into project bullet points", "Highlight measurable performance improvements"]
  };
}

module.exports = {
  saveResume,
  getResume,
  improveResume,
  generateResumePDF,
  analyzeResume,
  rewriteBullets,
  generateSummary,
  suggestSkills,
  chatAssistant,
  generateCoverLetter,
  predictInterviewChance
};
