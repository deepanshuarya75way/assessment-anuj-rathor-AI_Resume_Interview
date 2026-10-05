import api from "../../../utils/api";

const STORAGE_KEY = "candidate-dashboard-report";

const toNumber = (value, fallback = null) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      if (item && typeof item === "object") {
        return item.skill || item.text || item.label || "";
      }

      return "";
    })
    .filter(Boolean);
};

export const normalizeDashboardReport = (payload = {}) => {
  const raw =
    payload?.report ||
    payload?.userReport ||
    payload?.interviewReport ||
    payload?.data ||
    payload;

  const performance = raw?.performance || {};

  return {
    id: raw?._id || raw?.id || "",
    title: raw?.title || "Interview Performance Report",
    score: toNumber(raw?.avgScore ?? raw?.score ?? raw?.matchScore, null),
    status: raw?.status || "completed",
    totalQuestions: toNumber(raw?.totalQuestions ?? raw?.questionCount, null),
    trustScore: toNumber(raw?.trustScore, null),
    performance: {
      clarity: toNumber(performance?.clarity ?? raw?.clarity, null),
      confidence: toNumber(performance?.confidence ?? raw?.confidence, null),
      technical: toNumber(performance?.technical ?? raw?.technical, null),
    },
    recommendation:
      raw?.recommendation ||
      raw?.summary ||
      toArray(raw?.improvements)[0] ||
      "",
    strengths: toArray(raw?.strengths),
    weaknesses: toArray(raw?.weaknesses).length
      ? toArray(raw?.weaknesses)
      : toArray(raw?.improvements),
    suggestions: toArray(raw?.suggestedBulletPoints),
    missingKeywords: toArray(raw?.missingKeywords),
    skillGaps: toArray(raw?.skillGaps),
    createdAt: raw?.createdAt || raw?.updatedAt || null,
  };
};

export const mergeDashboardReport = (currentReport, nextReport) => {
  const current = normalizeDashboardReport(currentReport);
  const next = normalizeDashboardReport(nextReport);

  return {
    ...current,
    ...next,
    title: next.title || current.title,
    score: next.score ?? current.score,
    status: next.status || current.status,
    totalQuestions: next.totalQuestions ?? current.totalQuestions,
    trustScore: next.trustScore ?? current.trustScore,
    recommendation: next.recommendation || current.recommendation,
    performance: {
      clarity: next.performance.clarity ?? current.performance.clarity,
      confidence: next.performance.confidence ?? current.performance.confidence,
      technical: next.performance.technical ?? current.performance.technical,
    },
    strengths: next.strengths.length ? next.strengths : current.strengths,
    weaknesses: next.weaknesses.length ? next.weaknesses : current.weaknesses,
    suggestions: next.suggestions.length ? next.suggestions : current.suggestions,
    missingKeywords: next.missingKeywords.length
      ? next.missingKeywords
      : current.missingKeywords,
    skillGaps: next.skillGaps.length ? next.skillGaps : current.skillGaps,
    createdAt: next.createdAt || current.createdAt,
  };
};

export const readStoredDashboardReport = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? normalizeDashboardReport(JSON.parse(raw)) : null;
  } catch (error) {
    return null;
  }
};

export const writeStoredDashboardReport = (report) => {
  if (typeof window === "undefined") {
    return;
  }

  const normalized = normalizeDashboardReport(report);
  const hasUsefulData =
    normalized.score !== null ||
    Boolean(normalized.recommendation) ||
    normalized.strengths.length > 0 ||
    normalized.weaknesses.length > 0;

  if (!hasUsefulData) {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
};

export const getUserReport = async ({ reportId, sessionId } = {}) => {
  try {
    const response = await api.get("/api/user/report", {
      params: {
        reportId,
        sessionId,
      },
    });

    return normalizeDashboardReport(response.data);
  } catch (error) {
    if ([404, 405].includes(error.response?.status ?? 0) && reportId) {
      const response = await api.get(`/api/interview/report/${reportId}`);
      return normalizeDashboardReport(response.data);
    }

    throw error;
  }
};
