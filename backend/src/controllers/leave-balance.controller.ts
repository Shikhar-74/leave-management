import { Request, Response, NextFunction } from 'express';
import { leaveBalanceQuerySchema } from '../validators/leave-balance.validator';
import { getLeaveBalance } from '../services/leave-balance.service';

/**
 * GET /api/v1/employees/:employeeId/leave-balance?year=YYYY
 * Auth required. EMPLOYEE can only query own; ADMIN can query any.
 */
export async function getLeaveBalanceController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { employeeId, year } = leaveBalanceQuerySchema.parse({
      employeeId: req.params.employeeId,
      year: req.query.year,
    });

    // Authorization: EMPLOYEE can only view own data
    if (req.employee!.role === 'EMPLOYEE' && req.employee!.id !== employeeId) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: 'You can only view your own leave balance',
        status: 403,
      });
      return;
    }

    const data = await getLeaveBalance(employeeId, year);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}
