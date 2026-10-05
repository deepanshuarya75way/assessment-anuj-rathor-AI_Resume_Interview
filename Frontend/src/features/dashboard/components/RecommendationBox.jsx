import React from "react";

const renderList = (items = []) =>
  items.map((item) => (
    <li key={item}>
      <span>{item}</span>
    </li>
  ));

export default function RecommendationBox({
  recommendation,
  strengths = [],
  weaknesses = [],
  suggestions = [],
  featureLabel = "AI Feedback",
  callout = "",
  variant = "report",
}) {
  if (variant === "studio") {
    return (
      <article className="dashboard-card recommendation-card recommendation-card--studio">
        <div className="recommendation-card__studio-visual" aria-hidden="true">
          <div className="recommendation-card__studio-glow" />
          <div className="recommendation-card__studio-disc recommendation-card__studio-disc--back" />

          <div className="recommendation-card__studio-device">
            <div className="recommendation-card__studio-device-screen" />
            <div className="recommendation-card__studio-device-chip" />
          </div>

          <div className="recommendation-card__studio-disc recommendation-card__studio-disc--front" />
          <div className="recommendation-card__studio-gridline" />
          <div className="recommendation-card__studio-gridline recommendation-card__studio-gridline--second" />

          <div className="recommendation-card__studio-metrics">
            <span />
            <span />
            <span />
          </div>

          <span className="recommendation-card__studio-pill">{featureLabel}</span>
        </div>

        <div className="recommendation-card__studio-copy">
          <p>{recommendation || "Your interview feedback will appear here once the evaluation is ready."}</p>
          <span>{callout}</span>
        </div>
      </article>
    );
  }

  return (
    <article className="dashboard-card recommendation-card recommendation-card--report">
      <div className="recommendation-card__header">
        <div>
          <p className="dashboard-card__eyebrow">AI Feedback</p>
          <h2>Recommendation</h2>
        </div>
        <span className="recommendation-card__spark">AI</span>
      </div>

      <p className="recommendation-card__summary">
        {recommendation || "Your interview feedback will appear here once the evaluation is ready."}
      </p>

      {strengths.length ? (
        <section className="recommendation-card__section">
          <h3>What went well</h3>
          <ul>{renderList(strengths)}</ul>
        </section>
      ) : null}

      {weaknesses.length ? (
        <section className="recommendation-card__section">
          <h3>What to improve</h3>
          <ul>{renderList(weaknesses)}</ul>
        </section>
      ) : null}

      {suggestions.length ? (
        <section className="recommendation-card__section">
          <h3>Suggested next actions</h3>
          <ul>{renderList(suggestions)}</ul>
        </section>
      ) : null}
    </article>
  );
}
