const mysql = require('mysql2/promise');

async function checkArticles() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'armyjournal'
    });

    console.log('✅ Connected to database');

    // Check articles table structure
    const [columns] = await connection.execute("DESCRIBE articles");
    console.log('Articles table structure:');
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type}`);
    });

    await connection.end();
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

checkArticles();
