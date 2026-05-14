import pkg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function connectToDB() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Run schema to create tables if they don't exist
    const schemaPath = path.join(__dirname, '../../src-server/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    await client.query(schema);
    console.log('Database schema initialized');
  } catch (err) {
    console.error('Failed to connect to DB:', err);
  }
}

export default client;