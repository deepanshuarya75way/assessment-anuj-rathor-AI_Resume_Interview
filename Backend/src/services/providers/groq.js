const axios = require("axios");

const GROQ_MODELS = [
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b"
];

async function generateWithGroq(prompt) {
  let lastError = null;

  for (const model of GROQ_MODELS) {
    try {
      const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.6
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          timeout: 15000
        }
      );

      const content = res.data?.choices?.[0]?.message?.content;
      if (content && typeof content === "string" && content.trim()) {
        return content;
      }
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ Groq model ${model} failed:`, err.response?.data?.error?.message || err.message);
    }
  }

  throw lastError || new Error("All Groq models failed");
}

module.exports = { generateWithGroq };