import { useState } from 'react';
import LoadingState from './LoadingState';
import ErrorAlert from './ErrorAlert';

export default function AIOptimizer({
  analytics,
  onAutoFix,
  isLoading = false,
  isImproving = false,
  error,
  onDismissError,
}) {
  const [showScore, setShowScore] = useState(true);

  if (!analytics && !isLoading) return null;

  // Calculate score quality
  const scoreQuality = analytics?.score >= 85 ? 'excellent' : 
                       analytics?.score >= 70 ? 'good' : 
                       analytics?.score >= 50 ? 'fair' : 'poor';

  // Get score message
  const getScoreMessage = () => {
    switch (scoreQuality) {
      case 'excellent':
        return 'Excellent! Your resume is ATS optimized';
      case 'good':
        return 'Good! Small improvements could help';
      case 'fair':
        return 'Fair. Some optimizations recommended';
      case 'poor':
        return 'Needs improvement. Follow suggestions below';
      default:
        return 'Resume Analysis';
    }
  };

  return (
    <aside className={`ai-optimizer glass-panel ${scoreQuality}`}>
      {/* Error Alert */}
      {error && (
        <ErrorAlert
          error={error}
          onClose={onDismissError}
          onRetry={onAutoFix}
          autoDismiss={true}
          dismissTime={5000}
        />
      )}

      {/* Header */}
      <div className="ai-optimizer__header">
        <h2>AI Performance</h2>
        <button
          className="ai-optimizer__button"
          onClick={onAutoFix}
          disabled={isImproving || isLoading}
          title={isImproving ? 'Improving resume...' : 'Optimize with AI'}
        >
          {isImproving ? (
            <>
              <span className="spinner--small"></span>
              Optimizing...
            </>
          ) : (
            <>⚡ Optimize</>
          )}
        </button>
      </div>

      {/* Loading State */}
      <LoadingState
        isLoading={isLoading && !analytics}
        variant="skeleton"
        message="Analyzing resume..."
      >
        {analytics && (
          <>
            {/* Score Section */}
            <div className="ai-optimizer__score-section">
              <div className={`ai-optimizer__score score-${scoreQuality}`}>
                <div className="score-circle">
                  <div className="score-value">{analytics.score || 0}</div>
                  <div className="score-unit">%</div>
                </div>
              </div>
              <p className="ai-optimizer__score-message">
                {getScoreMessage()}
              </p>
              <div className="ai-optimizer__score-breakdown">
                {analytics.scoreBreakdown && (
                  <>
                    {analytics.scoreBreakdown.keywords && (
                      <div className="score-item">
                        <small>Keywords</small>
                        <strong>{analytics.scoreBreakdown.keywords}%</strong>
                      </div>
                    )}
                    {analytics.scoreBreakdown.formatting && (
                      <div className="score-item">
                        <small>Formatting</small>
                        <strong>{analytics.scoreBreakdown.formatting}%</strong>
                      </div>
                    )}
                    {analytics.scoreBreakdown.content && (
                      <div className="score-item">
                        <small>Content</small>
                        <strong>{analytics.scoreBreakdown.content}%</strong>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Keywords Section */}
            <div className="ai-block">
              <h3>Keywords</h3>
              <div className="ai-block__grid">
                <div>
                  <h4>Present Keywords ✓</h4>
                  {analytics.presentKeywords?.length ? (
                    <div className="chips">
                      {analytics.presentKeywords.slice(0, 5).map((k, i) => (
                        <span key={i} className="chip chip--success">
                          {k}
                        </span>
                      ))}
                      {analytics.presentKeywords.length > 5 && (
                        <span className="chip chip--count">
                          +{analytics.presentKeywords.length - 5}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="empty">No keywords found</p>
                  )}
                </div>

                <div>
                  <h4>Missing Keywords</h4>
                  {analytics.missingKeywords?.length ? (
                    <div className="chips">
                      {analytics.missingKeywords.slice(0, 5).map((k, i) => (
                        <span key={i} className="chip chip--warning">
                          {k}
                        </span>
                      ))}
                      {analytics.missingKeywords.length > 5 && (
                        <span className="chip chip--count">
                          +{analytics.missingKeywords.length - 5}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="empty">No missing keywords 🎉</p>
                  )}
                </div>
              </div>
            </div>

            {/* Issues Section */}
            {(analytics.formattingIssues?.length > 0 || analytics.contentIssues?.length > 0) && (
              <div className="ai-block">
                <h3>Issues Found</h3>
                {analytics.formattingIssues?.length > 0 && (
                  <div className="issues">
                    <h4>Formatting Issues</h4>
                    {analytics.formattingIssues.map((issue, i) => (
                      <div key={i} className="issue issue--warning">
                        <span className="issue__icon">⚠️</span>
                        <span className="issue__text">{issue}</span>
                      </div>
                    ))}
                  </div>
                )}
                {analytics.contentIssues?.length > 0 && (
                  <div className="issues">
                    <h4>Content Issues</h4>
                    {analytics.contentIssues.map((issue, i) => (
                      <div key={i} className="issue issue--info">
                        <span className="issue__icon">ℹ️</span>
                        <span className="issue__text">{issue}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Suggestions Section */}
            {analytics.suggestions?.length > 0 && (
              <div className="ai-block">
                <h3>AI Suggestions</h3>
                <div className="suggestions">
                  {analytics.suggestions.map((suggestion, i) => (
                    <div key={i} className="suggestion">
                      <div className="suggestion__number">{i + 1}</div>
                      <p className="suggestion__text">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!analytics.suggestions?.length && 
             !analytics.formattingIssues?.length && 
             !analytics.contentIssues?.length && (
              <div className="ai-block">
                <p className="empty">
                  Your resume looks great! Keep adding content to improve the score.
                </p>
              </div>
            )}
          </>
        )}
      </LoadingState>
    </aside>
  );
}
