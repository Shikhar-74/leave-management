import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { env } from './config';
import authRoutes from './routes/auth.routes';
import leaveBalanceRoutes from './routes/leave-balance.routes';
import leaveRoutes from './routes/leave.routes';
import employeeRoutes from './routes/employee.routes';
import leavePolicyRoutes from './routes/leave-policy.routes';
import { errorHandler } from './middlewares/error-handler';

/**
 * Express application entry point.
 *
 * Middleware pipeline:
 *  1. CORS
 *  2. JSON body parser
 *  3. Feature routes
 *  4. Global error handler (must be last)
 */
const app = express();

// ── Global middleware ────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health check ─────────────────────────────────────────────────
app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: `Server is running on port ${env.PORT}` });
});

// ── Feature routes ───────────────────────────────────────────────
app.use(authRoutes);                 // POST /api/v1/auth/signup|login|logout|refresh
app.use(leaveBalanceRoutes);         // GET  /api/v1/employees/:id/leave-balance
app.use(leaveRoutes);                // POST /api/v1/leaves/apply, GET /my, GET /:id, PATCH /:id/cancel
app.use(employeeRoutes);             // POST /api/v1/employees  (utility — seed employees)
app.use(leavePolicyRoutes);          // POST /api/v1/leave-policies (utility — seed policies)

// ── Error handler (must be registered LAST) ──────────────────────
app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────────
app.listen(env.PORT, () => {
  console.log(`🚀 Server started on http://localhost:${env.PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
});