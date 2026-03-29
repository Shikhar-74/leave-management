import { eq } from 'drizzle-orm';
import { db } from '../db';
import { employeeSkills, employees } from '../db/schema';
import { AppError } from '../middlewares/error-handler';
import { AddSkillInput } from '../validators/skill.validator';

export const skillService = {
  addSkill: async (employeeId: number, data: AddSkillInput) => {
    // 1. Check if employee exists
    const employee = await db.query.employees.findFirst({
      where: eq(employees.id, employeeId),
    });

    if (!employee) {
      throw new AppError(404, 'EMPLOYEE_NOT_FOUND', `Employee with ID ${employeeId} not found`);
    }

    // 2. Normalize skill name
    const normalizedSkillName = data.skill_name.trim().toLowerCase();

    // 3. Insert record, handle Unique Constraint
    try {
      const [newSkill] = await db.insert(employeeSkills).values({
        employeeId,
        skillName: normalizedSkillName,
        proficiency: data.proficiency,
      }).returning();

      return {
        id: newSkill.id,
        employee_id: newSkill.employeeId,
        skill_name: newSkill.skillName,
        proficiency: newSkill.proficiency,
        created_at: newSkill.createdAt,
      };
    } catch (error: any) {
      // Postgres error code for unique_violation is '23505'
      if (error.code === '23505') {
        throw new AppError(409, 'DUPLICATE_SKILL', `Skill '${normalizedSkillName}' already exists for this employee`);
      }
      throw error;
    }
  },

  getSkills: async (employeeId: number) => {
    const skills = await db.query.employeeSkills.findMany({
      where: eq(employeeSkills.employeeId, employeeId),
      orderBy: (employeeSkills, { desc }) => [desc(employeeSkills.createdAt)],
    });

    return skills.map(s => ({
      id: s.id,
      employee_id: s.employeeId,
      skill_name: s.skillName,
      proficiency: s.proficiency,
      created_at: s.createdAt,
    }));
  }
};
