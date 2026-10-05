import React, { createContext, useReducer, useCallback, useEffect } from 'react';
import * as resumeAPI from '../services/resume.api';
import { APIError } from '../../../utils/apiClient';

/**
 * Resume Context
 * 
 * Manages:
 * - Resume data state
 * - Loading/error states
 * - Resume operations (save, improve, analyze)
 * - Data persistence
 */
export const ResumeContext = createContext();

// Initial state
const initialState = {
  resume: null,
  analysis: null,
  improvedSuggestions: null,
  loading: false,
  error: null,
  success: false,
  lastSaved: null,
  isDirty: false,
  operation: null, // 'saving', 'improving', 'analyzing', 'exporting'
};

// Actions
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_SUCCESS: 'SET_SUCCESS',
  SET_RESUME: 'SET_RESUME',
  UPDATE_RESUME: 'UPDATE_RESUME',
  SET_DIRTY: 'SET_DIRTY',
  SET_ANALYSIS: 'SET_ANALYSIS',
  SET_IMPROVEMENTS: 'SET_IMPROVEMENTS',
  RESET_STATE: 'RESET_STATE',
  SET_OPERATION: 'SET_OPERATION',
};

/**
 * Reducer function for managing resume state
 */
function resumeReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: action.payload ? null : state.error,
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
        success: false,
      };

    case ACTIONS.SET_SUCCESS:
      return {
        ...state,
        success: true,
        error: null,
        loading: false,
        lastSaved: new Date().toISOString(),
      };

    case ACTIONS.SET_RESUME:
      return {
        ...state,
        resume: action.payload,
        isDirty: false,
      };

    case ACTIONS.UPDATE_RESUME: {
      const currentResume = state.resume || {};
      const updates = typeof action.payload === 'function' ? action.payload(currentResume) : action.payload;
      return {
        ...state,
        resume: {
          ...currentResume,
          ...updates,
        },
        isDirty: true,
      };
    }

    case ACTIONS.SET_DIRTY:
      return {
        ...state,
        isDirty: action.payload,
      };

    case ACTIONS.SET_ANALYSIS:
      return {
        ...state,
        analysis: action.payload,
      };

    case ACTIONS.SET_IMPROVEMENTS:
      return {
        ...state,
        improvedSuggestions: action.payload,
      };

    case ACTIONS.SET_OPERATION:
      return {
        ...state,
        operation: action.payload,
      };

    case ACTIONS.RESET_STATE:
      return initialState;

    default:
      return state;
  }
}

/**
 * Resume Context Provider Component
 */
export function ResumeProvider({ children }) {
  const [state, dispatch] = useReducer(resumeReducer, initialState);

  /**
   * Fetch resume on mount
   */
  useEffect(() => {
    fetchResume();
  }, []);

  /**
   * Auto-save resume when it changes (debounced)
   */
  useEffect(() => {
    if (state.isDirty && state.resume) {
      const timer = setTimeout(() => {
        saveResume(state.resume);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [state.isDirty, state.resume]);

  /**
   * Fetch resume from API
   */
  const fetchResume = useCallback(async () => {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return;
    }

    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    try {
      const data = await resumeAPI.getResume();
      if (data) {
        dispatch({ type: ACTIONS.SET_RESUME, payload: data });
      } else {
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      }
    } catch (error) {
      // Don't show error for 404 (no resume yet) or 401 (not logged in yet)
      if (error?.statusCode !== 404 && error?.statusCode !== 401) {
        console.error('[ResumeContext] Fetch error:', error);
        dispatch({ type: ACTIONS.SET_ERROR, payload: error });
      } else {
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      }
    }
  }, []);

  /**
   * Save resume to API
   */
  const saveResume = useCallback(async (resumeData) => {
    dispatch({ type: ACTIONS.SET_OPERATION, payload: 'saving' });
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    try {
      const savedData = await resumeAPI.saveResume(resumeData);
      dispatch({ type: ACTIONS.SET_RESUME, payload: savedData });
      dispatch({ type: ACTIONS.SET_SUCCESS, payload: true });

      // Auto-dismiss success after 3 seconds
      setTimeout(() => {
        dispatch({ type: ACTIONS.SET_SUCCESS, payload: false });
      }, 3000);

      return savedData;
    } catch (error) {
      console.error('[ResumeContext] Save error:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error });
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_OPERATION, payload: null });
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  /**
   * Improve resume with AI
   */
  const improveResume = useCallback(async (resumeData) => {
    dispatch({ type: ACTIONS.SET_OPERATION, payload: 'improving' });
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    try {
      const improved = await resumeAPI.improveResume(resumeData);
      dispatch({ type: ACTIONS.SET_IMPROVEMENTS, payload: improved });
      return improved;
    } catch (error) {
      console.error('[ResumeContext] Improve error:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error });
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_OPERATION, payload: null });
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  /**
   * Analyze resume
   */
  const analyzeResume = useCallback(async (resumeData, jobDescription = null) => {
    dispatch({ type: ACTIONS.SET_OPERATION, payload: 'analyzing' });
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    try {
      const analysis = await resumeAPI.analyzeResume({
        resume: resumeData,
        jobDescription,
      });
      dispatch({ type: ACTIONS.SET_ANALYSIS, payload: analysis });
      return analysis;
    } catch (error) {
      console.error('[ResumeContext] Analyze error:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error });
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_OPERATION, payload: null });
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  /**
   * Export resume to PDF
   */
  const exportToPDF = useCallback(async (resumeData) => {
    dispatch({ type: ACTIONS.SET_OPERATION, payload: 'exporting' });
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    try {
      const pdfBlob = await resumeAPI.downloadPDF(resumeData);

      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resume_${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      dispatch({ type: ACTIONS.SET_SUCCESS, payload: true });

      // Auto-dismiss success after 3 seconds
      setTimeout(() => {
        dispatch({ type: ACTIONS.SET_SUCCESS, payload: false });
      }, 3000);

      return pdfBlob;
    } catch (error) {
      console.error('[ResumeContext] Export error:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error });
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_OPERATION, payload: null });
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  /**
   * Update resume locally (marks as dirty)
   */
  const updateResumeLocal = useCallback((updates) => {
    dispatch({ type: ACTIONS.UPDATE_RESUME, payload: updates });
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: null });
  }, []);

  /**
   * Reset entire state
   */
  const reset = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_STATE });
  }, []);

  const value = {
    // State
    resume: state.resume,
    analysis: state.analysis,
    improvedSuggestions: state.improvedSuggestions,
    loading: state.loading,
    error: state.error,
    success: state.success,
    lastSaved: state.lastSaved,
    isDirty: state.isDirty,
    operation: state.operation,

    // Methods
    fetchResume,
    saveResume,
    improveResume,
    analyzeResume,
    exportToPDF,
    updateResumeLocal,
    clearError,
    reset,

    // Helpers
    isSaving: state.operation === 'saving',
    isImproving: state.operation === 'improving',
    isAnalyzing: state.operation === 'analyzing',
    isExporting: state.operation === 'exporting',
  };

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  );
}

export default ResumeContext;
