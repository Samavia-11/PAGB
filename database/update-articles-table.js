const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'armyjournal',
};

async function updateArticlesTable() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Check if reviewer_id column exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'armyjournal' 
      AND TABLE_NAME = 'articles' 
      AND COLUMN_NAME = 'reviewer_id'
    `);

    if (columns.length === 0) {
      // Add reviewer_id column if it doesn't exist
      await connection.execute(`
        ALTER TABLE articles 
        ADD COLUMN reviewer_id INT NULL,
        ADD FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL
      `);
      console.log('✅ Added reviewer_id column to articles table');
    } else {
      console.log('✅ reviewer_id column already exists in articles table');
    }

  } catch (error) {
    console.error('❌ Error updating articles table:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 Database connection closed');
    }
  }
}

// Run the update
updateArticlesTable();
