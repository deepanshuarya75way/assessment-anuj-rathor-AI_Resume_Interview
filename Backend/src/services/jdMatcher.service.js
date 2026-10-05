const {
  extractKeywords
} = require("./ai/keywordExtractor");

async function analyzeJobDescription(
  jobDescription
) {

  const extracted =
    await extractKeywords(
      jobDescription
    );

  return {
    keywords: [
      ...extracted.technologies,
      ...extracted.softSkills,
      ...extracted.actionVerbs
    ],

    technologies:
      extracted.technologies,

    responsibilities:
      extracted.responsibilities,

    softSkills:
      extracted.softSkills,

    actionVerbs:
      extracted.actionVerbs
  };
}

module.exports = {
  analyzeJobDescription
};