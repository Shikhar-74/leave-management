import { z } from 'zod';

/**
 * Password must be min 8 chars, 1 uppercase, 1 digit, 1 special character.
 */
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least 1 digit')
  .regex(/[!@#$%^&*]/, 'Password must contain at least 1 special character (!@#$%^&*)');

/**
 * Signup request body — strict mode rejects unknown keys.
 */
export const signupSchema = z
  .object({
    name: z
      .string({ message: 'name must be a string' })
      .min(2, 'name must be at least 2 characters')
      .max(100, 'name must be at most 100 characters')
      .regex(/^[A-Za-z\s'\-]+$/, 'name must contain only letters, spaces, hyphens, or apostrophes'),
    email: z
      .string({ message: 'email is required' })
      .email('Invalid email format')
      .max(255),
    password: passwordSchema,
    role: z.enum(['EMPLOYEE', 'ADMIN']),
    department: z.string().max(100, 'department must be at most 100 characters').optional(),
  })
  .strict();

export type SignupInput = z.infer<typeof signupSchema>;

/**
 * Login request body.
 */
export const loginSchema = z.object({
  email: z.string({ message: 'email is required' }).email('Invalid email format'),
  password: z.string({ message: 'password is required' }).min(1, 'password is required'),
}).strict();

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Logout request body.
 */
export const logoutSchema = z.object({
  refresh_token: z
    .string({ message: 'refresh_token is required' })
    .min(1, 'refresh_token is required'),
}).strict();

export type LogoutInput = z.infer<typeof logoutSchema>;

/**
 * Refresh token request body.
 */
export const refreshSchema = z.object({
  refresh_token: z
    .string({ message: 'refresh_token is required' })
    .min(1, 'refresh_token is required'),
}).strict();

export type RefreshInput = z.infer<typeof refreshSchema>;
