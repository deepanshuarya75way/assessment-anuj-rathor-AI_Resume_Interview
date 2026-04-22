const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY
});

async function generateWithGemini(prompt) {
  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  return res.text;
}

module.exports = { generateWithGemini };