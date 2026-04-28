/**
 * Centralized error handling utilities for security
 */

// Error types for better classification
export enum ErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NETWORK = 'network',
  SERVER = 'server',
  RATE_LIMIT = 'rate_limit',
  UNKNOWN = 'unknown'
}

// Standardized error response structure
export interface SecurityError {
  type: ErrorType;
  message: string;
  statusCode: number;
  shouldLog: boolean;
  userFriendly: boolean;
}

// Error message mapping (user-friendly, non-sensitive messages)
const errorMessages: Record<ErrorType, string> = {
  [ErrorType.VALIDATION]: 'Invalid input provided. Please check your information and try again.',
  [ErrorType.AUTHENTICATION]: 'Invalid credentials. Please check your username and password.',
  [ErrorType.AUTHORIZATION]: 'You do not have permission to perform this action.',
  [ErrorType.NETWORK]: 'Network error occurred. Please check your connection and try again.',
  [ErrorType.SERVER]: 'An unexpected error occurred. Please try again later.',
  [ErrorType.RATE_LIMIT]: 'Too many requests. Please wait before trying again.',
  [ErrorType.UNKNOWN]: 'An error occurred. Please try again.'
};

// Classify errors based on error details
export function classifyError(error: any): ErrorType {
  if (error?.name === 'ValidationError' || error?.type === 'validation') {
    return ErrorType.VALIDATION;
  }
  
  if (error?.status === 401 || error?.statusCode === 401 || error?.message?.includes('unauthorized')) {
    return ErrorType.AUTHENTICATION;
  }
  
  if (error?.status === 403 || error?.statusCode === 403 || error?.message?.includes('forbidden')) {
    return ErrorType.AUTHORIZATION;
  }
  
  if (error?.status === 429 || error?.statusCode === 429 || error?.message?.includes('rate limit')) {
    return ErrorType.RATE_LIMIT;
  }
  
  if (error?.name === 'NetworkError' || error?.message?.includes('fetch') || error?.message?.includes('network')) {
    return ErrorType.NETWORK;
  }
  
  if (error?.status >= 500 || error?.statusCode >= 500) {
    return ErrorType.SERVER;
  }
  
  return ErrorType.UNKNOWN;
}

// Create standardized error response
export function createSecurityError(
  error: any,
  defaultMessage?: string
): SecurityError {
  // Handle null, undefined, or invalid error objects
  if (!error || typeof error !== 'object') {
    return {
      type: ErrorType.UNKNOWN,
      message: defaultMessage || errorMessages[ErrorType.UNKNOWN],
      statusCode: 500,
      shouldLog: true,
      userFriendly: true
    };
  }
  
  const errorType = classifyError(error);
  const statusCode = error?.status || error?.statusCode || 500;
  
  return {
    type: errorType,
    message: defaultMessage || errorMessages[errorType],
    statusCode,
    shouldLog: errorType !== ErrorType.VALIDATION && errorType !== ErrorType.AUTHENTICATION,
    userFriendly: true
  };
}

// Safe error logging (don't log sensitive information)
export function logSecurityError(error: SecurityError, context?: string, originalError?: any) {
  // Defensive check for malformed error objects
  if (!error || typeof error !== 'object') {
    console.error('Security Error: Invalid error object received', { error, context });
    return;
  }
  
  if (!error.shouldLog) return;
  
  const logData = {
    type: error.type || ErrorType.UNKNOWN,
    statusCode: error.statusCode || 500,
    message: error.message || 'No error message provided',
    context: context || 'unknown',
    timestamp: new Date().toISOString(),
    // Include non-sensitive error details
    originalError: originalError ? {
      name: originalError?.name || 'Unknown',
      message: originalError?.message?.replace(/password/i, '***').replace(/token/i, '***') || 'No message'
    } : undefined
  };
  
  // In production, send to logging service
  if (process.env.NODE_ENV === 'production') {
    console.error('Security Error:', JSON.stringify(logData));
  } else {
    console.error('Security Error:', logData);
  }
}

// Client-side error handler for forms
export function handleFormError(error: any, context: string): string {
  const securityError = createSecurityError(error);
  logSecurityError(securityError, context, error);
  
  return securityError.message;
}

// API error handler
export function handleAPIError(error: any, context: string): Response {
  const securityError = createSecurityError(error);
  logSecurityError(securityError, context, error);
  
  return new Response(
    JSON.stringify({
      error: securityError.message,
      type: securityError.type,
      timestamp: new Date().toISOString()
    }),
    {
      status: securityError.statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Error-Type': securityError.type
      }
    }
  );
}

// Validation error creator
export function createValidationError(message: string): SecurityError {
  return {
    type: ErrorType.VALIDATION,
    message,
    statusCode: 400,
    shouldLog: false,
    userFriendly: true
  };
}

// Rate limit error creator
export function createRateLimitError(retryAfter?: number): SecurityError {
  return {
    type: ErrorType.RATE_LIMIT,
    message: retryAfter 
      ? `Too many requests. Please wait ${retryAfter} seconds before trying again.`
      : 'Too many requests. Please wait before trying again.',
    statusCode: 429,
    shouldLog: true,
    userFriendly: true
  };
}

// Authentication error creator
export function createAuthError(message?: string): SecurityError {
  return {
    type: ErrorType.AUTHENTICATION,
    message: message || 'Invalid credentials. Please check your username and password.',
    statusCode: 401,
    shouldLog: false,
    userFriendly: true
  };
}

// Server error creator (generic)
export function createServerError(): SecurityError {
  return {
    type: ErrorType.SERVER,
    message: 'An unexpected error occurred. Please try again later.',
    statusCode: 500,
    shouldLog: true,
    userFriendly: true
  };
}

// Input sanitization for error messages
export function sanitizeErrorMessage(message: string): string {
  if (typeof message !== 'string') return '';
  
  // Remove potential sensitive information
  return message
    .replace(/password[=:]\s*\S+/gi, 'password: ***')
    .replace(/token[=:]\s*\S+/gi, 'token: ***')
    .replace(/secret[=:]\s*\S+/gi, 'secret: ***')
    .replace(/key[=:]\s*\S+/gi, 'key: ***')
    .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '****-****-****-****') // Credit cards
    .replace(/\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g, '***-**-****'); // SSN pattern
}
