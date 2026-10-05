/**
 * Enhanced API Client with Interceptors
 * Features:
 * - Request/Response interceptors
 * - Automatic retry logic with exponential backoff
 * - Centralized error handling
 * - Request/Response logging
 * - Timeout management
 * - Token refresh support
 */

// Get API base URL from environment or window object
const getAPIBaseURL = () => {
  // Try Vite environment variables first
  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env)
    ? (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL)
    : null;

  if (envUrl) {
    const url = envUrl.replace(/\/+$/, '');
    return url.endsWith('/api') ? url : `${url}/api`;
  }

  // Try window object next (works in browser)
  if (typeof window !== 'undefined' && window && (window.__API_URL__ || window.__API_BASE_URL__)) {
    const url = (window.__API_URL__ || window.__API_BASE_URL__).replace(/\/+$/, '');
    return url.endsWith('/api') ? url : `${url}/api`;
  }
  
  // Default fallback
  return 'http://localhost:3000/api';
};

const API_BASE_URL = getAPIBaseURL();
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

class APIClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    this.interceptors = {
      request: [],
      response: [],
      error: [],
    };
  }

  cleanEndpoint(endpoint) {
    let clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    if (this.baseURL.endsWith('/api') && clean.startsWith('/api/')) {
      clean = clean.substring(4);
    }
    return clean;
  }

  /**
   * Add request interceptor
   * @param {Function} handler - Function to handle request
   */
  addRequestInterceptor(handler) {
    this.interceptors.request.push(handler);
  }

  /**
   * Add response interceptor
   * @param {Function} handler - Function to handle response
   */
  addResponseInterceptor(handler) {
    this.interceptors.response.push(handler);
  }

  /**
   * Add error interceptor
   * @param {Function} handler - Function to handle errors
   */
  addErrorInterceptor(handler) {
    this.interceptors.error.push(handler);
  }

  /**
   * Execute request interceptors
   */
  async executeRequestInterceptors(config) {
    let finalConfig = { ...config };
    for (const interceptor of this.interceptors.request) {
      finalConfig = await interceptor(finalConfig);
    }
    return finalConfig;
  }

  /**
   * Execute response interceptors
   */
  async executeResponseInterceptors(response) {
    let finalResponse = response;
    for (const interceptor of this.interceptors.response) {
      finalResponse = await interceptor(finalResponse);
    }
    return finalResponse;
  }

  /**
   * Execute error interceptors
   */
  async executeErrorInterceptors(error) {
    let finalError = error;
    for (const interceptor of this.interceptors.error) {
      finalError = await interceptor(finalError);
    }
    return finalError;
  }

  /**
   * Retry request with exponential backoff
   * @param {Function} fn - Function to retry
   * @param {number} retries - Number of retries left
   * @param {number} delay - Delay before retry in ms
   */
  async retryWithBackoff(fn, retries = MAX_RETRIES, delay = 1000) {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0 && this.isRetryable(error)) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.retryWithBackoff(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error) {
    if (!error.response) return true; // Network error

    const status = error.response.status;
    // Don't retry on user authentication/permission or not found client errors
    if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
      return false;
    }
    // Retry on timeouts and server errors (5xx)
    return status >= 500 || status === 408 || status === 429;
  }

  /**
   * Make API request with full retry and error handling
   */
  async request(method, endpoint, data = null, config = {}) {
    const cleanPath = this.cleanEndpoint(endpoint);
    const url = `${this.baseURL.replace(/\/+$/, '')}${cleanPath}`;
    const startTime = Date.now();

    const makeRequest = async () => {
      let requestConfig = {
        method,
        url,
        headers: { ...this.defaultHeaders, ...config.headers },
        timeout: config.timeout || REQUEST_TIMEOUT,
        ...config,
      };

      // Attach token from localStorage if present
      if (typeof localStorage !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token && !requestConfig.headers['Authorization'] && !requestConfig.headers['authorization']) {
          requestConfig.headers['Authorization'] = `Bearer ${token}`;
        }
      }

      // Execute request interceptors
      requestConfig = await this.executeRequestInterceptors(requestConfig);

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        requestConfig.data = data;
      }

      if (method === 'GET' && data) {
        requestConfig.params = data;
      }

      let requestUrl = requestConfig.url;
      if (requestConfig.params && typeof requestConfig.params === 'object') {
        const queryParams = new URLSearchParams();
        Object.entries(requestConfig.params).forEach(([key, val]) => {
          if (val !== undefined && val !== null) {
            queryParams.append(key, val);
          }
        });
        const qs = queryParams.toString();
        if (qs) {
          requestUrl += (requestUrl.includes('?') ? '&' : '?') + qs;
        }
      }

      const controller = new AbortController();
      let timeoutId = setTimeout(() => controller.abort(), requestConfig.timeout);

      try {
        const isFormData = typeof FormData !== 'undefined' && requestConfig.data instanceof FormData;
        const requestHeaders = { ...requestConfig.headers };
        if (isFormData) {
          delete requestHeaders['Content-Type'];
        }

        const response = await fetch(requestUrl, {
          method: requestConfig.method,
          headers: requestHeaders,
          body: isFormData
            ? requestConfig.data
            : requestConfig.data
            ? JSON.stringify(requestConfig.data)
            : null,
          signal: controller.signal,
          credentials: 'include',
        });

        // Parse response
        let responseData;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else if (contentType && contentType.includes('application/pdf')) {
          responseData = await response.blob();
        } else {
          responseData = await response.text();
        }

        const result = {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: responseData,
          config: requestConfig,
        };

        // Handle error responses
        if (!response.ok) {
          const error = new APIError(
            responseData?.message || `HTTP ${response.status}`,
            response.status,
            responseData?.errorCode || 'HTTP_ERROR',
            result
          );
          throw error;
        }

        // Execute response interceptors
        const finalResponse = await this.executeResponseInterceptors(result);
        return finalResponse;
      } catch (error) {
        if (error.statusCode !== 401 && error.response?.status !== 401) {
          console.error('[APIClient] Error', {
            method,
            endpoint,
            message: error.message,
            duration: `${Date.now() - startTime}ms`,
          });
        }

        // Execute error interceptors
        const finalError = await this.executeErrorInterceptors(error);
        throw finalError;
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    };

    // Execute with retry logic
    return this.retryWithBackoff(makeRequest, MAX_RETRIES, 1000);
  }

  // Convenience methods
  get(endpoint, config = {}) {
    return this.request('GET', endpoint, null, config);
  }

  post(endpoint, data, config = {}) {
    return this.request('POST', endpoint, data, config);
  }

  put(endpoint, data, config = {}) {
    return this.request('PUT', endpoint, data, config);
  }

  patch(endpoint, data, config = {}) {
    return this.request('PATCH', endpoint, data, config);
  }

  delete(endpoint, config = {}) {
    return this.request('DELETE', endpoint, null, config);
  }
}

/**
 * Custom API Error Class
 */
class APIError extends Error {
  constructor(message, statusCode = 500, errorCode = 'ERROR', response = null) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.response = response;
    this.isAPIError = true;
  }

  isNetworkError() {
    return !this.response;
  }

  isServerError() {
    return this.statusCode >= 500;
  }

  isClientError() {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  isValidationError() {
    return this.statusCode === 400;
  }

  isUnauthorized() {
    return this.statusCode === 401;
  }

  isForbidden() {
    return this.statusCode === 403;
  }

  isNotFound() {
    return this.statusCode === 404;
  }

  isConflict() {
    return this.statusCode === 409;
  }

  isRateLimited() {
    return this.statusCode === 429;
  }
}

// Create default instance
const apiClient = new APIClient();

export { APIClient, APIError, apiClient };
