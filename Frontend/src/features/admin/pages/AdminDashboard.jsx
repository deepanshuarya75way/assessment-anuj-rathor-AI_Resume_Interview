import React, { useContext } from "react";
import { AuthContext } from "../../auth/auth.context";
import SessionTable from "../components/SessionTable";
import StatCard from "../components/StatCard";
import TrustGauge from "../components/TrustGauge";
import ViolationLog from "../components/ViolationLog";
import { useAdmin } from "../hooks/useAdmin";
import "../styles/admin.scss";

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const {
    sessions,
    activeSessions,
    stats,
    averageTrustScore,
    violationFeed,
    loading,
    error,
    terminatingId,
    refreshAdminData,
    handleTerminateSession,
  } = useAdmin();

  if (user && user.role !== "admin") {
    return (
      <div className="admin-page">
        <div className="admin-shell">
          <div className="admin-banner admin-banner--error">
            Admin access is required to view this monitoring workspace.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <header className="admin-hero">
          <div className="admin-hero__copy">
            <p className="admin-hero__eyebrow">AI Interview System</p>
            <h1>Admin Monitoring Dashboard</h1>
            <p>
              Watch live interview health, trust signals, and session activity in one
              dark-mode control room.
            </p>
          </div>

          <div className="admin-hero__actions">
            <div className="admin-hero__highlight">
              <span>Live sessions</span>
              <strong>{activeSessions.length}</strong>
            </div>

            <button
              type="button"
              className="admin-hero__button"
              onClick={() => void refreshAdminData()}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
        </header>

        {error ? <div className="admin-banner admin-banner--error">{error}</div> : null}

        <section className="admin-stats-grid">
          <StatCard
            label="Total Users"
            value={stats.totalUsers}
            hint="Unique candidates seen across monitored sessions"
            tone="cyan"
          />
          <StatCard
            label="Active Sessions"
            value={stats.activeSessions}
            hint="Currently in progress and being watched"
            tone="emerald"
          />
          <StatCard
            label="Violations Count"
            value={stats.violationsCount}
            hint="All recorded trust events from loaded sessions"
            tone="amber"
          />
        </section>

        <section className="admin-content-grid">
          <article className="admin-card admin-panel admin-panel--sessions">
            <div className="admin-panel__header">
              <div>
                <p className="admin-panel__eyebrow">Live Operations</p>
                <h2>Session Command Center</h2>
              </div>

              <span className="admin-panel__meta">{sessions.length} sessions loaded</span>
            </div>

            {loading && !sessions.length ? (
              <div className="admin-state">Loading live session data...</div>
            ) : (
              <SessionTable
                sessions={sessions}
                terminatingId={terminatingId}
                onTerminate={handleTerminateSession}
              />
            )}
          </article>

          <div className="admin-side-grid">
            <TrustGauge
              value={averageTrustScore}
              caption={`${activeSessions.length} sessions active right now`}
            />
            <ViolationLog violations={violationFeed} />
          </div>
        </section>
      </div>
    </div>
  );
}
