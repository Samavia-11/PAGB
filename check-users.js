const mysql = require('mysql2/promise');

async function checkUsers() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'armyjournal'
    });

    console.log('✅ Connected to database');

    // Check users
    const [users] = await connection.execute('SELECT id, username, role FROM users LIMIT 10');
    console.log('Available users:');
    users.forEach(u => {
      console.log(`  ID: ${u.id}, Username: ${u.username}, Role: ${u.role}`);
    });

    // Check if there's an editor
    const [editors] = await connection.execute("SELECT id, username FROM users WHERE role = 'editor' LIMIT 1");
    console.log('\nEditor users:');
    editors.forEach(e => {
      console.log(`  Editor ID: ${e.id}, Username: ${e.username}`);
    });

    await connection.end();
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

checkUsers();
