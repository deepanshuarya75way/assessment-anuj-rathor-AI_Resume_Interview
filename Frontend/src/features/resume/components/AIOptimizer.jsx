export default function AIOptimizer({ analytics, onAutoFix }) {
  if (!analytics) return null;

  return (
    <aside className="ai-optimizer">

      {/* HEADER */}
      <div className="ai-optimizer__header">
        <h2>AI Performance</h2>
        <button onClick={onAutoFix}>⚡ Optimize</button>
      </div>

      {/* SCORE */}
      <div className="ai-optimizer__score">
        <h1>{analytics.score || 0}%</h1>
        <p>ATS Score</p>
      </div>

      {/* KEYWORDS */}
      <div className="ai-block">
        <h3>Missing Keywords</h3>

        <div className="chips">
          {analytics.keywords?.length ? (
            analytics.keywords.map((k, i) => (
              <span key={i}>{k}</span>
            ))
          ) : (
            <p className="empty">No missing keywords 🎉</p>
          )}
        </div>
      </div>

      {/* SUGGESTIONS */}
      <div className="ai-block">
        <h3>AI Suggestions</h3>

        {analytics.suggestions?.length ? (
          analytics.suggestions.map((s, i) => (
            <div key={i} className="suggestion">
              <p>{s}</p>
            </div>
          ))
        ) : (
          <p className="empty">Your resume looks strong 🚀</p>
        )}
      </div>

    </aside>
  );
}