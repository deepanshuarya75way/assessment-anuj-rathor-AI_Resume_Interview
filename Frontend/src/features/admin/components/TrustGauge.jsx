import React from "react";
import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const getTone = (value) => {
  if (value >= 80) {
    return {
      className: "good",
      pathColor: "#22c55e",
      trailColor: "rgba(34, 197, 94, 0.16)",
      label: "Stable",
    };
  }

  if (value >= 60) {
    return {
      className: "warning",
      pathColor: "#f59e0b",
      trailColor: "rgba(245, 158, 11, 0.16)",
      label: "Watchlist",
    };
  }

  return {
    className: "danger",
    pathColor: "#f43f5e",
    trailColor: "rgba(244, 63, 94, 0.16)",
    label: "At Risk",
  };
};

export default function TrustGauge({
  value = 0,
  label = "Average Trust Score",
  caption = "Across all monitored sessions",
}) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  const tone = getTone(safeValue);

  return (
    <article className={`admin-card trust-gauge trust-gauge--${tone.className}`}>
      <div className="trust-gauge__header">
        <div>
          <p className="admin-panel__eyebrow">Trust Monitor</p>
          <h3>{label}</h3>
        </div>

        <span className={`trust-gauge__status trust-gauge__status--${tone.className}`}>
          {tone.label}
        </span>
      </div>

      <div className="trust-gauge__meter">
        <CircularProgressbar
          value={safeValue}
          text={`${safeValue}%`}
          strokeWidth={10}
          styles={buildStyles({
            pathColor: tone.pathColor,
            trailColor: tone.trailColor,
            textColor: "#f8fafc",
            textSize: "18px",
            strokeLinecap: "round",
          })}
        />
      </div>

      <p className="trust-gauge__caption">{caption}</p>
    </article>
  );
}
