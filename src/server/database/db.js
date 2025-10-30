import fs from 'fs';
import path from 'path';
import url from 'url';
import pg from 'pg';
import dotenv from 'dotenv';
import { newDb } from 'pg-mem';

dotenv.config();

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.join(__dirname, 'schema.sql');

let pool;
let initPromise;

if (process.env.NODE_ENV === 'test') {
  const mem = newDb({ autoCreateForeignKeyIndices: true });
  mem.public.registerFunction({
    name: 'now',
    returns: 'timestamp',
    implementation: () => new Date(),
  });

  const { Pool: MemPool } = mem.adapters.createPg();
  pool = new MemPool();
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  initPromise = pool.query(schemaSql);
} else {
  const { Pool } = pg;
  pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/trends_analytics',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });

  initPromise = Promise.resolve();
}

async function ensureInit() {
  await initPromise;
}

export const query = async (text, params) => {
  await ensureInit();
  return pool.query(text, params);
};

export const getClient = async () => {
  await ensureInit();
  return pool.connect();
};

export const closePool = async () => {
  if (pool && typeof pool.end === 'function') {
    await pool.end();
  }
};

export default pool;
