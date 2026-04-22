const axios = require("axios");

async function generateWithGroq(prompt) {
  try {
    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7 // ✅ ADD THIS (important)
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.data?.choices?.[0]?.message?.content || null;

  } catch (err) {
    console.error("❌ GROQ FULL ERROR:", err.response?.data || err.message);
    throw err;
  }
}

module.exports = { generateWithGroq };