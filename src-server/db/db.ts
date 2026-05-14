import pkg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function connectToDB() {
  try {
    // Test connection and initialize schema
    const dbClient = await pool.connect();
    console.log('Connected to PostgreSQL');

    const schemaPath = path.join(__dirname, '../../src-server/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    await dbClient.query(schema);
    dbClient.release();
    console.log('Database schema initialized');
  } catch (err) {
    console.error('Failed to connect to DB:', err);
  }
}

export default pool;