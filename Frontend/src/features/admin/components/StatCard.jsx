import React from "react";

const formatValue = (value) =>
  typeof value === "number" ? value.toLocaleString("en-IN") : value;

export default function StatCard({ label, value, hint, tone = "cyan" }) {
  return (
    <article className={`admin-card stat-card stat-card--${tone}`}>
      <div className="stat-card__topline">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__pulse" />
      </div>

      <strong className="stat-card__value">{formatValue(value)}</strong>

      {hint ? <p className="stat-card__hint">{hint}</p> : null}
    </article>
  );
}
