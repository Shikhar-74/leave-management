import { db } from '../db';
import {
  employees,
  employeeProfiles,
  refreshTokens,
  auditLogs,
} from '../db/schema';
import { eq, and, ilike, or, asc, desc, sql, count } from 'drizzle-orm';
import { AppError } from '../middlewares/error-handler';
import bcrypt from 'bcryptjs';
import type { UpdateProfileInput, GetAllEmployeesQuery } from '../validators/profile.validator';

/**
 * Get own profile — merges employees + employee_profiles.
 */
export async function getProfile(employeeId: number) {
  const [employee] = await db
    .select()
    .from(employees)
    .where(eq(employees.id, employeeId))
    .limit(1);

  if (!employee) {
    throw new AppError(404, 'EMPLOYEE_NOT_FOUND', 'Employee not found');
  }

  if (!employee.isActive) {
    throw new AppError(410, 'GONE', 'Profile has been soft-deleted');
  }

  // Fetch extended profile
  const [profile] = await db
    .select()
    .from(employeeProfiles)
    .where(eq(employeeProfiles.employeeId, employeeId))
    .limit(1);

  return {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    role: employee.role,
    department: employee.department,
    joining_date: employee.joiningDate,
    phone_number: employee.phoneNumber,
    designation: employee.designation,
    manager_id: employee.managerId,
    profile_photo_url: profile?.profilePhotoUrl ?? null,
    bio: profile?.bio ?? null,
    address: profile?.address ?? null,
    city: profile?.city ?? null,
    state: profile?.state ?? null,
    postal_code: profile?.postalCode ?? null,
    country: profile?.country ?? null,
    date_of_birth: profile?.dateOfBirth ?? null,
    gender: profile?.gender ?? null,
    marital_status: profile?.maritalStatus ?? null,
    emergency_contact_name: profile?.emergencyContactName ?? null,
    emergency_contact_phone: profile?.emergencyContactPhone ?? null,
    emergency_contact_relationship: profile?.emergencyContactRelationship ?? null,
    created_at: employee.createdAt.toISOString(),
    updated_at: (employee.updatedAt ?? employee.createdAt).toISOString(),
  };
}

/**
 * Update own profile — partial update, merges employees + employee_profiles.
 */
export async function updateProfile(
  employeeId: number,
  data: UpdateProfileInput,
  requestMeta: { ip?: string; userAgent?: string },
) {
  // Check employee exists and is active
  const [employee] = await db
    .select()
    .from(employees)
    .where(eq(employees.id, employeeId))
    .limit(1);

  if (!employee) throw new AppError(404, 'EMPLOYEE_NOT_FOUND', 'Employee not found');
  if (!employee.isActive) throw new AppError(410, 'GONE', 'Profile has been soft-deleted');

  // Check email uniqueness if changing
  if (data.email && data.email.toLowerCase() !== employee.email.toLowerCase()) {
    const [existing] = await db
      .select({ id: employees.id })
      .from(employees)
      .where(eq(sql`lower(${employees.email})`, data.email.toLowerCase()))
      .limit(1);

    if (existing) throw new AppError(409, 'DUPLICATE_EMAIL', 'Email already in use by another employee');
  }

  // Check manager_id is not self
  if (data.manager_id && data.manager_id === employeeId) {
    throw new AppError(400, 'INVALID_MANAGER_ID', 'Cannot set self as manager');
  }

  // Check manager exists
  if (data.manager_id) {
    const [mgr] = await db.select({ id: employees.id }).from(employees).where(eq(employees.id, data.manager_id)).limit(1);
    if (!mgr) throw new AppError(400, 'INVALID_MANAGER_ID', 'Manager employee not found');
  }

  const fieldsUpdated: string[] = [];

  // --- Update employees table ---
  const empUpdate: Record<string, unknown> = { updatedAt: new Date() };

  if (data.name !== undefined) { empUpdate.name = data.name; fieldsUpdated.push('name'); }
  if (data.email !== undefined) { empUpdate.email = data.email.toLowerCase(); fieldsUpdated.push('email'); }
  if (data.phone_number !== undefined) { empUpdate.phoneNumber = data.phone_number; fieldsUpdated.push('phone_number'); }
  if (data.designation !== undefined) { empUpdate.designation = data.designation; fieldsUpdated.push('designation'); }
  if (data.department !== undefined) { empUpdate.department = data.department; fieldsUpdated.push('department'); }
  if (data.manager_id !== undefined) { empUpdate.managerId = data.manager_id; fieldsUpdated.push('manager_id'); }

  // Hash new password if provided
  if (data.password) {
    empUpdate.passwordHash = await bcrypt.hash(data.password, 12);
    fieldsUpdated.push('password');
  }

  await db.update(employees).set(empUpdate).where(eq(employees.id, employeeId));

  // --- Upsert employee_profiles ---
  const profileFields: Record<string, unknown> = { updatedAt: new Date() };
  let hasProfileUpdate = false;

  if (data.profile_photo_url !== undefined) { profileFields.profilePhotoUrl = data.profile_photo_url; fieldsUpdated.push('profile_photo_url'); hasProfileUpdate = true; }
  if (data.bio !== undefined) { profileFields.bio = data.bio; fieldsUpdated.push('bio'); hasProfileUpdate = true; }
  if (data.address !== undefined) { profileFields.address = data.address; fieldsUpdated.push('address'); hasProfileUpdate = true; }
  if (data.city !== undefined) { profileFields.city = data.city; fieldsUpdated.push('city'); hasProfileUpdate = true; }
  if (data.state !== undefined) { profileFields.state = data.state; fieldsUpdated.push('state'); hasProfileUpdate = true; }
  if (data.postal_code !== undefined) { profileFields.postalCode = data.postal_code; fieldsUpdated.push('postal_code'); hasProfileUpdate = true; }
  if (data.country !== undefined) { profileFields.country = data.country; fieldsUpdated.push('country'); hasProfileUpdate = true; }
  if (data.date_of_birth !== undefined) { profileFields.dateOfBirth = data.date_of_birth; fieldsUpdated.push('date_of_birth'); hasProfileUpdate = true; }
  if (data.gender !== undefined) { profileFields.gender = data.gender; fieldsUpdated.push('gender'); hasProfileUpdate = true; }
  if (data.marital_status !== undefined) { profileFields.maritalStatus = data.marital_status; fieldsUpdated.push('marital_status'); hasProfileUpdate = true; }
  if (data.emergency_contact_name !== undefined) { profileFields.emergencyContactName = data.emergency_contact_name; fieldsUpdated.push('emergency_contact_name'); hasProfileUpdate = true; }
  if (data.emergency_contact_phone !== undefined) { profileFields.emergencyContactPhone = data.emergency_contact_phone; fieldsUpdated.push('emergency_contact_phone'); hasProfileUpdate = true; }
  if (data.emergency_contact_relationship !== undefined) { profileFields.emergencyContactRelationship = data.emergency_contact_relationship; fieldsUpdated.push('emergency_contact_relationship'); hasProfileUpdate = true; }

  if (hasProfileUpdate) {
    const [existingProfile] = await db
      .select({ id: employeeProfiles.id })
      .from(employeeProfiles)
      .where(eq(employeeProfiles.employeeId, employeeId))
      .limit(1);

    if (existingProfile) {
      await db.update(employeeProfiles).set(profileFields).where(eq(employeeProfiles.employeeId, employeeId));
    } else {
      await db.insert(employeeProfiles).values({
        employeeId,
        ...profileFields,
      } as typeof employeeProfiles.$inferInsert);
    }
  }

  // --- Audit log ---
  if (fieldsUpdated.length > 0) {
    await db.insert(auditLogs).values({
      employeeId,
      actionType: data.password ? 'PASSWORD_CHANGE' : 'UPDATE_PROFILE',
      targetEmployeeId: employeeId,
      changes: { fields_updated: fieldsUpdated, timestamp: new Date().toISOString() },
      ipAddress: requestMeta.ip ?? null,
      userAgent: requestMeta.userAgent ?? null,
    });
  }

  // Return updated profile
  const updatedProfile = await getProfile(employeeId);
  return {
    message: 'Profile updated successfully',
    ...updatedProfile,
    changes: {
      fields_updated: fieldsUpdated,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Get all employees — ADMIN only — paginated with filters.
 */
export async function getAllEmployees(query: GetAllEmployeesQuery) {
  const { page, limit, role, department, status, search, sort_by, sort_order } = query;

  // Build conditions
  const conditions = [];

  // Status filter
  if (status === 'active') {
    conditions.push(eq(employees.isActive, true));
  } else {
    conditions.push(eq(employees.isActive, false));
  }

  // Role filter
  if (role) {
    conditions.push(eq(employees.role, role));
  }

  // Department filter
  if (department) {
    conditions.push(eq(employees.department, department));
  }

  // Search filter — escape SQL wildcards as literal characters
  if (search && search.trim()) {
    const sanitized = search.replace(/%/g, '\\%').replace(/_/g, '\\_');
    conditions.push(
      or(
        ilike(employees.name, `%${sanitized}%`),
        ilike(employees.email, `%${sanitized}%`),
      ),
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [countResult] = await db
    .select({ value: count() })
    .from(employees)
    .where(whereClause);

  const total = Number(countResult?.value ?? 0);
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;

  // Sort
  const sortColumn = {
    created_at: employees.createdAt,
    name: employees.name,
    email: employees.email,
    department: employees.department,
    joining_date: employees.joiningDate,
  }[sort_by] ?? employees.createdAt;

  const sortFn = sort_order === 'asc' ? asc : desc;

  // Fetch employees
  const result = await db
    .select({
      id: employees.id,
      name: employees.name,
      email: employees.email,
      role: employees.role,
      department: employees.department,
      joining_date: employees.joiningDate,
      designation: employees.designation,
      is_active: employees.isActive,
      created_at: employees.createdAt,
    })
    .from(employees)
    .where(whereClause)
    .orderBy(sortFn(sortColumn))
    .limit(limit)
    .offset(offset);

  return {
    total,
    page,
    limit,
    total_pages: totalPages,
    employees: result,
  };
}

/**
 * Soft-delete an employee profile — ADMIN only.
 */
export async function deleteProfile(
  adminId: number,
  targetId: number,
  reason: string | undefined,
  requestMeta: { ip?: string; userAgent?: string },
) {
  // Cannot delete self
  if (adminId === targetId) {
    throw new AppError(409, 'CANNOT_DELETE_SELF', 'Admin cannot delete own account');
  }

  const [employee] = await db
    .select()
    .from(employees)
    .where(eq(employees.id, targetId))
    .limit(1);

  if (!employee) {
    throw new AppError(404, 'EMPLOYEE_NOT_FOUND', 'Employee not found');
  }

  if (!employee.isActive) {
    throw new AppError(409, 'ALREADY_DELETED', 'Employee is already soft-deleted');
  }

  // Soft delete
  const now = new Date();
  await db.update(employees).set({ isActive: false, updatedAt: now }).where(eq(employees.id, targetId));

  // Revoke all refresh tokens
  await db
    .update(refreshTokens)
    .set({ revoked: true })
    .where(eq(refreshTokens.employeeId, targetId));

  // Audit log
  await db.insert(auditLogs).values({
    employeeId: adminId,
    actionType: 'DELETE_PROFILE',
    targetEmployeeId: targetId,
    changes: { action: 'soft_delete', is_active: false },
    reason: reason ?? null,
    ipAddress: requestMeta.ip ?? null,
    userAgent: requestMeta.userAgent ?? null,
  });

  return {
    message: 'Employee profile deleted successfully',
    employee_id: targetId,
    name: employee.name,
    email: employee.email,
    deleted_at: now.toISOString(),
    is_active: false,
  };
}
