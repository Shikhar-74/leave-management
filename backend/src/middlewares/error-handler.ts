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
  // ── Zod validation errors → 400 ───────────────────────────────
  if (err instanceof ZodError) {
    const firstIssue = err.issues[0];
    res.status(400).json({
      error: 'BAD_REQUEST',
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

  // ── Unexpected errors → 500 ───────────────────────────────────
  console.error('💥 Unhandled error:', err);
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error',
    status: 500,
  });
};
