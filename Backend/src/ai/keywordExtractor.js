const { generateAI } =
require("../services/ai.engine");

const {
  safeParseJSON
} = require("../services/ai.service");

async function extractKeywords(
  jobDescription
) {

  const prompt = `
You are an ATS keyword extractor.

Extract important ATS data.

Return ONLY JSON.

FORMAT:

{
  "technologies": [],
  "softSkills": [],
  "actionVerbs": [],
  "responsibilities": []
}

RULES:
- technologies → React, Node.js, MongoDB
- softSkills → communication, leadership
- actionVerbs → developed, optimized
- responsibilities → build APIs, manage systems

Job Description:
${jobDescription}
`;

  try {

    const text =
      await generateAI(prompt);

    const parsed =
      safeParseJSON(text);

    return {
      technologies:
        parsed?.technologies || [],

      softSkills:
        parsed?.softSkills || [],

      actionVerbs:
        parsed?.actionVerbs || [],

      responsibilities:
        parsed?.responsibilities || []
    };

  } catch (err) {

    console.error(
      "KEYWORD EXTRACTION ERROR:",
      err.message
    );

    return {
      technologies: [],
      softSkills: [],
      actionVerbs: [],
      responsibilities: []
    };
  }
}

module.exports = {
  extractKeywords
};