// services/auth-service/src/db.ts
import { Pool } from "pg";
import { config } from "./config";

/**
 * ============================================================================
 * SKILL.SCH LAB EXERCISE: Monolith Service Extraction - Carving Out Auth
 * STEP 2.3: Decoupled PostgreSQL Connection Pool
 * ============================================================================
 * Why this is needed:
 * In the monolith, auth queries shared the main database connection pool,
 * leading to connection exhaustion during heavy traffic.
 *
 * In this step, you create an isolated connection pool specifically for the
 * extracted auth service, connecting over Azure Private Link.
 * ============================================================================
 */

// TODO [Lab Step 2.3]: Initialize Pool with config.db credentials and SSL options
export const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  ssl: config.db.ssl,
  max: 20, // Dedicated microservice connection limit
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  return { ...res, duration };
}
