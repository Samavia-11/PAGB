const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'armyjournal',
};

async function updateNotificationsTable() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Update notifications table to include review request types
    await connection.execute(`
      ALTER TABLE notifications MODIFY type ENUM(
        'article_assigned', 
        'review_submitted', 
        'approval_required', 
        'article_published', 
        'article_rejected', 
        'revision_requested', 
        'comment_added', 
        'review_request_response', 
        'review_request_sent'
      ) NOT NULL
    `);

    console.log('✅ Notifications table updated successfully!');

  } catch (error) {
    console.error('❌ Error updating notifications table:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 Database connection closed');
    }
  }
}

// Run the update
updateNotificationsTable();
