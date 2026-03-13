const db = require('./lib/db').default;
const fs = require('fs');
try {
  const email = 'worapon25472004@gmail.com';
  // Attempt update again just in case
  db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(email);
  const users = db.prepare('SELECT email, role FROM users').all();
  const output = JSON.stringify(users, null, 2);
  fs.writeFileSync('db_check_result.txt', output);
  console.log('DB check completed. Result written to db_check_result.txt');
} catch (e) {
  fs.writeFileSync('db_check_result.txt', 'ERROR: ' + e.message);
  console.error(e);
}
