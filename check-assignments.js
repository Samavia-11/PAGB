const mysql = require('mysql2/promise');

async function checkAssignments() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'armyjournal'
    });

    console.log('✅ Connected to database');

    try {
      // Check if article_assignments table exists
      const [tables] = await connection.execute("SHOW TABLES LIKE 'article_assignments'");
      
      if (tables.length > 0) {
        console.log('article_assignments table exists');
        // Check table structure
        const [columns] = await connection.execute("DESCRIBE article_assignments");
        console.log('article_assignments table structure:');
        columns.forEach(col => {
          console.log(`  ${col.Field}: ${col.Type}`);
        });
      } else {
        console.log('article_assignments table does NOT exist');
      }
    } catch (error) {
      console.log('Error checking article_assignments:', error.message);
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

checkAssignments();
