import Database from 'better-sqlite3';
import path from 'path';

// Connect to SQLite database
const dbName = process.env.DATABASE_PATH || 'raycast.db';
const dbPath = path.resolve(process.cwd(), dbName);
const db = new Database(dbPath, { verbose: console.log });

// Enable WAL mode for better concurrency
try {
  db.pragma('journal_mode = WAL');
} catch (e) {
  console.error('Warning: Could not enable WAL mode (database might be locked):', e);
}

// Initialize database tables
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      password TEXT, -- Added for account credentials
      duration_days INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'expired', 'rejected'
      start_time DATETIME,
      end_time DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      first_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create a View to see all members (including those without orders) in DB Browser
    CREATE VIEW IF NOT EXISTS view_all_members AS
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

  // Ensure role column exists for existing user databases
  try {
    db.prepare("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'").run();
  } catch (e) {
    // Column already exists or other error
  }
  
  // Ensure first_name column exists for existing databases
  try {
    db.prepare("ALTER TABLE users ADD COLUMN first_name TEXT").run();
  } catch (e) {
    // Column already exists or other error
  }
} catch (e) {
  console.error('Database Initialization Error (it might be locked by another program):', e);
}

// Seed default settings if not exists
const checkSettings = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
if (checkSettings.count === 0) {
  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  
  // Default prices for Canva Pro (in THB)
  const defaultPrices = {
    '1': 15,
    '7': 89,
    '30': 250,
    '365': 1500
  };
  insertSetting.run('pricing', JSON.stringify(defaultPrices));
}

export default db;
