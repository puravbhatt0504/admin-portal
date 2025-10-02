import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.SUPABASE_DB_USER || 'postgres.sevlfbqydeludjfzatfe',
  password: process.env.SUPABASE_DB_PASSWORD || 'puravbhatt0504',
  host: process.env.SUPABASE_DB_HOST || 'aws-1-ap-south-1.pooler.supabase.com',
  database: process.env.SUPABASE_DB_NAME || 'postgres',
  port: parseInt(process.env.SUPABASE_DB_PORT || '6543'),
  ssl: { rejectUnauthorized: false },
  // Use reasonable pool size for better performance
  max: 5,
  min: 1,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
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
