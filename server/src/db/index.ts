import pg from 'pg';
import { config } from '../config/index.js';

const { Pool } = pg;

export const pool = new Pool(
  config.databaseUrl
    ? {
        connectionString: config.databaseUrl,
        ssl: config.nodeEnv === 'production' || config.databaseUrl.includes('rds.amazonaws.com')
          ? { rejectUnauthorized: false }
          : false,
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.DB_NAME || 'campusfind',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
      }
);

// Helper query function with error logging
export async function query<T extends pg.QueryResultRow = any>(text: string, params?: any[]): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    return res;
  } catch (error) {
    console.error('Database query error:', { text, error });
    throw error;
  }
}
