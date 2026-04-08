import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config';

/**
 * Shape of the JWT payload stored in access tokens.
 */
export interface JwtPayload {
  sub: number;       // employee id
  role: string;      // EMPLOYEE | ADMIN
  iat?: number;
  exp?: number;
}

/**
 * Extend Express Request to carry the authenticated employee info.
 */
declare global {
  namespace Express {
    interface Request {
      employee?: {
        id: number;
        role: string;
      };
    }
  }
}

/**
 * JWT authentication middleware.
 * Verifies the Bearer token from the Authorization header.
 * Attaches `req.employee` with `id` and `role` on success.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Missing or invalid Authorization header',
      status: 401,
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as unknown as JwtPayload;
    req.employee = {
      id: decoded.sub,
      role: decoded.role,
    };
    next();
  } catch (err: unknown) {
    const isExpired =
      typeof err === 'object' &&
      err !== null &&
      'name' in err &&
      (err as { name: string }).name === 'TokenExpiredError';

    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: isExpired ? 'Access token has expired' : 'Invalid access token',
      status: 401,
    });
  }
}

/**
 * Role-based authorization middleware.
 * Should be used AFTER `authenticate` middleware.
 * Ensures the authenticated user has one of the allowed roles.
 */
export function authorizeRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.employee) {
      res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required',
        status: 401,
      });
      return;
    }

    if (!roles.includes(req.employee.role)) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: 'You do not have permission to access this resource',
        status: 403,
      });
      return;
    }

    next();
  };
}
