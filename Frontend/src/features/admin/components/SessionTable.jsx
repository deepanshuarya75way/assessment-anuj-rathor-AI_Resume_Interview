import React from "react";

const formatStatus = (value = "") =>
  value.charAt(0).toUpperCase() + value.slice(1);

export default function SessionTable({
  sessions = [],
  terminatingId = "",
  onTerminate,
}) {
  if (!sessions.length) {
    return (
      <div className="admin-state">
        No interview sessions are available yet.
      </div>
    );
  }

  return (
    <div className="session-table">
      <div className="session-table__scroller">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Status</th>
              <th>Trust Score</th>
              <th>Violations</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {sessions.map((session) => {
              const isTerminating = terminatingId === session.id;
              const isDisabled = isTerminating || session.status === "terminated";

              return (
                <tr key={session.id}>
                  <td data-label="User">
                    <div className="session-user">
                      <strong>{session.userName}</strong>
                      <span>{session.email}</span>
                    </div>
                  </td>

                  <td data-label="Status">
                    <span className={`session-status session-status--${session.status}`}>
                      {formatStatus(session.status)}
                    </span>
                  </td>

                  <td data-label="Trust Score">
                    <div className="session-trust">
                      <div
                        className="session-trust__bar"
                        style={{ "--trust-width": `${session.trustScore}%` }}
                      />
                      <strong>{session.trustScore}%</strong>
                    </div>
                  </td>

                  <td data-label="Violations">
                    <div className="session-violations">
                      <strong>{session.violationsCount}</strong>
                      <span>{session.warnings} warnings</span>
                    </div>
                  </td>

                  <td data-label="Action">
                    <button
                      type="button"
                      className="session-action"
                      onClick={() => onTerminate?.(session.id)}
                      disabled={isDisabled}
                    >
                      {isTerminating ? "Terminating..." : "Terminate Session"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
