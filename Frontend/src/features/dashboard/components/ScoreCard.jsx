import React from "react";

const formatDate = (value) => {
  if (!value) {
    return "Latest available report";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const formatStatus = (value = "completed") =>
  value.charAt(0).toUpperCase() + value.slice(1);

const formatMetric = (value) =>
  value === null || value === undefined ? "--" : `${Math.round(Number(value))}%`;

export default function ScoreCard({
  score,
  title,
  status,
  totalQuestions,
  trustScore,
  createdAt,
  legendItems = [],
  variant = "report",
}) {
  const safeScore = score === null ? 0 : Math.max(0, Math.min(100, Number(score) || 0));

  if (variant === "studio") {
    const studioLegend = legendItems.length
      ? legendItems
      : [
          { label: "Overall Score", value: safeScore, tone: "dark" },
          { label: "Trust Score", value: trustScore, tone: "soft" },
        ];

    return (
      <article className="dashboard-card score-card score-card--studio">
        <div className="score-card__studio-head">
          <h2>{title || "Interview Score"}</h2>
          <button type="button">More</button>
        </div>

        <div
          className="score-card__studio-ring"
          style={{ "--score-progress": `${safeScore}%` }}
        >
          <div className="score-card__studio-ring-center">
            <strong>{score === null ? "--" : `${safeScore}%`}</strong>
            <span>Your Score</span>
          </div>
        </div>

        <div className="score-card__studio-legend">
          {studioLegend.slice(0, 2).map((item) => (
            <div className="score-card__studio-legend-item" key={item.label}>
              <span className={`score-card__studio-dot score-card__studio-dot--${item.tone || "dark"}`} />
              <p>{item.label}</p>
              <strong>{formatMetric(item.value)}</strong>
            </div>
          ))}
        </div>
      </article>
    );
  }

  return (
    <article className="dashboard-card score-card score-card--report">
      <div className="score-card__header">
        <div>
          <p className="dashboard-card__eyebrow">Candidate Panel</p>
          <h2>{title || "Interview Performance Report"}</h2>
        </div>

        <span className={`score-card__status score-card__status--${status || "completed"}`}>
          {formatStatus(status || "completed")}
        </span>
      </div>

      <div className="score-card__body">
        <div
          className="score-card__dial"
          style={{ "--score-progress": `${safeScore}%` }}
        >
          <span>{score === null ? "--" : `${safeScore}%`}</span>
          <small>Your Score</small>
        </div>

        <div className="score-card__meta">
          <div className="score-card__metric">
            <span>Answered</span>
            <strong>{totalQuestions ?? "--"}</strong>
          </div>

          <div className="score-card__metric">
            <span>Trust</span>
            <strong>{trustScore === null ? "--" : `${trustScore}%`}</strong>
          </div>

          <div className="score-card__metric">
            <span>Updated</span>
            <strong>{formatDate(createdAt)}</strong>
          </div>
        </div>
      </div>
    </article>
  );
}
