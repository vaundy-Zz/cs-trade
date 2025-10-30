import fs from 'fs';
import path from 'path';
import url from 'url';
import { query } from './db.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.join(__dirname, 'schema.sql');

async function runMigrations() {
  const sql = fs.readFileSync(schemaPath, 'utf-8');
  await query(sql);
  console.log('Database schema created successfully.');
}

runMigrations().catch((err) => {
  console.error('Migration failed', err);
  process.exit(1);
});
