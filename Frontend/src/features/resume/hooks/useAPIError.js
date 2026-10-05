import { useCallback } from 'react';
import { APIError } from '../../../utils/apiClient';

/**
 * Custom hook for handling API errors in components
 * 
 * Features:
 * - Standardized error message extraction
 * - Error type detection
 * - User-friendly error formatting
 * - Error logging
 */
const useAPIError = () => {
  /**
   * Parse API error and return user-friendly message
   * @param {Error|APIError} error - Error object
   * @returns {Object} Parsed error object
   */
  const parseError = useCallback((error) => {
    if (!error) {
      return {
        message: 'An unknown error occurred',
        code: 'UNKNOWN_ERROR',
        statusCode: 500,
        isNetworkError: false,
        isServerError: false,
        isClientError: false,
        isValidationError: false,
        isUnauthorized: false,
        isForbidden: false,
        isNotFound: false,
        isRateLimited: false,
      };
    }

    if (error instanceof APIError) {
      return {
        message: error.message,
        code: error.errorCode,
        statusCode: error.statusCode,
        isNetworkError: error.isNetworkError(),
        isServerError: error.isServerError(),
        isClientError: error.isClientError(),
        isValidationError: error.isValidationError(),
        isUnauthorized: error.isUnauthorized(),
        isForbidden: error.isForbidden(),
        isNotFound: error.isNotFound(),
        isRateLimited: error.isRateLimited(),
        originalError: error,
      };
    }

    // Handle network errors
    if (error instanceof TypeError) {
      return {
        message: 'Network connection error. Please check your internet connection.',
        code: 'NETWORK_ERROR',
        statusCode: 0,
        isNetworkError: true,
        isServerError: false,
        isClientError: false,
        isValidationError: false,
        isUnauthorized: false,
        isForbidden: false,
        isNotFound: false,
        isRateLimited: false,
        originalError: error,
      };
    }

    // Handle timeout errors
    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        message: 'Request timeout. The server took too long to respond.',
        code: 'TIMEOUT_ERROR',
        statusCode: 408,
        isNetworkError: true,
        isServerError: false,
        isClientError: false,
        isValidationError: false,
        isUnauthorized: false,
        isForbidden: false,
        isNotFound: false,
        isRateLimited: false,
        originalError: error,
      };
    }

    // Fallback for unknown errors
    return {
      message: error?.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      statusCode: 500,
      isNetworkError: false,
      isServerError: true,
      isClientError: false,
      isValidationError: false,
      isUnauthorized: false,
      isForbidden: false,
      isNotFound: false,
      isRateLimited: false,
      originalError: error,
    };
  }, []);

  /**
   * Get user-friendly error message based on error type
   * @param {Error|APIError} error - Error object
   * @returns {string} User-friendly message
   */
  const getUserMessage = useCallback((error) => {
    const parsed = parseError(error);

    // Specific messages for common errors
    if (parsed.isRateLimited) {
      return 'Too many requests. Please wait a moment and try again.';
    }

    if (parsed.isUnauthorized) {
      return 'Your session has expired. Please log in again.';
    }

    if (parsed.isForbidden) {
      return 'You don\'t have permission to perform this action.';
    }

    if (parsed.isNotFound) {
      return 'The requested resource was not found.';
    }

    if (parsed.isNetworkError) {
      return 'Network error. Please check your connection and try again.';
    }

    if (parsed.isServerError) {
      return 'Server error. Please try again later.';
    }

    return parsed.message;
  }, [parseError]);

  /**
   * Log error for debugging
   * @param {Error|APIError} error - Error object
   * @param {string} context - Context where error occurred
   */
  const logError = useCallback((error, context = 'Unknown') => {
    const parsed = parseError(error);

    console.error(`[${context}] Error:`, {
      message: parsed.message,
      code: parsed.code,
      statusCode: parsed.statusCode,
      isNetworkError: parsed.isNetworkError,
      isServerError: parsed.isServerError,
      originalError: error,
    });
  }, [parseError]);

  /**
   * Determine if error is retryable
   * @param {Error|APIError} error - Error object
   * @returns {boolean} Whether error should be retried
   */
  const isRetryable = useCallback((error) => {
    const parsed = parseError(error);

    // Retry on network errors, timeouts, and server errors
    return (
      parsed.isNetworkError ||
      parsed.statusCode === 408 ||
      parsed.statusCode === 429 ||
      (parsed.statusCode >= 500 && parsed.statusCode < 600)
    );
  }, [parseError]);

  /**
   * Get error icon/color for UI
   * @param {Error|APIError} error - Error object
   * @returns {Object} Icon and color info
   */
  const getErrorStyle = useCallback((error) => {
    const parsed = parseError(error);

    if (parsed.isRateLimited) {
      return { icon: 'clock', color: 'orange' };
    }

    if (parsed.isUnauthorized || parsed.isForbidden) {
      return { icon: 'lock', color: 'red' };
    }

    if (parsed.isNotFound) {
      return { icon: 'search', color: 'gray' };
    }

    if (parsed.isNetworkError) {
      return { icon: 'wifi-off', color: 'red' };
    }

    if (parsed.isServerError) {
      return { icon: 'alert', color: 'red' };
    }

    return { icon: 'alert-circle', color: 'orange' };
  }, [parseError]);

  return {
    parseError,
    getUserMessage,
    logError,
    isRetryable,
    getErrorStyle,
  };
};

export default useAPIError;
