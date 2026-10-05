import { Pool, type QueryResultRow } from "pg";

const globalDatabase = globalThis as typeof globalThis & { sofanPostgresPool?: Pool };

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getDatabasePool() {
  if (!isDatabaseConfigured()) {
    return null;
  }

  if (!globalDatabase.sofanPostgresPool) {
    globalDatabase.sofanPostgresPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }

  return globalDatabase.sofanPostgresPool;
}

export async function queryDatabase<Row extends QueryResultRow>(
  text: string,
  values: unknown[] = [],
) {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error("Database is not configured.");
  }

  return pool.query<Row>(text, values);
}
