import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

/**
 * PostgreSQL connection pool.
 * The pool manages a set of reusable connections so we don't open/close
 * a connection on every query.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Drizzle ORM instance with schema awareness.
 * Passing `schema` enables the relational query builder
 * (db.query.employees.findFirst(), etc.).
 */
export const db = drizzle(pool, { schema });