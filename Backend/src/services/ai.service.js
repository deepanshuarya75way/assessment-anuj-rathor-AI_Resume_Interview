const { z } = require("zod")
const pdf = require("html-pdf-node");
const { generateAI } = require("./ai.engine");

// ✅ CLEAN JSON PARSER
function cleanAndParse(text) {
  try {
    if (!text || typeof text !== "string") return null;

    const clean = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // 🔥 FIX: sirf JSON array nikaal
    const match = clean.match(/\[\s*{[\s\S]*}\s*\]/);

    if (!match) {
      console.error("❌ No JSON found:", text);
      return null;
    }

    return JSON.parse(match[0]);

  } catch (err) {
    console.error("❌ JSON PARSE ERROR:", text);
    return null;
  }
}

function safeParseJSON(text) {
  try {
    if (!text || typeof text !== "string") return null;

    const clean = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const match = clean.match(/\{[\s\S]*\}|\[[\s\S]*\]/);

    if (!match) return null;

    return JSON.parse(match[0]);

  } catch (err) {
    console.error("❌ JSON PARSE ERROR:", text);
    return null;
  }
}

function extractHTML(text) {
  if (!text) return null;

  const clean = text
    .replace(/```html/g, "")
    .replace(/```/g, "")
    .trim();

  const match = clean.match(/<div[\s\S]*<\/div>/);

  return match ? match[0] : null;
}

const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    missingKeywords: z.array(z.string()).describe("Important keywords from job description missing in resume"),
    weakProjects: z.array(z.string()).describe("Projects that are weak, irrelevant or poorly explained"),
    improvements: z.array(z.string()).describe("Specific improvements to make resume stronger"),
    suggestedBulletPoints: z.array(z.string()).describe("Optimized resume bullet points tailored for the job"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("A comprehensive, high-scoring master-class model interview response. DO NOT write meta instructions like 'The candidate should explain...'. Write the direct articulate answer explaining core keywords, conceptual mechanics, trade-offs, and examples so the candidate can learn and answer the interviewer directly.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


const prompt = `
You are an expert technical interviewer.

CRITICAL INSTRUCTIONS (DO NOT BREAK):
- Return ONLY valid JSON
- DO NOT return text, explanation, markdown, or code blocks
- DO NOT return arrays of key-value pairs like ["key", value]
- ALWAYS return proper JSON objects
- Every array must contain ONLY objects (no strings, no mixed values)

STRICT JSON FORMAT (FOLLOW EXACTLY):

{
  "title": "string",
  "matchScore": number,
  "missingKeywords": ["string"],
  "weakProjects": ["string"],
  "improvements": ["string"],
  "suggestedBulletPoints": ["string"],
  "technicalQuestions": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],

  "behavioralQuestions": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],

  "skillGaps": [
    {
      "skill": "string",
      "severity": "low | medium | high"
    }
  ],

  "preparationPlan": [
    {
      "day": number,
      "focus": "string",
      "tasks": ["string"]
    }
  ]
}

STRICT REQUIREMENTS:
- technicalQuestions → minimum 5 objects
- behavioralQuestions → minimum 3 objects
- skillGaps → minimum 3 objects
- preparationPlan → between 5 to 7 objects
- tasks MUST be an array of strings (NOT a single string)
- Each object must contain ALL required fields
- For technicalQuestions and behavioralQuestions, the "answer" MUST be a complete, in-depth model answer explaining core keywords and mechanics directly (NEVER start with "The candidate should explain..." or "Discuss...")
- weakProjects MUST contain at least 2 items

FORBIDDEN OUTPUTS:
❌ ["day", 1, "focus", "..."]
❌ "technicalQuestions": ["question", "..."]
❌ stringified JSON
❌ missing fields
❌ null or undefined values

VALID OUTPUT EXAMPLE:
{
  "preparationPlan": [
    {
      "day": 1,
      "focus": "System Design",
      "tasks": ["Learn basics", "Practice problems"]
    }
  ]
}

Candidate Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}
`;

  const text = await generateAI(prompt);
  const parsed = safeParseJSON(text);
  if (!parsed) throw new Error("AI failed");
  return parsed;
}

async function generatePdfFromHtml(htmlContent) {
  try {
    if (!htmlContent) {
      throw new Error("Empty HTML");
    }

    const options = {
      format: "A4",
      printBackground: true,
      margin: {
        top: "10mm",
        bottom: "10mm",
        left: "10mm",
        right: "10mm"
      }
    };

    const file = { content: htmlContent };

    const pdfBuffer = await pdf.generatePdf(file, options);

    return pdfBuffer;

  } catch (error) {
    console.error("❌ PDF GENERATION ERROR:", error);
    throw new Error("PDF generation failed");
  }
}

// 🔥 generate more technical questions

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  try {
    const prompt = `
You are a professional resume designer.

Create a PREMIUM ATS-optimized resume.

STRICT RULES:
- Return ONLY HTML
- DO NOT use markdown
- DO NOT return JSON
- Use clean professional layout
- Use inline CSS only
- Use proper spacing and alignment
- Make it visually appealing but ATS friendly

STRUCTURE:
1. Header (Name + Contact)
2. Professional Summary
3. Skills (clean grouped)
4. Experience (bullet points with impact)
5. Projects (with tech stack)
6. Education
7. Achievements

STYLE:
- Use font-family: Arial
- Use section headings with border-bottom
- Use bullet points
- Highlight numbers (500+, 350+)
- Proper spacing (margin-top: 15px)
- Keep width for A4

Resume Data:
${resume}

Job Description:
${jobDescription}

Self Description:
${selfDescription}

IMPORTANT:
Start directly with <div> and end with </div>
`;
    const text = await generateAI(prompt);

    const html = extractHTML(text);

    if (!html) {
      console.error("❌ RAW AI OUTPUT:", text);

      return await generatePdfFromHtml(`
        <div style="font-family: Arial; padding: 20px;">
          <h1>Resume</h1>
          <p>Failed to generate AI resume. Try again.</p>
        </div>
      `);
    }

    return await generatePdfFromHtml(html);

  } catch (err) {
    console.error("❌ RESUME ERROR:", err);

    return await generatePdfFromHtml(`
      <div style="font-family: Arial; padding: 20px;">
        <h1>Error</h1>
        <p>Resume generation failed.</p>
      </div>
    `);
  }
}

async function generateAIQuestions({ jobDescription, resume, previousQuestions }) {
  try {
    const prompt = `
You are an expert interviewer.

Generate 5 NEW technical interview questions.

STRICT RULES:
- The "answer" field must be a complete, in-depth model answer explaining core keywords and mechanics directly (NEVER start with "The candidate should explain..." or "Discuss...")
- Do NOT repeat previous questions
- Return ONLY JSON
- No explanation, no text

FORMAT:
[
  {
    "question": "string",
    "intention": "string",
    "answer": "string"
  }
]

Previous Questions:
${previousQuestions.map(q => q.question).join("\n")}

Job Description:
${jobDescription}

Resume:
${resume || "N/A"}
`;

     const text = await generateAI(prompt);
    return cleanAndParse(text) || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function generateAIBehavioralQuestions({ jobDescription, previousQuestions }) {
  try {
    const prompt = `
You are an expert interviewer.

Generate 5 NEW behavioral interview questions.

Avoid repeating:
${previousQuestions.map(q => q.question).join("\n")}

Return JSON only:

[
 {
   "question": "",
   "intention": "",
   "answer": ""
 }
]
`;

    const text = await generateAI(prompt);
    return cleanAndParse(text) || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function generateFollowUpQuestions({ question, answer }) {
  try {
    const prompt = `
You are a senior technical interviewer.

Main Question:
"${question}"

Candidate Answer:
"${answer}"

Generate 3 FOLLOW-UP questions.

Rules:
- Focus on weak points in the answer
- Ask edge cases and trade-offs
- Increase difficulty gradually
- Avoid generic questions

Each follow-up must include:
- question
- intention (what interviewer checks)
- answer (ideal answer)

Return JSON:

[
  {
    "question": "",
    "intention": "",
    "answer": ""
  }
]
`;
    const text = await generateAI(prompt);
    return cleanAndParse(text) || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function evaluateMockAnswer({ question, answer }) {
  try {
    const prompt = `
You are a senior interviewer.

Question:
"${question}"

Candidate Answer:
"${answer}"

Evaluate based on:

- Clarity (0-100)
- Confidence (0-100)
- Technical Accuracy (0-100)

Also provide:
- strengths (array)
- improvements (array)

Return JSON:

{
  "clarity": number,
  "confidence": number,
  "technical": number,
  "strengths": [],
  "improvements": []
}
`;
    const text = await generateAI(prompt);

    return cleanAndParse(text);

  } catch (err) {
    console.error(err);
    return null;
  }
}

// mock custom question
 async function generateQuestion({ topic, type, difficulty }) {
  try {
    const prompt = `
You are a senior interviewer.

Generate ONE interview question.

Type: ${type}
Topic: ${topic || "general"}
Difficulty: ${difficulty}

Rules:
- easy → basic concepts
- medium → practical + moderate depth
- hard → advanced + edge cases + system thinking
- Keep it realistic and interview-level

Return JSON:

{
  "question": "string"
}
`;

  const text = await generateAI(prompt);
    const parsed = safeParseJSON(text);
    return {
      question: parsed?.question || `Explain ${topic}`
    };
  } catch (err) {
    console.error(err);
    return {
      question: `Explain ${topic}`
    };
  }
}

async function askAI(prompt, fallback = null) {
  try {
    const text = await generateAI(prompt);
    return text;
  } catch (err) {
    console.error("❌ AI FAILED:", err.message);
    return fallback;
  }
}

async function evaluateLiveInterview({ question, answer, history = [] }) {
  try {
  
    const context = history
      .map(h => `Q: ${h.question}\nA: ${h.answer}`)
      .join("\n");

   const prompt = `
You are a STRICT FAANG-level interviewer.

${context}

Q: ${question}
A: ${answer}

Evaluate VERY critically.

Rules:
- Penalize vague answers
- Reward structured answers
- Be slightly harsh (real interview feel)

Return JSON:

{
  "clarity": number,
  "confidence": number,
  "technical": number,
  "strengths": [],
  "improvements": []
}
`;

    const text = await askAI(prompt);
    const parsed = safeParseJSON(text) || {};

    return {
      clarity: parsed?.clarity ?? 60,
      confidence: parsed?.confidence ?? 60,
      technical: parsed?.technical ?? 60,
      strengths: parsed?.strengths ?? ["Basic understanding"],
      improvements: parsed?.improvements ?? ["Improve explanation"]
    };

  } catch {
    return {
      clarity: 60,
      confidence: 60,
      technical: 60,
      strengths: ["Fallback"],
      improvements: ["Try again"]
    };
  }
}

async function analyzeEmotion(answer) {
  try {
    const prompt = `
Analyze candidate tone.

Answer:
"${answer}"

Return JSON:
{
  "confidenceLevel": "low | medium | high",
  "stressLevel": "low | medium | high"
}
`;

    const text = await generateAI(prompt);
    const parsed = safeParseJSON(text);

    return {
      confidenceLevel: parsed?.confidenceLevel || "medium",
      stressLevel: parsed?.stressLevel || "medium"
    };

  } catch (err) {
    console.error("❌ Emotion Analysis Error:", err);

    return {
      confidenceLevel: "medium",
      stressLevel: "medium"
    };
  }
}

async function evaluateFullInterview({ question, answer, history = [], mode }) {
  try {
    const context = history
      .map(h => `Q: ${h.question}\nA: ${h.answer}`)
      .join("\n");

    const strict = mode === "real"
      ? "Be VERY strict like FAANG interviewer."
      : "Be slightly supportive like a coach.";

    const prompt = `
You are an expert AI interviewer.

${strict}

${context}

Current Question:
${question}

Candidate Answer:
${answer}

Analyze EVERYTHING in ONE GO.

Return JSON:

{
  "feedback": {
    "clarity": number,
    "confidence": number,
    "technical": number,
    "strengths": [],
    "improvements": []
  },
  "emotion": {
    "confidenceLevel": "low | medium | high",
    "stressLevel": "low | medium | high"
  },
  "followUps": [
    {
      "question": "",
      "intention": "",
      "answer": ""
    }
  ]
}
`;

    const text = await generateAI(prompt);
    const parsed = safeParseJSON(text) || {};

    return {
      feedback: parsed.feedback || {
        clarity: 60,
        confidence: 60,
        technical: 60,
        strengths: ["Basic attempt"],
        improvements: ["Improve explanation"]
      },
      emotion: parsed.emotion || {
        confidenceLevel: "medium",
        stressLevel: "medium"
      },
      followUps: parsed.followUps || []
    };

  } catch (err) {
    console.error("AI FULL ERROR:", err);

    return {
      feedback: {
        clarity: 60,
        confidence: 60,
        technical: 60,
        strengths: ["Fallback"],
        improvements: ["Try again"]
      },
      emotion: {
        confidenceLevel: "medium",
        stressLevel: "medium"
      },
      followUps: []
    };
  }
}
module.exports = { generateInterviewReport ,generateAIQuestions,generateAIBehavioralQuestions,generateFollowUpQuestions,
evaluateMockAnswer,
generateQuestion,
evaluateLiveInterview,
analyzeEmotion,
safeParseJSON,
evaluateFullInterview,generateResumePdf
};