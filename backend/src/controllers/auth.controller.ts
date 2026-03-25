import { Request, Response, NextFunction } from 'express';
import {
  signupSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
} from '../validators/auth.validator';
import * as authService from '../services/auth.service';
import { ZodError } from 'zod';
import { AppError } from '../middlewares/error-handler';

/**
 * POST /api/v1/auth/signup
 */
export async function signupController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = signupSchema.parse(req.body);
    const result = await authService.signup(data);
    res.status(201).json(result);
  } catch (error) {
    // Map Zod password-related errors to 422
    if (error instanceof ZodError) {
      const passwordIssue = error.issues.find((i) => i.path.includes('password'));
      if (passwordIssue) {
        res.status(422).json({
          error: 'PASSWORD_TOO_WEAK',
          message: passwordIssue.message,
          status: 422,
        });
        return;
      }
    }
    next(error);
  }
}

/**
 * POST /api/v1/auth/login
 */
export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/logout
 */
export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = logoutSchema.parse(req.body);
    const result = await authService.logout(data.refresh_token);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/refresh
 */
export async function refreshController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = refreshSchema.parse(req.body);
    const result = await authService.refresh(data.refresh_token);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
