import { useCallback, useEffect, useMemo, useState } from "react";
import {
  calculateAdminStats,
  getAdminSessions,
  getAdminStats,
  terminateAdminSession,
} from "../services/admin.api";

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Unable to load the admin dashboard right now.";

export const useAdmin = () => {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(calculateAdminStats([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [terminatingId, setTerminatingId] = useState("");

  const refreshAdminData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const nextSessions = await getAdminSessions();
      const nextStats = await getAdminStats(nextSessions);

      setSessions(nextSessions);
      setStats(nextStats);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshAdminData();
  }, [refreshAdminData]);

  const handleTerminateSession = useCallback(
    async (sessionId) => {
      if (!sessionId) {
        return;
      }

      try {
        setTerminatingId(sessionId);
        setError("");
        await terminateAdminSession(sessionId);
        await refreshAdminData();
      } catch (terminateError) {
        setError(getErrorMessage(terminateError));
      } finally {
        setTerminatingId("");
      }
    },
    [refreshAdminData]
  );

  const activeSessions = useMemo(
    () => sessions.filter((session) => session.status === "active"),
    [sessions]
  );

  const averageTrustScore = useMemo(() => {
    if (!sessions.length) {
      return 0;
    }

    const totalTrust = sessions.reduce(
      (sum, session) => sum + Number(session.trustScore || 0),
      0
    );

    return Math.round(totalTrust / sessions.length);
  }, [sessions]);

  const violationFeed = useMemo(
    () =>
      sessions
        .flatMap((session) =>
          session.violations.map((violation) => ({
            ...violation,
            sessionId: session.id,
            userName: session.userName,
            userEmail: session.email,
            sessionStatus: session.status,
            trustScore: session.trustScore,
          }))
        )
        .sort(
          (left, right) =>
            new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime()
        )
        .slice(0, 10),
    [sessions]
  );

  return {
    sessions,
    activeSessions,
    stats,
    averageTrustScore,
    violationFeed,
    loading,
    error,
    terminatingId,
    refreshAdminData,
    handleTerminateSession,
  };
};
