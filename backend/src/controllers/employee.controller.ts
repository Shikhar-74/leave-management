import { Request, Response, NextFunction } from 'express';
import { createEmployeeSchema } from '../validators/employee.validator';
import { createEmployee } from '../services/employee.service';

/**
 * POST /api/v1/employees
 * Validates body → creates employee → returns 201 with created row.
 */
export async function createEmployeeController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = createEmployeeSchema.parse(req.body);
    const employee = await createEmployee(data);
    res.status(201).json(employee);
  } catch (error) {
    next(error);
  }
}
