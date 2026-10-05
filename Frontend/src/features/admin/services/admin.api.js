import api from "../../../utils/api";

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeViolation = (violation = {}, fallbackId) => ({
  id:
    violation._id ||
    `${fallbackId || "violation"}-${violation.type || "event"}-${violation.timestamp || Date.now()}`,
  type: violation.type || "unknown_event",
  severity: toNumber(violation.severity, 0),
  timestamp: violation.timestamp || violation.createdAt || new Date().toISOString(),
});

export const normalizeSession = (session = {}) => ({
  id: session._id || session.id || "",
  userId: session.user?._id || session.user?.id || "",
  userName: session.user?.username || session.user?.name || "Unknown user",
  email: session.user?.email || "No email available",
  mode: session.mode || "real",
  status: session.status || "active",
  trustScore: toNumber(session.trustScore, 0),
  warnings: toNumber(session.warnings, 0),
  violations: Array.isArray(session.violations)
    ? session.violations.map((violation, index) =>
        normalizeViolation(violation, `${session._id || session.id || "session"}-${index}`)
      )
    : [],
  violationsCount: Array.isArray(session.violations)
    ? session.violations.length
    : toNumber(session.warnings, 0),
  createdAt: session.createdAt || null,
  updatedAt: session.updatedAt || null,
  terminationReason: session.terminationReason || session.terminatedReason || null,
});

export const calculateAdminStats = (sessions = []) => {
  const totalUsers = new Set(
    sessions.map((session) => session.userId || session.email || session.userName).filter(Boolean)
  ).size;

  return {
    totalUsers,
    activeSessions: sessions.filter((session) => session.status === "active").length,
    violationsCount: sessions.reduce(
      (total, session) => total + toNumber(session.violationsCount, 0),
      0
    ),
  };
};

export const getAdminSessions = async () => {
  const response = await api.get("/api/admin/sessions");
  const sessions = Array.isArray(response.data)
    ? response.data
    : response.data?.sessions || response.data?.data || [];

  return sessions.map(normalizeSession);
};

export const getAdminStats = async (sessions = []) => {
  try {
    const response = await api.get("/api/admin/stats");
    const rawStats = response.data?.stats || response.data || {};
    const fallbackStats = calculateAdminStats(sessions);

    return {
      totalUsers: toNumber(
        rawStats.totalUsers ?? rawStats.users ?? rawStats.total_users,
        fallbackStats.totalUsers
      ),
      activeSessions: toNumber(
        rawStats.activeSessions ?? rawStats.liveSessions ?? rawStats.active_sessions,
        fallbackStats.activeSessions
      ),
      violationsCount: toNumber(
        rawStats.violationsCount ?? rawStats.violations ?? rawStats.totalViolations,
        fallbackStats.violationsCount
      ),
    };
  } catch (error) {
    if ([404, 405].includes(error.response?.status ?? 0)) {
      return calculateAdminStats(sessions);
    }

    throw error;
  }
};

export const terminateAdminSession = async (
  sessionId,
  reason = "Terminated by admin"
) => {
  try {
    const response = await api.post(`/api/admin/terminate/${sessionId}`, {
      reason,
    });

    return response.data;
  } catch (error) {
    if ([404, 405].includes(error.response?.status ?? 0)) {
      const response = await api.post("/api/admin/terminate", {
        sessionId,
        reason,
      });

      return response.data;
    }

    throw error;
  }
};
