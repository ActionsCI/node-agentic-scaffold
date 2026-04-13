/**
 * Standard Error Envelope — AcmeFintech Platform
 *
 * Every API error response across all services MUST use this format.
 * Do not construct error response objects manually — use these helpers.
 *
 * Envelope shape:
 * {
 *   error: string,   // Human-readable message (for logs, not necessarily for end users)
 *   code: string,     // Machine-readable code, format: SERVICE_ERROR_NAME
 *   fields?: string[] // Present only for validation errors — lists failing field names
 * }
 *
 * See root AGENTS.md Golden Rule #4 and shared/AGENTS.md for full documentation.
 */

'use strict';

/**
 * The canonical error envelope shape. Reference this when validating
 * error responses in tests or when documenting API contracts.
 *
 * @type {{ error: string, code: string, fields?: string[] }}
 */
const ERROR_ENVELOPE_SHAPE = {
  error: 'string (required) — Human-readable error message',
  code: 'string (required) — Machine-readable error code (SERVICE_ERROR_NAME)',
  fields: 'string[] (optional) — Field names that failed validation',
};

/**
 * Named error codes used across the platform.
 * Service-specific codes are defined in each service's AGENTS.md.
 * These are the shared/common codes available to all services.
 */
const ErrorCodes = {
  /** Request body or query params failed schema validation */
  VALIDATION_FAILED: 'VALIDATION_FAILED',

  /** Caller is not authenticated or token is invalid */
  UNAUTHORIZED: 'UNAUTHORIZED',

  /** Requested resource does not exist */
  NOT_FOUND: 'NOT_FOUND',

  /** Caller has exceeded the rate limit for this endpoint */
  RATE_LIMITED: 'RATE_LIMITED',

  /** An unexpected internal error occurred */
  INTERNAL_ERROR: 'INTERNAL_ERROR',

  /** Caller is authenticated but lacks permission for this action */
  FORBIDDEN: 'FORBIDDEN',
};

/**
 * HTTP status codes mapped to common error codes.
 * Used by the error middleware to set the correct response status.
 */
const ErrorHttpStatus = {
  [ErrorCodes.VALIDATION_FAILED]: 400,
  [ErrorCodes.UNAUTHORIZED]: 401,
  [ErrorCodes.FORBIDDEN]: 403,
  [ErrorCodes.NOT_FOUND]: 404,
  [ErrorCodes.RATE_LIMITED]: 429,
  [ErrorCodes.INTERNAL_ERROR]: 500,
};

/**
 * Create a standard error envelope object.
 *
 * @param {string} message — Human-readable error description
 * @param {string} code — Machine-readable error code (use ErrorCodes or service-specific codes)
 * @param {string[]} [fields] — Optional array of field names (for validation errors)
 * @returns {{ error: string, code: string, fields?: string[] }}
 *
 * @example
 * const err = createError('Email is required', ErrorCodes.VALIDATION_FAILED, ['email']);
 * // => { error: 'Email is required', code: 'VALIDATION_FAILED', fields: ['email'] }
 *
 * @example
 * const err = createError('Payment intent not found', 'PAYMENTS_INTENT_NOT_FOUND');
 * // => { error: 'Payment intent not found', code: 'PAYMENTS_INTENT_NOT_FOUND' }
 */
function createError(message, code, fields) {
  if (!message || typeof message !== 'string') {
    throw new Error('createError: message is required and must be a string');
  }
  if (!code || typeof code !== 'string') {
    throw new Error('createError: code is required and must be a string');
  }

  const envelope = { error: message, code };

  if (fields && Array.isArray(fields) && fields.length > 0) {
    envelope.fields = fields;
  }

  return envelope;
}

/**
 * Look up the HTTP status code for a given error code.
 * Returns 500 if the code is not in the shared map (service-specific codes
 * should define their own mappings).
 *
 * @param {string} code — The error code to look up
 * @returns {number} HTTP status code
 */
function getHttpStatus(code) {
  return ErrorHttpStatus[code] || 500;
}

module.exports = {
  ERROR_ENVELOPE_SHAPE,
  ErrorCodes,
  ErrorHttpStatus,
  createError,
  getHttpStatus,
};
