import { pgTable, serial, integer, varchar, date, timestamp, index } from 'drizzle-orm/pg-core';
import { pgEnum } from 'drizzle-orm/pg-core';
import { employees } from './employees';

/**
 * Gender enum.
 */
export const genderEnum = pgEnum('gender', ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']);

/**
 * Marital status enum.
 */
export const maritalStatusEnum = pgEnum('marital_status', [
  'SINGLE',
  'MARRIED',
  'DIVORCED',
  'WIDOWED',
  'PREFER_NOT_TO_SAY',
]);

/**
 * employee_profiles table — extended profile information.
 * One-to-one with employees. Keeps core employees table lean.
 */
export const employeeProfiles = pgTable(
  'employee_profiles',
  {
    id: serial('id').primaryKey(),
    employeeId: integer('employee_id')
      .notNull()
      .unique()
      .references(() => employees.id, { onDelete: 'cascade' }),
    profilePhotoUrl: varchar('profile_photo_url', { length: 2048 }),
    bio: varchar('bio', { length: 500 }),
    address: varchar('address', { length: 200 }),
    city: varchar('city', { length: 50 }),
    state: varchar('state', { length: 50 }),
    postalCode: varchar('postal_code', { length: 20 }),
    country: varchar('country', { length: 50 }),
    dateOfBirth: date('date_of_birth'),
    gender: genderEnum('gender'),
    maritalStatus: maritalStatusEnum('marital_status'),
    emergencyContactName: varchar('emergency_contact_name', { length: 100 }),
    emergencyContactPhone: varchar('emergency_contact_phone', { length: 20 }),
    emergencyContactRelationship: varchar('emergency_contact_relationship', { length: 50 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_employee_profiles_employee_id').on(table.employeeId),
  ],
);
