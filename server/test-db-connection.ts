import 'dotenv/config';
import { db } from './db';
import { sql } from 'drizzle-orm';

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');
    
    // Simple query to test connection
    const result = await db.execute(sql`SELECT NOW() as current_time`);
    
    console.log('✅ Database connection successful!');
    console.log('📅 Server time:', result[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
