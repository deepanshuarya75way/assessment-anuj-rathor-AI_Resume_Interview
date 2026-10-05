let currentIndex = 0;

const providerMap = {
  groq: require("./providers/groq").generateWithGroq,
  openrouter: require("./providers/openrouter").generateWithOpenRouter,
  gemini: require("./providers/gemini").generateWithGemini
};

// 🔥 PRIORITY ORDER (FAST → SLOW)
const providers = [];

if (process.env.GROQ_API_KEY) providers.push("groq");
if (process.env.OPENROUTER_API_KEY || process.env.openRoute_api_key) providers.push("openrouter");
if (process.env.GOOGLE_GENAI_API_KEY) providers.push("gemini");

// ⏱️ Provider-specific timeouts
const TIMEOUTS = {
  groq: 15000,
  openrouter: 20000,
  gemini: 25000
};

let providerState = {
  groq: { blockedUntil: 0 },
  openrouter: { blockedUntil: 0 },
  gemini: { blockedUntil: 0 }
};

function isAvailable(name) {
  return Date.now() >= (providerState[name]?.blockedUntil || 0);
}

function isQuotaError(err) {
  const msg = typeof err === "string" ? err : JSON.stringify(err);

  return (
    msg.includes("429") ||
    msg.includes("quota") ||
    msg.includes("RESOURCE_EXHAUSTED")
  );
}

// 🔥 Optional: trim long prompts (helps Gemini)
function normalizePrompt(prompt) {
  if (typeof prompt !== "string") return "";
  return prompt.length > 6000 ? prompt.slice(0, 6000) : prompt;
}

async function generateAI(prompt) {
  if (providers.length === 0) {
    throw new Error("No AI providers configured");
  }

  const MAX_RETRIES = 3;
  const finalPrompt = normalizePrompt(prompt);

  for (let retry = 0; retry < MAX_RETRIES; retry++) {
    let tried = 0;

    while (tried < providers.length) {
      const providerName = providers[currentIndex % providers.length];
      const provider = providerMap[providerName];

      currentIndex++;

      if (!isAvailable(providerName)) {
        tried++;
        continue;
      }

      try {
        if (process.env.NODE_ENV !== "production") {
          console.log(`⚡ Using: ${providerName}`);
        }

        const start = Date.now();

        const result = await Promise.race([
          provider(finalPrompt),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Timeout")),
              TIMEOUTS[providerName] || 7000
            )
          )
        ]);

        const duration = Date.now() - start;

        if (process.env.NODE_ENV !== "production") {
          console.log(`✅ ${providerName} success in ${duration}ms`);
        }

        if (result && typeof result === "string" && result.trim()) {
          return result;
        }

        throw new Error("Empty response");

      } catch (err) {
        const errorMsg = err.response?.data || err.message;

        console.log(`❌ ${providerName} failed:`, errorMsg);

        // 🔥 Smarter blocking
        if (isQuotaError(errorMsg)) {
          console.log(`⛔ ${providerName} blocked (quota)`);

          providerState[providerName].blockedUntil =
            Date.now() + 5 * 60 * 1000; // 5 min
        } else if (errorMsg === "Timeout") {
          providerState[providerName].blockedUntil =
            Date.now() + 30 * 1000; // 30 sec (short block)
        } else {
          providerState[providerName].blockedUntil =
            Date.now() + 60 * 1000; // 1 min
        }

        tried++;
      }
    }

    console.log(`🔁 Retry attempt ${retry + 1}/${MAX_RETRIES}`);
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  throw new Error("All AI providers failed after retries");
}

module.exports = { generateAI };