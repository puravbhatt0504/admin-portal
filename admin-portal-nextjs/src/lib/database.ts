import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.SUPABASE_DB_USER || 'postgres.sevlfbqydeludjfzatfe',
  password: process.env.SUPABASE_DB_PASSWORD || 'puravbhatt0504',
  host: process.env.SUPABASE_DB_HOST || 'aws-1-ap-south-1.pooler.supabase.com',
  database: process.env.SUPABASE_DB_NAME || 'postgres',
  port: parseInt(process.env.SUPABASE_DB_PORT || '6543'),
  ssl: { rejectUnauthorized: false },
  // Use very small pool size to avoid max clients error
  max: 1,
  min: 0,
  idleTimeoutMillis: 3000,
  connectionTimeoutMillis: 2000,
  // Add better error handling
  allowExitOnIdle: true,
  // Add query timeout
  query_timeout: 10000,
  // Add statement timeout
  statement_timeout: 10000
});

// Add error handling for pool events
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

pool.on('connect', () => {
  console.log('Database client connected');
});

pool.on('remove', () => {
  console.log('Database client removed');
});

export default pool;
