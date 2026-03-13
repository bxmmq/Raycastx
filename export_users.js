const db = require('./lib/db').default;
try {
  const users = db.prepare('SELECT email, role FROM users').all();
  console.log('USER_LIST_EXPORT:', JSON.stringify(users));
} catch (e) {
  console.error('EXPORT_ERROR:', e.message);
}
process.exit(0);
