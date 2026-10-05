import React from "react";

const formatType = (value = "") =>
  value
    .split("_")
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");

const getSeverityTone = (severity = 0) => {
  if (severity >= 20) {
    return "high";
  }

  if (severity >= 10) {
    return "medium";
  }

  return "low";
};

const formatTimestamp = (value) => {
  if (!value) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

export default function ViolationLog({ violations = [] }) {
  return (
    <article className="admin-card violation-log">
      <div className="violation-log__header">
        <div>
          <p className="admin-panel__eyebrow">Realtime Feed</p>
          <h3>Violation Log</h3>
        </div>
        <span className="violation-log__count">{violations.length}</span>
      </div>

      {violations.length ? (
        <div className="violation-log__list">
          {violations.map((violation) => {
            const tone = getSeverityTone(violation.severity);

            return (
              <article className="violation-log__item" key={violation.id}>
                <span className={`violation-log__dot violation-log__dot--${tone}`} />

                <div className="violation-log__body">
                  <div className="violation-log__row">
                    <strong>{formatType(violation.type)}</strong>
                    <span
                      className={`violation-log__badge violation-log__badge--${tone}`}
                    >
                      Severity {violation.severity}
                    </span>
                  </div>

                  <p>{violation.userName}</p>
                  <span>{formatTimestamp(violation.timestamp)}</span>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="admin-state admin-state--compact">
          No violations recorded in the active monitoring window.
        </div>
      )}
    </article>
  );
}
