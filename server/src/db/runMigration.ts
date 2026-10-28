import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runRetentionMigration() {
  console.log('Applying migration_001_retention.sql...');
  const migrationPath = path.join(__dirname, 'migration_001_retention.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  try {
    await pool.query(sql);
    console.log('Migration 001 executed successfully.');
  } catch (err: any) {
    console.error('Failed to run migration_001_retention:', err.message || err);
    throw err;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runRetentionMigration()
    .then(() => pool.end())
    .catch(() => process.exit(1));
}
