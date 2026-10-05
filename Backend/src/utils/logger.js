/**
 * Simple Logger Utility
 * 
 * Provides structured logging for debugging and monitoring
 * Logs to console in development, can be extended for production
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = {
  /**
   * Log general info
   */
  info: (message, data = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO: ${message}`, isDevelopment ? data : '');
  },

  /**
   * Log warnings
   */
  warn: (message, data = {}) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] WARN: ${message}`, isDevelopment ? data : '');
  },

  /**
   * Log errors
   */
  error: (message, data = {}) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${message}`, isDevelopment ? data : '');
  },

  /**
   * Log debug info (dev only)
   */
  debug: (message, data = {}) => {
    if (!isDevelopment) return;
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] DEBUG: ${message}`, data);
  },

  /**
   * Log performance metrics
   */
  metric: (label, duration) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] METRIC: ${label} took ${duration}ms`);
  }
};

module.exports = logger;
