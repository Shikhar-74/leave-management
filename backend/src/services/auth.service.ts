import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { employees, refreshTokens } from '../db/schema';
import { AppError } from '../middlewares/error-handler';
import { env } from '../config';
import type { SignupInput, LoginInput } from '../validators/auth.validator';

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const ACCESS_TOKEN_EXPIRY_SECONDS = 900;
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

/**
 * Generate a random opaque refresh token.
 */
function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString('hex');
}

/**
 * SHA-256 hash a refresh token for storage.
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a JWT access token.
 */
function generateAccessToken(employeeId: number, role: string): string {
  return jwt.sign({ sub: employeeId, role }, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

/**
 * Store a hashed refresh token in the database.
 */
async function storeRefreshToken(employeeId: number, rawToken: string): Promise<void> {
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await db.insert(refreshTokens).values({
    employeeId,
    tokenHash,
    expiresAt,
  });
}

/**
 * Revoke all refresh tokens for an employee.
 */
async function revokeAllTokens(employeeId: number): Promise<void> {
  await db
    .update(refreshTokens)
    .set({ revoked: true })
    .where(
      and(eq(refreshTokens.employeeId, employeeId), eq(refreshTokens.revoked, false)),
    );
}

// ── SIGNUP ────────────────────────────────────────────────────────

export async function signup(data: SignupInput) {
  const emailLower = data.email.toLowerCase();

  // Check duplicate email (case-insensitive)
  const existing = await db.query.employees.findFirst({
    where: eq(employees.email, emailLower),
  });

  if (existing) {
    throw new AppError(409, 'DUPLICATE_EMAIL', 'Email already registered');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  // Insert employee
  const [employee] = await db
    .insert(employees)
    .values({
      name: data.name,
      email: emailLower,
      passwordHash,
      role: data.role || 'EMPLOYEE',
      department: data.department || null,
    })
    .returning({
      id: employees.id,
      name: employees.name,
      email: employees.email,
      role: employees.role,
    });

  // Generate tokens
  const accessToken = generateAccessToken(employee.id, employee.role);
  const rawRefreshToken = generateRefreshToken();
  await storeRefreshToken(employee.id, rawRefreshToken);

  return {
    message: 'Account created successfully',
    access_token: accessToken,
    refresh_token: rawRefreshToken,
    expires_in: ACCESS_TOKEN_EXPIRY_SECONDS,
    employee: {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
    },
  };
}

// ── LOGIN ─────────────────────────────────────────────────────────

export async function login(data: LoginInput) {
  const emailLower = data.email.toLowerCase();

  // Lookup employee
  const employee = await db.query.employees.findFirst({
    where: eq(employees.email, emailLower),
  });

  if (!employee) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  // Check if account is deactivated
  if (!employee.isActive) {
    throw new AppError(403, 'ACCOUNT_INACTIVE', 'Account has been deactivated');
  }

  // Check if account is locked
  if (employee.lockedUntil && new Date(employee.lockedUntil) > new Date()) {
    const secondsRemaining = Math.ceil(
      (new Date(employee.lockedUntil).getTime() - Date.now()) / 1000,
    );
    throw new AppError(
      429,
      'ACCOUNT_LOCKED',
      `Account is locked. Try again in ${secondsRemaining} seconds`,
    );
  }

  // If lock has expired, reset
  if (employee.lockedUntil && new Date(employee.lockedUntil) <= new Date()) {
    await db
      .update(employees)
      .set({ failedAttempts: 0, lockedUntil: null })
      .where(eq(employees.id, employee.id));
    employee.failedAttempts = 0;
    employee.lockedUntil = null;
  }

  // Verify password
  const passwordMatch = await bcrypt.compare(data.password, employee.passwordHash);

  if (!passwordMatch) {
    const newFailedAttempts = employee.failedAttempts + 1;

    if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
      // Lock account
      const lockedUntil = new Date();
      lockedUntil.setMinutes(lockedUntil.getMinutes() + LOCK_DURATION_MINUTES);

      await db
        .update(employees)
        .set({ failedAttempts: newFailedAttempts, lockedUntil })
        .where(eq(employees.id, employee.id));

      throw new AppError(
        429,
        'ACCOUNT_LOCKED',
        `Too many failed attempts. Account locked for ${LOCK_DURATION_MINUTES} minutes`,
      );
    }

    await db
      .update(employees)
      .set({ failedAttempts: newFailedAttempts })
      .where(eq(employees.id, employee.id));

    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  // Success — reset counter
  await db
    .update(employees)
    .set({ failedAttempts: 0, lockedUntil: null })
    .where(eq(employees.id, employee.id));

  // Revoke old refresh tokens
  await revokeAllTokens(employee.id);

  // Generate new tokens
  const accessToken = generateAccessToken(employee.id, employee.role);
  const rawRefreshToken = generateRefreshToken();
  await storeRefreshToken(employee.id, rawRefreshToken);

  return {
    access_token: accessToken,
    refresh_token: rawRefreshToken,
    expires_in: ACCESS_TOKEN_EXPIRY_SECONDS,
    employee: {
      id: employee.id,
      name: employee.name,
      role: employee.role,
    },
  };
}

// ── LOGOUT ────────────────────────────────────────────────────────

export async function logout(rawRefreshToken: string) {
  const tokenHash = hashToken(rawRefreshToken);

  // Revoke — idempotent (no error if not found or already revoked)
  await db
    .update(refreshTokens)
    .set({ revoked: true })
    .where(eq(refreshTokens.tokenHash, tokenHash));

  return { message: 'Logged out successfully' };
}

// ── REFRESH ───────────────────────────────────────────────────────

export async function refresh(rawRefreshToken: string) {
  const tokenHash = hashToken(rawRefreshToken);

  const storedToken = await db.query.refreshTokens.findFirst({
    where: eq(refreshTokens.tokenHash, tokenHash),
  });

  if (!storedToken) {
    throw new AppError(401, 'TOKEN_INVALID', 'Refresh token not found — tampered or unknown');
  }

  if (storedToken.revoked) {
    throw new AppError(401, 'TOKEN_REVOKED', 'Refresh token has been revoked');
  }

  if (new Date(storedToken.expiresAt) < new Date()) {
    throw new AppError(401, 'TOKEN_EXPIRED', 'Refresh token has expired');
  }

  // Lookup employee for role
  const employee = await db.query.employees.findFirst({
    where: eq(employees.id, storedToken.employeeId),
  });

  if (!employee) {
    throw new AppError(401, 'TOKEN_INVALID', 'Associated employee not found');
  }

  const accessToken = generateAccessToken(employee.id, employee.role);

  return {
    access_token: accessToken,
    expires_in: ACCESS_TOKEN_EXPIRY_SECONDS,
  };
}
