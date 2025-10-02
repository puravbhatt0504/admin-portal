import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.SUPABASE_DB_USER || 'postgres.sevlfbqydeludjfzatfe',
  password: process.env.SUPABASE_DB_PASSWORD || 'puravbhatt0504',
  host: process.env.SUPABASE_DB_HOST || 'aws-1-ap-south-1.pooler.supabase.com',
  database: process.env.SUPABASE_DB_NAME || 'postgres',
  port: parseInt(process.env.SUPABASE_DB_PORT || '5432'),
  ssl: { rejectUnauthorized: false }
});

export default pool;
