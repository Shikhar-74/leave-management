import { Request, Response, NextFunction } from 'express';
import * as profileService from '../services/profile.service';
import {
  updateProfileSchema,
  getAllEmployeesQuerySchema,
  deleteProfileParamSchema,
  deleteProfileQuerySchema,
} from '../validators/profile.validator';
import { AppError } from '../middlewares/error-handler';
import { ZodError } from 'zod';

/**
 * GET /api/v1/profile — Get own profile.
 */
export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const employeeId = req.employee!.id;
    const profile = await profileService.getProfile(employeeId);
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/v1/profile — Update own profile.
 */
export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const employeeId = req.employee!.id;

    let parsed: import('../validators/profile.validator').UpdateProfileInput;
    try {
      parsed = updateProfileSchema.parse(req.body);
    } catch (err) {
      if (err instanceof ZodError) {
        const issue = err.issues[0];
        const path = issue?.path?.[0] as string;

        // Map to spec-specific error codes
        if (path === 'email') {
          throw new AppError(400, 'INVALID_EMAIL_FORMAT', issue.message);
        }
        if (path === 'password') {
          throw new AppError(400, 'PASSWORD_TOO_WEAK', issue.message);
        }
        if (path === 'profile_photo_url') {
          throw new AppError(400, 'INVALID_URL', issue.message);
        }
        // All other validation errors
        throw new AppError(
          400,
          'VALIDATION_ERROR',
          err.issues.map((e: { message: string }) => e.message).join(', '),
        );
      }
      throw err;
    }

    // (Removed EMPLOYEE date_of_birth restriction as requested)

    const result = await profileService.updateProfile(employeeId, parsed, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/employees — List all employees (ADMIN only).
 */
export async function getAllEmployees(req: Request, res: Response, next: NextFunction) {
  try {
    // Admin check
    if (req.employee!.role !== 'ADMIN') {
      throw new AppError(403, 'FORBIDDEN', 'Only admins can access employee list');
    }

    let parsed: import('../validators/profile.validator').GetAllEmployeesQuery;
    try {
      parsed = getAllEmployeesQuerySchema.parse(req.query);
    } catch (err) {
      if (err instanceof ZodError) {
        const issue = err.issues[0];
        const path = issue?.path?.[0] as string;

        // Map to spec-specific error codes
        const errorCodeMap: Record<string, string> = {
          page: 'INVALID_PAGE',
          limit: 'INVALID_LIMIT',
          role: 'INVALID_ROLE_FILTER',
          status: 'INVALID_STATUS_FILTER',
          sort_by: 'INVALID_SORT_BY',
          sort_order: 'INVALID_SORT_ORDER',
        };

        const code = errorCodeMap[path] || 'VALIDATION_ERROR';
        throw new AppError(400, code, issue.message);
      }
      throw err;
    }

    const result = await profileService.getAllEmployees(parsed);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/profile/:employeeId — Soft-delete employee (ADMIN only).
 */
export async function deleteProfile(req: Request, res: Response, next: NextFunction) {
  try {
    // Admin check
    if (req.employee!.role !== 'ADMIN') {
      throw new AppError(403, 'FORBIDDEN', 'Only admins can delete employee profiles');
    }

    const paramParsed = deleteProfileParamSchema.safeParse(req.params);
    if (!paramParsed.success) {
      throw new AppError(400, 'INVALID_EMPLOYEE_ID', 'employee_id must be a positive integer');
    }

    // Validate reason — reject if too long
    const queryParsed = deleteProfileQuerySchema.safeParse(req.query);
    if (!queryParsed.success) {
      throw new AppError(400, 'REASON_TOO_LONG', 'reason must be at most 500 characters');
    }
    const reason = queryParsed.data.reason;

    const result = await profileService.deleteProfile(
      req.employee!.id,
      paramParsed.data.employeeId,
      reason,
      { ip: req.ip, userAgent: req.headers['user-agent'] },
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
}
