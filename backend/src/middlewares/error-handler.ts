import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * Custom application error.
 * `errorCode` is the machine-readable identifier (e.g. "EMPLOYEE_NOT_FOUND").
 * `isOperational` distinguishes expected errors from unexpected crashes.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;

  constructor(statusCode: number, errorCode: string, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Check if an error is a PostgreSQL connection/pool error (DB down).
 */
function isDbConnectionError(err: Error): boolean {
  const msg = err.message?.toLowerCase() ?? '';
  const code = (err as any).code;
  return (
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    code === 'ETIMEDOUT' ||
    code === 'ECONNRESET' ||
    msg.includes('connection refused') ||
    msg.includes('connection terminated') ||
    msg.includes('connection timeout') ||
    msg.includes('cannot acquire a client') ||
    msg.includes('pool is full') ||
    msg.includes('the database system is shutting down')
  );
}

/**
 * Global error-handling middleware.
 *
 * Produces the spec-defined error format:
 *   { "error": "CODE", "message": "Human-readable message", "status": 400 }
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // ── Zod validation errors ─────────────────────────────────────
  if (err instanceof ZodError) {
    // Check for password-specific issues → 422 PASSWORD_TOO_WEAK
    const passwordIssue = err.issues.find((i) => i.path.includes('password'));
    if (passwordIssue) {
      res.status(422).json({
        error: 'PASSWORD_TOO_WEAK',
        message: passwordIssue.message,
        status: 422,
      });
      return;
    }

    // All other validation errors → 400 VALIDATION_ERROR
    const firstIssue = err.issues[0];
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: firstIssue
        ? `${firstIssue.path.join('.')}: ${firstIssue.message}`
        : 'Validation failed',
      status: 400,
    });
    return;
  }

  // ── Known operational errors ──────────────────────────────────
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.errorCode,
      message: err.message,
      status: err.statusCode,
    });
    return;
  }

  // ── Database connection errors → 503 ──────────────────────────
  if (isDbConnectionError(err)) {
    res.set('Retry-After', '30');
    res.status(503).json({
      error: 'SERVICE_UNAVAILABLE',
      message: 'Database is temporarily unavailable. Please try again later.',
      status: 503,
    });
    return;
  }

  // ── Unexpected errors → 500 ───────────────────────────────────
  console.error('💥 Unhandled error:', err);
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'Internal server error',
    status: 500,
  });
};
