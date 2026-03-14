import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

// Re-use pool in development to avoid exhausting connections
const globalForPool = global as unknown as { pool: Pool };

export const pool = globalForPool.pool || new Pool({
  connectionString,
  ssl: connectionString?.includes('railway') ? { rejectUnauthorized: false } : false
});

// Graceful Query Wrapper (Real Mode but Silent on Connection Errors)
const originalQuery = pool.query.bind(pool);
pool.query = async (text: string, params?: any[]) => {
  try {
    return await originalQuery(text, params);
  } catch (err: any) {
    if (err.message.includes('ENOTFOUND') || err.message.includes('ECONNREFUSED')) {
      console.warn(`--- ⚠️ Database Connection Failed: ${err.message} (Check your DATABASE_URL in .env) ---`);
    } else {
      console.error('Database query error:', err.message || err);
    }
    return { rows: [], rowCount: 0 };
  }
};

if (process.env.NODE_ENV !== 'production') globalForPool.pool = pool;

// Schema Initialization
export async function initDb() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        first_name TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        password TEXT,
        duration_days INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        start_time TIMESTAMPTZ,
        end_time TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    // View for members
    await client.query(`
      CREATE OR REPLACE VIEW view_all_members AS
      SELECT 
        u.id as user_id,
        u.first_name,
        u.email,
        u.role,
        o.id as order_id,
        o.status,
        o.duration_days,
        o.end_time,
        u.created_at as registered_at
      FROM users u
      LEFT JOIN orders o ON u.email = o.email;
    `);

    // Seed default settings if not exists
    const checkSettings = await client.query('SELECT COUNT(*) as count FROM settings');
    if (parseInt(checkSettings.rows[0].count) === 0) {
      const defaultPrices = {
        '1': 5,
        '7': 20,
        '30': 40,
        '365': 400
      };
      await client.query('INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', ['pricing', JSON.stringify(defaultPrices)]);
    }

    await client.query('COMMIT');
    console.log('Database initialized successfully');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Database Initialization Error:', e);
  } finally {
    client.release();
  }
}

// Automatically initialize database
initDb().catch(console.error);

export default pool;
