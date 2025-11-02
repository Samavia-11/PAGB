const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'armyjournal',
  multipleStatements: true
};

async function createDirectMessagesTable() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    console.log('\n🔄 Creating direct_messages table...');
    
    const createTableSQL = `
      USE armyjournal;

      CREATE TABLE IF NOT EXISTS direct_messages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          sender_id INT NOT NULL,
          receiver_id INT NOT NULL,
          sender_role ENUM('author', 'reviewer', 'editor') NOT NULL,
          message TEXT,
          file_url VARCHAR(500),
          file_name VARCHAR(255),
          file_type VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          INDEX idx_sender_id (sender_id),
          INDEX idx_receiver_id (receiver_id),
          INDEX idx_created_at (created_at),
          INDEX idx_sender_receiver (sender_id, receiver_id),
          
          FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    await connection.query(createTableSQL);
    console.log('✅ direct_messages table created successfully!');

    // Verify table was created
    const [tables] = await connection.query('SHOW TABLES LIKE "direct_messages"');
    if (tables.length > 0) {
      console.log('✅ Table verified: direct_messages exists');
    } else {
      console.log('⚠️  Warning: Table verification failed');
    }

  } catch (error) {
    console.error('❌ Error creating table:', error.message);
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('⚠️  Make sure the users table exists first!');
      console.error('   Run: mysql -u root -p armyjournal < database/setup.sql');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

createDirectMessagesTable();

