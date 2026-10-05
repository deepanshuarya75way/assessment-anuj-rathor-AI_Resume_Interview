const axios = require("axios");

// 🔥 Reliable fast models
const MODELS = [
  "deepseek/deepseek-chat",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemini-2.0-flash-exp:free",
  "qwen/qwen-2.5-72b-instruct"
];

let modelIndex = 0;

async function generateWithOpenRouter(prompt) {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.openRoute_api_key;
  if (!apiKey) {
    throw new Error("No OpenRouter API key found");
  }

  let lastError = null;

  for (let i = 0; i < MODELS.length; i++) {
    const model = MODELS[(modelIndex + i) % MODELS.length];

    try {
      if (process.env.NODE_ENV !== "production") {
        console.log("🌐 OpenRouter trying model:", model);
      }

      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          timeout: 20000
        }
      );

      const content = res.data?.choices?.[0]?.message?.content;
      if (content && typeof content === "string" && content.trim()) {
        modelIndex = (modelIndex + i + 1) % MODELS.length;
        return content;
      }
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ OpenRouter model ${model} failed:`, err.response?.data?.error?.message || err.message);
    }
  }

  throw lastError || new Error("All OpenRouter models failed");
}

module.exports = { generateWithOpenRouter };