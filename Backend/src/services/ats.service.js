const { extractKeywords } =
require("../ai/keywordExtractor");

function calculateKeywordMatch(
  resumeText = "",
  keywords = []
) {

  // ✅ SAFETY
  const text =
    String(resumeText || "")
    .toLowerCase();

  const safeKeywords =
    Array.isArray(keywords)
      ? keywords
      : [];

  const matchedKeywords =
    safeKeywords.filter(
      (keyword) =>
        text.includes(
          String(keyword)
          .toLowerCase()
        )
    );

  const missingKeywords =
    safeKeywords.filter(
      (keyword) =>
        !text.includes(
          String(keyword)
          .toLowerCase()
        )
    );

  const keywordMatch =
    safeKeywords.length === 0
      ? 100
      : Math.round(
          (
            matchedKeywords.length /
            safeKeywords.length
          ) * 100
        );

  return {
    keywordMatch,
    matchedKeywords,
    missingKeywords
  };
}

function calculateReadability(
  resume
) {

  const summaryLength =
    resume.summary?.length || 0;

  const bulletCount =
    [
      ...(resume.experience || []),
      ...(resume.projects || [])
    ].reduce(
      (acc, item) =>
        acc +
        (item.points?.length || 0),
      0
    );

  let score = 100;

  if (summaryLength < 50)
    score -= 20;

  if (bulletCount < 5)
    score -= 25;

  return Math.max(score, 0);
}

function calculateFormatting(
  resume
) {

  let score = 100;

  if (!resume.email)
    score -= 10;

  if (!resume.phone)
    score -= 10;

  if (!resume.skills?.length)
    score -= 20;

  if (!resume.projects?.length)
    score -= 20;

  if (!resume.experience?.length)
    score -= 20;

  return Math.max(score, 0);
}

function calculateImpact(
  resume
) {

  const impactWords = [
    "%",
    "improved",
    "increased",
    "reduced",
    "optimized",
    "scaled",
    "developed",
    "engineered"
  ];

  let totalPoints = 0;
  let impactfulPoints = 0;

  [
    ...(resume.experience || []),
    ...(resume.projects || [])
  ].forEach((item) => {

    (item.points || []).forEach(
      (point) => {

        totalPoints++;

        const lower =
          point.toLowerCase();

        if (
          impactWords.some((word) =>
            lower.includes(word)
          )
        ) {
          impactfulPoints++;
        }
      }
    );
  });

  if (totalPoints === 0)
    return 40;

  return Math.round(
    (impactfulPoints /
      totalPoints) *
    100
  );
}

function calculateGrammar(
  resume
) {

  const text = JSON.stringify(
    resume
  );

  let score = 100;

  if (text.includes(" i "))
    score -= 10;

  if (text.includes("worked on"))
    score -= 15;

  if (text.includes("helped"))
    score -= 10;

  return Math.max(score, 0);
}

function generateSuggestions({
  formatting,
  readability,
  impact,
  missingKeywords
}) {

  const suggestions = [];

  if (formatting < 80) {
    suggestions.push(
      "Complete all resume sections for better ATS parsing."
    );
  }

  if (readability < 80) {
    suggestions.push(
      "Add more structured bullet points and improve summary clarity."
    );
  }

  if (impact < 80) {
    suggestions.push(
      "Use measurable achievements and stronger action verbs."
    );
  }

  if (missingKeywords.length) {
    suggestions.push(
      "Add missing keywords from the job description."
    );
  }

  return suggestions;
}

async function analyzeATS({
  resume,
  jobDescription
}) {

  
  const extracted =
    await extractKeywords(
      jobDescription
    );

  const allKeywords = [
    ...extracted.technologies,
    ...extracted.softSkills,
    ...extracted.actionVerbs
  ];

const safeResume =
  resume || {};

const resumeText =
  JSON.stringify(safeResume || {});

  const {
    keywordMatch,
    missingKeywords
  } = calculateKeywordMatch(
    resumeText,
    allKeywords
  );

  const readability =
    calculateReadability(
      safeResume
    );

  const formatting =
    calculateFormatting(
      safeResume
    );

  const impact =
    calculateImpact(
      safeResume
    );

  const grammar =
    calculateGrammar(
      safeResume
    );

  const score =
    Math.round(
      (
        keywordMatch +
        readability +
        formatting +
        impact +
        grammar
      ) / 5
    );

  const suggestions =
    generateSuggestions({
      formatting,
      readability,
      impact,
      missingKeywords
    });

  return {
    score,
    keywordMatch,
    readability,
    formatting,
    impact,
    grammar,

    missingKeywords,

    extractedKeywords:
      extracted,

    suggestions
  };
}

module.exports = {
  analyzeATS
};