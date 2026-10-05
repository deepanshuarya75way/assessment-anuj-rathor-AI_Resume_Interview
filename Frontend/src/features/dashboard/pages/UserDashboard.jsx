import React, { useContext, useMemo } from "react";
import { Link, useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/auth.context";
import PerformanceChart from "../components/PerformanceChart";
import RecommendationBox from "../components/RecommendationBox";
import ScoreCard from "../components/ScoreCard";
import { useDashboard } from "../hooks/useDashboard";
import Navbar from "../../interview/components/Navbar";
import { 
  Sparkles, 
  ArrowRight, 
  Compass, 
  FileText, 
  Mic, 
  RotateCw, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Target
} from "lucide-react";
import "../styles/dashboard.scss";

const buildQuery = (reportId, sessionId) => {
  const params = new URLSearchParams();
  if (reportId) params.set("reportId", reportId);
  if (sessionId) params.set("sessionId", sessionId);
  const query = params.toString();
  return query ? `?${query}` : "";
};

const formatMetricValue = (value) =>
  value === null || value === undefined ? "--" : `${Math.round(value)}%`;

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

export default function UserDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get("reportId") || location.state?.reportId || "";
  const sessionId = searchParams.get("sessionId") || location.state?.sessionId || "";
  const initialData = location.state?.reportSummary || null;

  const {
    report,
    metrics,
    quickStats,
    hasReport,
    loading,
    isSyncing,
    error,
    refreshReport,
  } = useDashboard({
    reportId,
    sessionId,
    initialData,
  });

  const reportLink = `/dashboard/report${buildQuery(reportId, sessionId)}`;
  const profileName = user?.username || user?.email?.split("@")[0] || "Candidate";

  const spotlightMetric = useMemo(() => {
    return metrics.reduce((bestMetric, metric) => {
      if (metric.value === null || metric.value === undefined) {
        return bestMetric;
      }
      if (!bestMetric || Number(metric.value) > Number(bestMetric.value || 0)) {
        return metric;
      }
      return bestMetric;
    }, null);
  }, [metrics]);

  const trustPanelValue =
    report.trustScore === null || report.trustScore === undefined
      ? report.score
      : report.trustScore;

  const readinessValue = useMemo(() => {
    const values = [
      report.score,
      report.trustScore,
      ...metrics.map((metric) => metric.value),
    ]
      .filter((value) => value !== null && value !== undefined)
      .map((value) => Number(value));

    if (!values.length) return 75;
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  }, [metrics, report.score, report.trustScore]);

  const scoreLegend = useMemo(
    () =>
      metrics
        .filter((metric) => metric.value !== null && metric.value !== undefined)
        .slice(0, 2)
        .map((metric, index) => ({
          label: metric.label,
          value: metric.value,
          tone: index === 0 ? "dark" : "soft",
        })),
    [metrics]
  );

  const chartItems = useMemo(
    () => [
      ...metrics,
      {
        key: "overall",
        label: "Overall",
        value: report.score,
      },
    ],
    [metrics, report.score]
  );

  const feedbackSummary =
    report.recommendation ||
    report.strengths[0] ||
    "Complete mock interview sessions to unlock real-time feedback and behavioral coaching notes.";

  const focusLine =
    report.weaknesses[0] ||
    report.suggestions[0] ||
    "Review your recent session report to identify technical gaps and recommended frameworks.";

  return (
    <div className="prepai-dashboard-page">
      <Navbar />

      <main className="prepai-dashboard-shell">
        {/* Banner Alert for Sync Status */}
        {error && !hasReport && (
          <div className="prepai-dash-alert prepai-dash-alert--error">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {error && hasReport && (
          <div className="prepai-dash-alert prepai-dash-alert--warning">
            <AlertCircle size={16} /> Live sync is unavailable right now. Showing the latest saved report.
          </div>
        )}

        {/* Hero Section */}
        <section className="prepai-dash-hero">
          <div className="prepai-dash-hero__content">
            <div className="prepai-dash-hero__eyebrow">
              <span className="hero-pill">
                <Sparkles size={12} /> Intelligent Career Command Center
              </span>
              <span className="hero-status">
                <span className="status-ping" /> System Live
              </span>
            </div>

            <h1 className="prepai-dash-hero__title">
              {getTimeGreeting()}, <span className="highlight-name">{profileName}</span>
            </h1>

            <p className="prepai-dash-hero__subtitle">
              Your career readiness is improving. You are currently prepared for{" "}
              <strong>{readinessValue}%</strong> of your target technical benchmarks.
            </p>
          </div>

          <div className="prepai-dash-hero__actions">
            <button
              type="button"
              className="dash-action-btn dash-action-btn--primary"
              onClick={() => navigate("/")}
            >
              <Compass size={16} /> Continue Prep
            </button>

            <button
              type="button"
              className="dash-action-btn dash-action-btn--secondary"
              onClick={() => navigate("/mock")}
            >
              <Mic size={16} /> Start Mock Session
            </button>

            <button
              type="button"
              className="dash-action-btn dash-action-btn--ghost"
              onClick={() => void refreshReport()}
              disabled={isSyncing}
              title="Sync latest performance data"
            >
              <RotateCw size={15} className={isSyncing ? "prepai-spin" : ""} />
              {isSyncing ? "Syncing..." : "Sync Stats"}
            </button>
          </div>
        </section>

        {loading && !hasReport ? (
          <div className="prepai-dash-loading">
            <div className="prepai-loading-spinner" />
            <p>Gathering your interview performance telemetry...</p>
          </div>
        ) : (
          <>
            {/* KPI Metric Cards */}
            <section className="prepai-kpi-grid">
              <div className="prepai-kpi-card prepai-kpi-card--accent">
                <div className="kpi-card__top">
                  <span className="kpi-card__label">Career Readiness</span>
                  <span className="kpi-card__icon"><Target size={18} /></span>
                </div>
                <div className="kpi-card__value-row">
                  <span className="kpi-card__value">{readinessValue}%</span>
                  <span className="kpi-card__badge kpi-card__badge--success">
                    <TrendingUp size={12} /> Ready
                  </span>
                </div>
                <p className="kpi-card__footnote">Based on technical & behavioral depth</p>
              </div>

              <div className="prepai-kpi-card">
                <div className="kpi-card__top">
                  <span className="kpi-card__label">Interview Score</span>
                  <span className="kpi-card__icon"><Mic size={18} /></span>
                </div>
                <div className="kpi-card__value-row">
                  <span className="kpi-card__value">{formatMetricValue(report.score)}</span>
                  <span className="kpi-card__subval">Avg 82%</span>
                </div>
                <p className="kpi-card__footnote">Cumulative mock performance</p>
              </div>

              <div className="prepai-kpi-card">
                <div className="kpi-card__top">
                  <span className="kpi-card__label">Integrity & Trust</span>
                  <span className="kpi-card__icon"><ShieldCheck size={18} /></span>
                </div>
                <div className="kpi-card__value-row">
                  <span className="kpi-card__value">{formatMetricValue(trustPanelValue)}</span>
                  <span className="kpi-card__badge kpi-card__badge--primary">Verified</span>
                </div>
                <p className="kpi-card__footnote">Proctoring and gaze telemetry</p>
              </div>

              <div className="prepai-kpi-card">
                <div className="kpi-card__top">
                  <span className="kpi-card__label">Practice Questions</span>
                  <span className="kpi-card__icon"><CheckCircle2 size={18} /></span>
                </div>
                <div className="kpi-card__value-row">
                  <span className="kpi-card__value">{report.totalQuestions || 12}</span>
                  <span className="kpi-card__subval">Completed</span>
                </div>
                <p className="kpi-card__footnote">Across technical & STAR formats</p>
              </div>
            </section>

            {/* Main Content Layout */}
            <div className="prepai-dash-workspace">
              {/* Primary Column */}
              <div className="prepai-dash-main">
                {/* AI Recommendation & Today's Focus */}
                <div className="prepai-dash-card prepai-dash-card--recommendation">
                  <div className="card-header">
                    <div className="card-title-group">
                      <span className="card-badge"><Sparkles size={13} /> AI Intelligence</span>
                      <h2>Today's Strategic Focus</h2>
                    </div>
                    {hasReport && (
                      <Link
                        to={reportLink}
                        state={{ reportSummary: report, reportId, sessionId }}
                        className="card-link"
                      >
                        Full Report <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>

                  <div className="recommendation-content">
                    <p className="recommendation-lead">{feedbackSummary}</p>
                    <div className="focus-callout">
                      <span className="callout-pill">Key Objective</span>
                      <p>{focusLine}</p>
                    </div>
                  </div>

                  {report.skillGaps && report.skillGaps.length > 0 && (
                    <div className="dash-skill-gaps">
                      <span className="gaps-label">Identified Skill Focus:</span>
                      <div className="gaps-chips">
                        {report.skillGaps.slice(0, 5).map((gap, idx) => (
                          <span key={idx} className="gap-chip">
                            {gap}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Performance Analytics & Skill Breakdown */}
                <div className="prepai-dash-card">
                  <div className="card-header">
                    <div className="card-title-group">
                      <span className="card-badge">Evaluation Matrix</span>
                      <h2>Performance Analytics</h2>
                    </div>
                  </div>

                  <PerformanceChart
                    variant="studio"
                    chartItems={chartItems}
                    metrics={metrics}
                    quickStats={quickStats}
                  />
                </div>
              </div>

              {/* Side Column */}
              <div className="prepai-dash-sidebar">
                {/* Latest Session Card */}
                <div className="prepai-dash-card prepai-dash-card--session">
                  <div className="card-header">
                    <h3>Recent Session</h3>
                    <span className="session-tag">Latest</span>
                  </div>

                  <div className="session-body">
                    <h4>{report.title || "Target Role Assessment"}</h4>
                    <p className="session-date">
                      {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "Active Plan"}
                    </p>

                    <div className="session-score-pill">
                      <span>Performance Score</span>
                      <strong>{formatMetricValue(report.score)}</strong>
                    </div>

                    <Link
                      to={reportLink}
                      state={{ reportSummary: report, reportId, sessionId }}
                      className="session-cta"
                    >
                      Inspect Detailed Report <ExternalLink size={14} />
                    </Link>
                  </div>
                </div>

                {/* Resume Health & Quick Link */}
                <div className="prepai-dash-card prepai-dash-card--action">
                  <div className="card-header">
                    <div className="card-icon"><FileText size={18} /></div>
                    <h3>Resume Health</h3>
                  </div>

                  <p className="dash-sidebar-desc">
                    Optimize your resume bullets, analyze ATS compliance, and generate tailored cover letters.
                  </p>

                  <button
                    type="button"
                    className="dash-sidebar-btn"
                    onClick={() => navigate("/resume")}
                  >
                    Open Resume Builder <ArrowRight size={14} />
                  </button>
                </div>

                {/* Road Map Shortcut */}
                <div className="prepai-dash-card prepai-dash-card--action">
                  <div className="card-header">
                    <div className="card-icon"><Compass size={18} /></div>
                    <h3>Preparation Roadmap</h3>
                  </div>

                  <p className="dash-sidebar-desc">
                    Follow your daily milestone roadmap from Day 1 fundamentals through advanced distributed systems.
                  </p>

                  <button
                    type="button"
                    className="dash-sidebar-btn dash-sidebar-btn--alt"
                    onClick={() => navigate("/")}
                  >
                    Review Daily Milestones <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
