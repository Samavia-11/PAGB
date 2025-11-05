const mysql = require('mysql2/promise');

async function checkDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'armyjournal'
    });

    console.log('✅ Connected to database');

    // Check if notifications table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'notifications'");
    console.log('Notifications table exists:', tables.length > 0);

    if (tables.length > 0) {
      // Check notifications table structure
      const [columns] = await connection.execute("DESCRIBE notifications");
      console.log('Notifications table structure:');
      columns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type}`);
      });
    }

    // Check articles table
    const [articleTables] = await connection.execute("SHOW TABLES LIKE 'articles'");
    console.log('Articles table exists:', articleTables.length > 0);

    if (articleTables.length > 0) {
      // Check current article statuses
      const [statuses] = await connection.execute("SELECT DISTINCT status FROM articles");
      console.log('Current article statuses:');
      statuses.forEach(s => console.log(`  - ${s.status}`));
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

checkDatabase();
