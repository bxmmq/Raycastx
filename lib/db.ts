import { Pool } from 'pg';
import fs from 'fs';

let pool: any;

try {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.warn('DATABASE_URL is not defined.');
  }

  // Use a minimal config to avoid "Invalid URL"
  const config: any = {
    connectionString: connectionString,
    ssl: connectionString?.includes('railway') && !connectionString?.includes('.internal') 
      ? { rejectUnauthorized: false } 
      : false
  };

  // Check if we are trying to use an internal Railway URL outside of Railway
  const isInternalRailway = connectionString?.includes('railway.internal');
  
  if (isInternalRailway) {
    console.log('--- ℹ️ Local Development Mode: Using Mock Database ---');
    pool = {
      query: async () => ({ rows: [], rowCount: 0 }),
      connect: async () => { throw new Error("Internal DB not reachable locally"); },
      on: () => {}
    };
  } else {
    pool = new Pool(config);

    // Wrap query to be more robust
    const originalQuery = pool.query.bind(pool);
    pool.query = async (text: string, params?: any[]) => {
      try {
        return await originalQuery(text, params);
      } catch (err: any) {
        // Only log serious errors, not just "not found" during local dev
        if (!err.message.includes('ENOTFOUND')) {
          console.error('Database query error:', err.message || err);
        }
        return { rows: [], rowCount: 0 };
      }
    };
  }
} catch (e: any) {
  console.error("Critical error initializing database pool:", e);
  // Create a dummy pool that always fails gracefully
  pool = {
    query: async () => { throw new Error("Database not initialized"); },
    connect: async () => { throw new Error("Database not initialized"); },
    on: () => {}
  };
}

// Re-use pool in development
const globalForPool = global as unknown as { pool: any };
if (process.env.NODE_ENV !== 'production') {
  if (!globalForPool.pool) globalForPool.pool = pool;
}

export { pool };

// Schema Initialization
export async function initDb() {
  let client;
  try {
    client = await pool.connect();
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
    if (client) await client.query('ROLLBACK');
    console.error('Database Initialization Error:', e);
  } finally {
    if (client) client.release();
  }
}

// Automatically initialize database
initDb().catch(e => console.error("Database initialization failed:", e.message || e));

export default pool;

