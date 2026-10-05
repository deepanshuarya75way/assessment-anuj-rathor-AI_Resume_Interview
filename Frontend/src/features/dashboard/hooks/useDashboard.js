import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getUserReport,
  mergeDashboardReport,
  normalizeDashboardReport,
  readStoredDashboardReport,
  writeStoredDashboardReport,
} from "../services/dashboard.api";

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "We could not load your interview report right now.";

export const useDashboard = ({ reportId = "", sessionId = "", initialData } = {}) => {
  const [report, setReport] = useState(() => {
    if (initialData) {
      return normalizeDashboardReport(initialData);
    }

    return readStoredDashboardReport() || normalizeDashboardReport();
  });
  const [loading, setLoading] = useState(!initialData);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialData) {
      return;
    }

    setReport((currentReport) => mergeDashboardReport(currentReport, initialData));
  }, [initialData]);

  const refreshReport = useCallback(async () => {
    const shouldFetch = Boolean(reportId || sessionId || !initialData);

    if (!shouldFetch) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setIsSyncing(true);
      setError("");

      const nextReport = await getUserReport({ reportId, sessionId });

      setReport((currentReport) => mergeDashboardReport(currentReport, nextReport));
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, [initialData, reportId, sessionId]);

  useEffect(() => {
    void refreshReport();
  }, [refreshReport]);

  useEffect(() => {
    writeStoredDashboardReport(report);
  }, [report]);

  const metrics = useMemo(
    () => [
      {
        key: "clarity",
        label: "Clarity",
        value: report.performance.clarity,
      },
      {
        key: "confidence",
        label: "Confidence",
        value: report.performance.confidence,
      },
      {
        key: "technical",
        label: "Technical Depth",
        value: report.performance.technical,
      },
    ],
    [report]
  );

  const quickStats = useMemo(
    () => [
      {
        key: "questions",
        label: "Questions Answered",
        value: report.totalQuestions,
      },
      {
        key: "trust",
        label: "Trust Score",
        value: report.trustScore,
      },
      {
        key: "status",
        label: "Interview Status",
        value: report.status,
      },
    ],
    [report]
  );

  const hasReport = useMemo(
    () =>
      report.score !== null ||
      Boolean(report.recommendation) ||
      report.totalQuestions !== null ||
      metrics.some((metric) => metric.value !== null),
    [metrics, report]
  );

  return {
    report,
    metrics,
    quickStats,
    hasReport,
    loading,
    isSyncing,
    error,
    refreshReport,
  };
};
