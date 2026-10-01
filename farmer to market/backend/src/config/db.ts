import { Pool } from 'pg';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

// Using neon serverless pool for better performance with serverless environments
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon PostgreSQL
  },
});

// Helper for simple queries
export const query = (text: string, params?: any[]) => pool.query(text, params);
