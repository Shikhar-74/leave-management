import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Kit configuration.
 * Used by `drizzle-kit generate` (creates SQL migrations) and
 * `drizzle-kit migrate` (applies them to the database).
 */
export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
