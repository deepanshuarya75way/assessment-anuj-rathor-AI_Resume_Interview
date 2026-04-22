let currentIndex = 0;

const providerMap = {
  gemini: require("./providers/gemini").generateWithGemini,
  groq: require("./providers/groq").generateWithGroq,
  openrouter: require("./providers/openrouter").generateWithOpenRouter
};

const providers = [];

if (process.env.GOOGLE_GENAI_API_KEY) providers.push("gemini");
if (process.env.GROQ_API_KEY) providers.push("groq");
if (process.env.OPENROUTER_API_KEY) providers.push("openrouter");

let providerState = {
  gemini: { blockedUntil: 0 },
  groq: { blockedUntil: 0 },
  openrouter: { blockedUntil: 0 }
};

function isAvailable(name) {
  return Date.now() >= (providerState[name]?.blockedUntil || 0);
}

function isQuotaError(err) {
  const msg = typeof err === "string"
    ? err
    : JSON.stringify(err);

  return (
    msg.includes("429") ||
    msg.includes("quota") ||
    msg.includes("RESOURCE_EXHAUSTED")
  );
}

async function generateAI(prompt) {
  if (providers.length === 0) {
    throw new Error("No AI providers configured");
  }

  const MAX_RETRIES = 3;

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
      

        const result = await Promise.race([
          provider(prompt),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 5000)
          )
        ]);

        if (result && typeof result === "string") {
          return result;
        }

      } catch (err) {
        const errorMsg = err.response?.data || err.message;

        console.log(`❌ ${providerName} failed:`, errorMsg);

        if (isQuotaError(errorMsg)) {
          console.log(`⛔ ${providerName} blocked (quota)`);

          providerState[providerName].blockedUntil =
            Date.now() + 5 * 60 * 1000; // 5 min
        } else {
          providerState[providerName].blockedUntil =
            Date.now() + 60 * 1000; // 1 min
        }

        tried++;
      }
    }

    console.log(`🔁 Retry attempt ${retry + 1}/${MAX_RETRIES}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error("All AI providers failed after retries");
}

module.exports = { generateAI };