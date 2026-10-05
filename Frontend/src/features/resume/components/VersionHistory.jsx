/**
 * Version History Component
 * 
 * Features:
 * - View version timeline
 * - Restore previous versions
 * - Compare versions
 * - Rename versions
 * - Tag versions
 * - Delete versions
 */

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import './VersionHistory.css';

const VersionHistory = ({
  versions = [],
  currentVersionId,
  onRestoreVersion,
  onUpdateVersion,
  onDeleteVersion,
  onCompareVersions,
  loading = false,
  error = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingVersionId, setEditingVersionId] = useState(null);
  const [editName, setEditName] = useState('');
  const [selectedForComparison, setSelectedForComparison] = useState(null);
  const [compareMode, setCompareMode] = useState(false);

  const handleOpenEdit = useCallback((version) => {
    setEditingVersionId(version.id);
    setEditName(version.name);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (editName.trim() && editingVersionId !== null) {
      onUpdateVersion(editingVersionId, {
        name: editName,
      });
      setEditingVersionId(null);
      setEditName('');
    }
  }, [editingVersionId, editName, onUpdateVersion]);

  const handleCancelEdit = useCallback(() => {
    setEditingVersionId(null);
    setEditName('');
  }, []);

  const handleCompareClick = useCallback((versionId) => {
    if (selectedForComparison === null) {
      setSelectedForComparison(versionId);
      setCompareMode(true);
    } else if (selectedForComparison !== versionId) {
      onCompareVersions(selectedForComparison, versionId);
      setSelectedForComparison(null);
      setCompareMode(false);
    }
  }, [selectedForComparison, onCompareVersions]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="version-history">
      {/* Trigger Button */}
      <button
        className="version-history__trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Version history"
      >
        <span className="version-history__icon">⏱️</span>
        <span className="version-history__label">
          Versions ({versions.length})
        </span>
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="version-history__panel">
          {/* Header */}
          <div className="version-history__header">
            <h3>Version History</h3>
            <button
              className="version-history__close"
              onClick={() => setIsOpen(false)}
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Compare Mode Indicator */}
          {compareMode && (
            <div className="version-history__compare-mode">
              <p>
                Select second version to compare with{' '}
                <strong>
                  {versions.find(v => v.id === selectedForComparison)?.name}
                </strong>
              </p>
              <button
                className="version-history__compare-cancel"
                onClick={() => {
                  setCompareMode(false);
                  setSelectedForComparison(null);
                }}
              >
                Cancel Comparison
              </button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="version-history__error">
              {error}
            </div>
          )}

          {/* Versions List */}
          {versions.length > 0 ? (
            <div className="version-history__list">
              {versions.map((version, index) => {
                const { date, time } = formatDate(version.createdAt);
                const isCurrent = version.id === currentVersionId;
                const isSelected = version.id === selectedForComparison;

                return (
                  <div
                    key={version.id}
                    className={`
                      version-history__item
                      ${isCurrent ? 'version-history__item--current' : ''}
                      ${isSelected ? 'version-history__item--selected' : ''}
                    `}
                  >
                    {/* Timeline Indicator */}
                    <div className="version-history__timeline">
                      <div className="version-history__dot"></div>
                      {index < versions.length - 1 && (
                        <div className="version-history__line"></div>
                      )}
                    </div>

                    {/* Version Info */}
                    <div className="version-history__content">
                      {editingVersionId === version.id ? (
                        /* Edit Mode */
                        <div className="version-history__edit">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="version-history__edit-input"
                            autoFocus
                          />
                          <div className="version-history__edit-actions">
                            <button
                              className="version-history__edit-save"
                              onClick={handleSaveEdit}
                              disabled={!editName.trim()}
                            >
                              Save
                            </button>
                            <button
                              className="version-history__edit-cancel"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* View Mode */
                        <>
                          <div className="version-history__title">
                            <h4>{version.name}</h4>
                            {isCurrent && (
                              <span className="version-history__badge">Current</span>
                            )}
                          </div>

                          <div className="version-history__meta">
                            <small>{date}</small>
                            <small>{time}</small>
                            <small>{formatFileSize(version.size)}</small>
                          </div>

                          {/* Tags */}
                          {version.tags && version.tags.length > 0 && (
                            <div className="version-history__tags">
                              {version.tags.map((tag, i) => (
                                <span key={i} className="version-history__tag">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="version-history__actions">
                            {!isCurrent && (
                              <button
                                className="version-history__action version-history__action--restore"
                                onClick={() => onRestoreVersion(version.id)}
                                disabled={loading}
                                title="Restore this version"
                              >
                                ↩️ Restore
                              </button>
                            )}

                            <button
                              className={`
                                version-history__action
                                version-history__action--compare
                                ${isSelected ? 'version-history__action--compare-selected' : ''}
                              `}
                              onClick={() => handleCompareClick(version.id)}
                              disabled={loading}
                              title="Compare versions"
                            >
                              {isSelected ? '✓ Selected' : '⇄ Compare'}
                            </button>

                            <button
                              className="version-history__action version-history__action--edit"
                              onClick={() => handleOpenEdit(version)}
                              disabled={loading}
                              title="Edit version name"
                            >
                              ✏️ Edit
                            </button>

                            {!isCurrent && (
                              <button
                                className="version-history__action version-history__action--delete"
                                onClick={() => onDeleteVersion(version.id)}
                                disabled={loading}
                                title="Delete version"
                              >
                                🗑️ Delete
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="version-history__empty">
              <p>No versions yet</p>
            </div>
          )}

          {/* Footer Info */}
          <div className="version-history__footer">
            <small>Showing {versions.length} version{versions.length !== 1 ? 's' : ''}</small>
          </div>
        </div>
      )}
    </div>
  );
};

VersionHistory.propTypes = {
  versions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    size: PropTypes.number,
  })),
  currentVersionId: PropTypes.number,
  onRestoreVersion: PropTypes.func.isRequired,
  onUpdateVersion: PropTypes.func.isRequired,
  onDeleteVersion: PropTypes.func.isRequired,
  onCompareVersions: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
};

export default VersionHistory;
