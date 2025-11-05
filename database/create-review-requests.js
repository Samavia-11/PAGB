const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'armyjournal',
};

async function createReviewRequestsTable() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Create review_requests table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS review_requests (
        id INT PRIMARY KEY AUTO_INCREMENT,
        editor_id INT NOT NULL,
        reviewer_id INT NOT NULL,
        status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (editor_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_editor (editor_id),
        INDEX idx_reviewer (reviewer_id),
        INDEX idx_status (status),
        UNIQUE KEY unique_editor_reviewer (editor_id, reviewer_id)
      )
    `);

    console.log('✅ Review requests table created successfully!');

  } catch (error) {
    console.error('❌ Error creating review requests table:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 Database connection closed');
    }
  }
}

// Run the creation
createReviewRequestsTable();
