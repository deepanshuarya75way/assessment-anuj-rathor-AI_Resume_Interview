/**
 * Global Error Handler Middleware
 * 
 * Standardizes all error responses across the API
 * - Catches operational and programming errors
 * - Returns consistent JSON error format
 * - Logs errors for debugging
 * - Prevents exposure of sensitive info in production
 */

const logger = require('../utils/logger');

// Custom AppError class for operational errors
class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 * Must be the last middleware in Express
 * 
 * Usage: app.use(errorHandler)
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Zod Validation Error
  if (err.name === 'ZodError') {
    const errors = err.errors.map(e => ({
      path: e.path.join('.'),
      message: e.message,
      code: e.code
    }));

    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Validation Error',
      errors,
      errorCode: 'VALIDATION_ERROR'
    });
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.entries(err.errors).map(([field, error]) => ({
      path: field,
      message: error.message
    }));

    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Database Validation Error',
      errors,
      errorCode: 'DB_VALIDATION_ERROR'
    });
  }

  // Mongoose Cast Error (Invalid ID)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: `Invalid ${err.path}: ${err.value}`,
      errorCode: 'INVALID_ID'
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Invalid token',
      errorCode: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Token expired',
      errorCode: 'TOKEN_EXPIRED'
    });
  }

  // Custom App Error (Operational Error)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      errorCode: err.errorCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Programming or Unknown Error
  logger.error('UNHANDLED ERROR:', {
    message: err.message,
    stack: err.stack,
    name: err.name,
    statusCode: err.statusCode
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.statusCode).json({
    success: false,
    statusCode: err.statusCode,
    message: isDevelopment 
      ? err.message 
      : 'Something went wrong on our end. Please try again later.',
    errorCode: 'INTERNAL_SERVER_ERROR',
    ...(isDevelopment && { stack: err.stack })
  });
};

/**
 * Async wrapper to catch async errors
 * Wraps async route handlers to avoid try-catch boilerplate
 * 
 * Usage:
 * router.post('/path', asyncHandler(async (req, res, next) => {
 *   // your code here
 * }))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  asyncHandler,
  AppError
};
