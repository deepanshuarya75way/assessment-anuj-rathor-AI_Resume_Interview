/**
 * Resume Switcher Component
 * 
 * Features:
 * - Switch between multiple resumes
 * - Create new resume
 * - Clone current resume
 * - Delete resume (with confirmation)
 * - Resume search and filter
 * - Recent resumes quick access
 */

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import './ResumeSwitcher.css';

const ResumeSwitcher = ({
  currentResumeId,
  resumes = [],
  onSelectResume,
  onCreateResume,
  onCloneResume,
  onDeleteResume,
  loading = false,
  error = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentResume = resumes.find(r => r.id === currentResumeId);
  const filteredResumes = resumes.filter(r =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectResume = useCallback((resumeId) => {
    onSelectResume(resumeId);
    setIsOpen(false);
    setSearchTerm('');
  }, [onSelectResume]);

  const handleCreateResume = useCallback(() => {
    onCreateResume();
    setIsOpen(false);
  }, [onCreateResume]);

  const handleCloneResume = useCallback(() => {
    onCloneResume(currentResumeId);
    setIsOpen(false);
  }, [onCloneResume, currentResumeId]);

  const handleDeleteClick = useCallback((resumeId, e) => {
    e.stopPropagation();
    setSelectedForDelete(resumeId);
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (selectedForDelete) {
      onDeleteResume(selectedForDelete);
      setShowDeleteConfirm(false);
      setSelectedForDelete(null);
      setIsOpen(false);
    }
  }, [selectedForDelete, onDeleteResume]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    setSelectedForDelete(null);
  }, []);

  const recentResumes = resumes.slice(0, 3);

  return (
    <div className="resume-switcher">
      {/* Current Resume Button */}
      <button
        className="resume-switcher__trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Switch resume"
      >
        <span className="resume-switcher__icon">📄</span>
        <span className="resume-switcher__label">
          {currentResume?.title || 'Select Resume'}
        </span>
        <span className="resume-switcher__arrow">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="resume-switcher__menu">
          {/* Header */}
          <div className="resume-switcher__header">
            <h3>My Resumes</h3>
            <button
              className="resume-switcher__close"
              onClick={() => setIsOpen(false)}
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="resume-switcher__error">
              {error}
            </div>
          )}

          {/* Search */}
          {resumes.length > 3 && (
            <div className="resume-switcher__search">
              <input
                type="text"
                placeholder="Search resumes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="resume-switcher__input"
              />
            </div>
          )}

          {/* Recent Resumes (when not searching) */}
          {!searchTerm && recentResumes.length > 0 && (
            <div className="resume-switcher__section">
              <h4>Recent</h4>
              <ul className="resume-switcher__list">
                {recentResumes.map(resume => (
                  <li key={resume.id} className="resume-switcher__item">
                    <button
                      className={`
                        resume-switcher__item-button
                        ${resume.id === currentResumeId ? 'resume-switcher__item-button--active' : ''}
                      `}
                      onClick={() => handleSelectResume(resume.id)}
                      disabled={loading}
                    >
                      <span className="resume-switcher__item-title">
                        {resume.title}
                      </span>
                      <span className="resume-switcher__item-meta">
                        {resume.versions || 0} versions
                      </span>
                    </button>

                    {resume.id !== currentResumeId && (
                      <button
                        className="resume-switcher__item-delete"
                        onClick={(e) => handleDeleteClick(resume.id, e)}
                        title="Delete"
                        disabled={loading}
                      >
                        🗑️
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* All Resumes */}
          {filteredResumes.length > 0 && (
            <div className="resume-switcher__section">
              {searchTerm && <h4>Results</h4>}
              <ul className="resume-switcher__list">
                {filteredResumes.map(resume => (
                  <li key={resume.id} className="resume-switcher__item">
                    <button
                      className={`
                        resume-switcher__item-button
                        ${resume.id === currentResumeId ? 'resume-switcher__item-button--active' : ''}
                      `}
                      onClick={() => handleSelectResume(resume.id)}
                      disabled={loading}
                    >
                      <span className="resume-switcher__item-title">
                        {resume.title}
                      </span>
                      {resume.description && (
                        <span className="resume-switcher__item-desc">
                          {resume.description}
                        </span>
                      )}
                      <span className="resume-switcher__item-meta">
                        Updated {new Date(resume.updatedAt).toLocaleDateString()}
                      </span>
                    </button>

                    {resume.id !== currentResumeId && (
                      <button
                        className="resume-switcher__item-delete"
                        onClick={(e) => handleDeleteClick(resume.id, e)}
                        title="Delete"
                        disabled={loading}
                      >
                        🗑️
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Empty State */}
          {filteredResumes.length === 0 && (
            <div className="resume-switcher__empty">
              <p>No resumes found</p>
            </div>
          )}

          {/* Actions */}
          <div className="resume-switcher__actions">
            <button
              className="resume-switcher__action resume-switcher__action--create"
              onClick={handleCreateResume}
              disabled={loading || resumes.length >= 10}
              title={resumes.length >= 10 ? 'Maximum 10 resumes reached' : 'Create new resume'}
            >
              ➕ New Resume
            </button>

            <button
              className="resume-switcher__action resume-switcher__action--clone"
              onClick={handleCloneResume}
              disabled={loading || !currentResumeId || resumes.length >= 10}
              title="Clone current resume"
            >
              📋 Clone
            </button>
          </div>

          {/* Resume Count */}
          <div className="resume-switcher__footer">
            <small>{resumes.length} / 10 resumes used</small>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="resume-switcher__modal-overlay">
          <div className="resume-switcher__modal">
            <h3>Delete Resume?</h3>
            <p>
              {resumes.find(r => r.id === selectedForDelete)?.title}
            </p>
            <small>This action cannot be undone.</small>

            <div className="resume-switcher__modal-actions">
              <button
                className="resume-switcher__modal-button resume-switcher__modal-button--cancel"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
              <button
                className="resume-switcher__modal-button resume-switcher__modal-button--delete"
                onClick={handleConfirmDelete}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ResumeSwitcher.propTypes = {
  currentResumeId: PropTypes.string,
  resumes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
    versions: PropTypes.number,
  })),
  onSelectResume: PropTypes.func.isRequired,
  onCreateResume: PropTypes.func.isRequired,
  onCloneResume: PropTypes.func.isRequired,
  onDeleteResume: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
};

export default ResumeSwitcher;
