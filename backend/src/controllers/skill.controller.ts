import { Request, Response, NextFunction } from 'express';
import { skillService } from '../services/skill.service';
import { addSkillSchema, employeeIdParamSchema } from '../validators/skill.validator';

export const addSkill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = employeeIdParamSchema.parse(req.params);
    const parsedData = addSkillSchema.parse(req.body);

    const skill = await skillService.addSkill(employeeId, parsedData);

    res.status(201).json(skill);
  } catch (err) {
    next(err);
  }
};

export const getSkills = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = employeeIdParamSchema.parse(req.params);
    const skills = await skillService.getSkills(employeeId);
    
    res.json(skills);
  } catch (err) {
    next(err);
  }
};
