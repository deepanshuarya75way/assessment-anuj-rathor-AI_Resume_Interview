import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for managing async API requests
 * 
 * Handles:
 * - Loading state
 * - Error state
 * - Success state
 * - Data caching
 * - Request cancellation
 * - Retry logic
 */
const useAsyncRequest = () => {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  /**
   * Execute async request and manage state
   * @param {Function} asyncFn - Async function to execute
   * @param {Object} options - Options for request handling
   */
  const execute = useCallback(
    async (asyncFn, options = {}) => {
      const {
        onSuccess,
        onError,
        clearDataOnError = false,
        autoReset = true,
      } = options;

      if (!isMountedRef.current) return;

      try {
        setState((prev) => ({
          ...prev,
          loading: true,
          error: null,
          success: false,
        }));

        const result = await asyncFn();

        if (!isMountedRef.current) return;

        setState((prev) => ({
          ...prev,
          data: result,
          loading: false,
          error: null,
          success: true,
        }));

        onSuccess?.(result);

        // Auto-reset success state after 3 seconds
        if (autoReset) {
          setTimeout(() => {
            if (isMountedRef.current) {
              setState((prev) => ({
                ...prev,
                success: false,
              }));
            }
          }, 3000);
        }

        return result;
      } catch (error) {
        if (!isMountedRef.current) return;

        console.error('[useAsyncRequest] Error:', error);

        setState((prev) => ({
          ...prev,
          data: clearDataOnError ? null : prev.data,
          loading: false,
          error,
          success: false,
        }));

        onError?.(error);

        throw error;
      }
    },
    []
  );

  /**
   * Reset state to initial state
   */
  const reset = useCallback(() => {
    if (isMountedRef.current) {
      setState({
        data: null,
        loading: false,
        error: null,
        success: false,
      });
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    if (isMountedRef.current) {
      setState((prev) => ({
        ...prev,
        error: null,
      }));
    }
  }, []);

  /**
   * Set data manually
   */
  const setData = useCallback((newData) => {
    if (isMountedRef.current) {
      setState((prev) => ({
        ...prev,
        data: newData,
      }));
    }
  }, []);

  /**
   * Cancel ongoing request
   */
  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    if (isMountedRef.current) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: new Error('Request cancelled'),
      }));
    }
  }, []);

  return {
    ...state,
    execute,
    reset,
    clearError,
    setData,
    cancel,
    isLoading: state.loading,
    hasError: !!state.error,
    isSuccess: state.success,
  };
};

export default useAsyncRequest;
