const axios = require("axios");

// 🔥 free models rotation
const MODELS = [
  "mistralai/mistral-7b-instruct",
  "meta-llama/llama-3-8b-instruct",
  "openchat/openchat-7b"
];

let modelIndex = 0;

async function generateWithOpenRouter(prompt) {
  const model = MODELS[modelIndex % MODELS.length];
  modelIndex++;

  try {
    console.log("🌐 OpenRouter model:", model);

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
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.data?.choices?.[0]?.message?.content || null;

  } catch (err) {
    console.error("❌ OpenRouter Error:", err.response?.data || err.message);
    throw err;
  }
}

module.exports = { generateWithOpenRouter };