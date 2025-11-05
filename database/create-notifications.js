const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'armyjournal',
};

async function createNotificationsTable() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Create notifications table with all required types
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        type ENUM(
          'article_assigned', 
          'review_submitted', 
          'approval_required', 
          'article_published', 
          'article_rejected', 
          'revision_requested', 
          'comment_added', 
          'review_request_response', 
          'review_request_sent'
        ) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        article_id INT NULL,
        related_user_id INT NULL,
        action_url VARCHAR(500) NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
        FOREIGN KEY (related_user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user_read (user_id, is_read),
        INDEX idx_created (created_at)
      )
    `);

    console.log('✅ Notifications table created successfully!');

  } catch (error) {
    console.error('❌ Error creating notifications table:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 Database connection closed');
    }
  }
}

// Run the creation
createNotificationsTable();
