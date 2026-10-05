import React, { useMemo } from "react";

const formatValue = (value) => (value === null ? "--" : `${Math.round(value)}%`);

const formatStatValue = (item) => {
  if (item.value === null || item.value === undefined || item.value === "") {
    return "--";
  }

  if (item.key === "trust") {
    return `${item.value}%`;
  }

  return item.value;
};

export default function PerformanceChart({
  metrics = [],
  quickStats = [],
  chartItems = [],
  variant = "report",
}) {
  const studioItems = useMemo(() => {
    const items = chartItems.length ? chartItems : metrics;
    return items.filter((item) => item.value !== null && item.value !== undefined);
  }, [chartItems, metrics]);

  if (variant === "studio") {
    const highestValue = Math.max(...studioItems.map((item) => Number(item.value || 0)), 0);
    const activeKey =
      studioItems.reduce((bestItem, item) => {
        if (!bestItem || Number(item.value) > Number(bestItem.value || 0)) {
          return item;
        }

        return bestItem;
      }, null)?.key || studioItems[0]?.key;

    return (
      <article className="dashboard-card performance-card performance-card--studio">
        <div className="performance-card__studio-head">
          <h2>Performance Breakdown</h2>
          <span>Competency Benchmark</span>
        </div>

        <div className="performance-card__studio-chart">
          {studioItems.map((item) => {
            const isActive = item.key === activeKey;
            const safeValue = Number(item.value || 0);
            const height = highestValue ? `${Math.max(28, (safeValue / highestValue) * 150)}px` : "28px";

            return (
              <div className="performance-card__studio-column" key={item.key}>
                <div
                  className="performance-card__studio-bar-frame"
                  style={{ "--bar-height": height }}
                >
                  {isActive ? (
                    <span className="performance-card__studio-bubble">
                      {formatValue(item.value)}
                    </span>
                  ) : null}

                  <div
                    className={`performance-card__studio-bar ${isActive ? "is-active" : ""}`}
                  />
                </div>

                <span className="performance-card__studio-label">
                  {item.shortLabel || item.label}
                </span>
              </div>
            );
          })}
        </div>
      </article>
    );
  }

  return (
    <article className="dashboard-card performance-card performance-card--report">
      <div className="performance-card__header">
        <div>
          <p className="dashboard-card__eyebrow">Performance</p>
          <h2>Interview Metrics</h2>
        </div>
        <span className="performance-card__label">Live summary</span>
      </div>

      <div className="performance-card__metrics">
        {metrics.map((metric) => (
          <div className="performance-card__metric" key={metric.key}>
            <div className="performance-card__row">
              <span>{metric.label}</span>
              <strong>{formatValue(metric.value)}</strong>
            </div>

            <div className="performance-card__track">
              <span
                style={{
                  "--metric-width":
                    metric.value === null ? "0%" : `${Math.max(8, metric.value)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="performance-card__stats">
        {quickStats.map((item) => (
          <div className="performance-card__pill" key={item.key}>
            <span>{item.label}</span>
            <strong>{formatStatValue(item)}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}
