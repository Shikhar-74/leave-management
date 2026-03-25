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
