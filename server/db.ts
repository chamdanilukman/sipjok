import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create PostgreSQL connection
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString);

// Create Drizzle instance with schema
export const db = drizzle(client, { schema });

// Log successful connection (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('✅ Database connected successfully');
}
