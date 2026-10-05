import React from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import PerformanceChart from "../components/PerformanceChart";
import RecommendationBox from "../components/RecommendationBox";
import ScoreCard from "../components/ScoreCard";
import { useDashboard } from "../hooks/useDashboard";
import Navbar from "../../interview/components/Navbar";
import { ArrowLeft, RotateCw, AlertCircle, Sparkles, CheckCircle2, Target } from "lucide-react";
import "../styles/dashboard.scss";

const buildInsightList = (items = []) =>
  items.map((item) => (
    <li key={item}>
      <span>{item}</span>
    </li>
  ));

export default function ReportPage() {
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

  const focusAreas = report.skillGaps.length ? report.skillGaps : report.missingKeywords;

  return (
    <div className="prepai-dashboard-page prepai-dashboard-page--report">
      <Navbar />

      <main className="prepai-dashboard-shell">
        {/* Navigation Breadcrumb / Hero Header */}
        <header className="prepai-report-header">
          <div className="report-header__copy">
            <Link
              to="/dashboard"
              state={{ reportSummary: report, reportId, sessionId }}
              className="report-back-link"
            >
              <ArrowLeft size={16} /> Back to Command Center
            </Link>

            <div className="report-header__badge-row">
              <span className="hero-pill">
                <Sparkles size={12} /> Post-Interview Intelligence Report
              </span>
              {report.status && (
                <span className="report-status-badge">
                  <CheckCircle2 size={12} /> {report.status}
                </span>
              )}
            </div>

            <h1 className="report-title">{report.title || "Technical & Behavioral Assessment Report"}</h1>
            <p className="report-subtitle">
              Detailed performance breakdown across communication, technical knowledge, problem solving, and confidence.
            </p>
          </div>

          <div className="report-header__actions">
            <button
              type="button"
              className="dash-action-btn dash-action-btn--primary"
              onClick={() => void refreshReport()}
              disabled={isSyncing}
            >
              <RotateCw size={15} className={isSyncing ? "prepai-spin" : ""} />
              {isSyncing ? "Refreshing..." : "Refresh Report"}
            </button>
          </div>
        </header>

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

        {loading && !hasReport ? (
          <div className="prepai-dash-loading">
            <div className="prepai-loading-spinner" />
            <p>Loading full interview report analytics...</p>
          </div>
        ) : !hasReport ? (
          <div className="prepai-dash-empty">
            <Target size={40} className="empty-icon" />
            <h3>No interview report available</h3>
            <p>Complete a mock interview or interview preparation session to view performance metrics here.</p>
            <Link to="/mock" className="dash-action-btn dash-action-btn--primary">
              Start Mock Interview
            </Link>
          </div>
        ) : (
          <>
            <section className="prepai-report-grid">
              <ScoreCard
                score={report.score}
                title={report.title}
                status={report.status}
                totalQuestions={report.totalQuestions}
                trustScore={report.trustScore}
                createdAt={report.createdAt}
              />

              <PerformanceChart metrics={metrics} quickStats={quickStats} />
            </section>

            <section className="prepai-report-details">
              <RecommendationBox
                recommendation={report.recommendation}
                strengths={report.strengths}
                weaknesses={report.weaknesses}
                suggestions={report.suggestions}
              />

              <article className="prepai-dash-card insight-card">
                <div className="card-header">
                  <div className="card-title-group">
                    <span className="card-badge">Growth Roadmap</span>
                    <h2>Focus Areas & Recommended Actions</h2>
                  </div>
                  <span className="insight-badge">
                    {focusAreas.length + report.suggestions.length} items
                  </span>
                </div>

                {focusAreas.length > 0 && (
                  <div className="insight-card__section">
                    <h3>Priority Technical Topics</h3>
                    <ul className="insight-list">{buildInsightList(focusAreas)}</ul>
                  </div>
                )}

                {report.suggestions.length > 0 && (
                  <div className="insight-card__section">
                    <h3>Strategic Coaching Recommendations</h3>
                    <ul className="insight-list insight-list--success">
                      {buildInsightList(report.suggestions)}
                    </ul>
                  </div>
                )}

                {!focusAreas.length && !report.suggestions.length && (
                  <div className="dash-empty-inline">
                    No specific gaps identified. Continue refining your core STAR framework delivery!
                  </div>
                )}
              </article>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
