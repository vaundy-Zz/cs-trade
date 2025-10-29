import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { IMemoryDb, newDb } from 'pg-mem';

const SCHEMA_PATH = path.join(process.cwd(), 'database', 'schema.sql');

interface DatabaseContext {
  pool: Pool;
  isMemory: boolean;
  memoryDb?: IMemoryDb;
}

declare global {
  // eslint-disable-next-line no-var
  var __leaderboardDb?: DatabaseContext;
  // eslint-disable-next-line no-var
  var __leaderboardDbInitPromise?: Promise<void>;
}

async function createDatabaseContext(): Promise<DatabaseContext> {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    return {
      pool: new Pool({ connectionString }),
      isMemory: false
    };
  }

  const memoryDb = newDb({
    autoCreateForeignKeyIndices: true
  });

  // Ensure NOW() returns a JavaScript Date
  memoryDb.public.registerFunction({
    name: 'now',
    implementation: () => new Date()
  });

  const adapter = memoryDb.adapters.createPg();

  return {
    pool: new adapter.Pool(),
    isMemory: true,
    memoryDb
  };
}

async function applySchema(pool: Pool): Promise<void> {
  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  await pool.query(schemaSql);
}

export async function initializeDatabase(): Promise<void> {
  if (global.__leaderboardDb && !global.__leaderboardDbInitPromise) {
    return;
  }

  if (!global.__leaderboardDbInitPromise) {
    global.__leaderboardDbInitPromise = (async () => {
      const context = await createDatabaseContext();
      global.__leaderboardDb = context;
      await applySchema(context.pool);
    })();
  }

  await global.__leaderboardDbInitPromise;
}

export async function getPool(): Promise<Pool> {
  if (!global.__leaderboardDb) {
    await initializeDatabase();
  }

  if (!global.__leaderboardDb) {
    throw new Error('Database context failed to initialize.');
  }

  return global.__leaderboardDb.pool;
}

export function isMemoryDatabase(): boolean {
  return global.__leaderboardDb?.isMemory ?? false;
}

export async function closePool(): Promise<void> {
  if (global.__leaderboardDb) {
    await global.__leaderboardDb.pool.end();
    delete global.__leaderboardDb;
  }
  delete global.__leaderboardDbInitPromise;
}
