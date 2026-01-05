import mysql from 'mysql2/promise';

let connection: mysql.Connection | null = null;

export async function getDatabase() {
  if (!connection) {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'journalflow',
      port: parseInt(process.env.DB_PORT || '3306')
    });

    // Create tables if they don't exist
    await createTables();
  }
  
  return connection;
}

async function createTables() {
  if (!connection) return;

  try {
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        role ENUM('author', 'reviewer', 'editor', 'administrator') NOT NULL,
        phone VARCHAR(20),
        qualification TEXT,
        specialization TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create authors_articles table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS authors_articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        author_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        abstract TEXT NOT NULL,
        keywords TEXT,
        content TEXT,
        authors TEXT,
        affiliation VARCHAR(255),
        article_type VARCHAR(100),
        manuscript_file_name VARCHAR(255),
        manuscript_file_path VARCHAR(255),
        status ENUM('draft', 'submitted', 'under_review', 'reviewed', 'editor_review', 'accepted', 'published', 'rejected') DEFAULT 'draft',
        submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create editor_articles table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS editor_articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        article_id INT NOT NULL,
        editor_id INT NOT NULL,
        reviewer_id INT,
        title VARCHAR(255) NOT NULL,
        abstract TEXT NOT NULL,
        content TEXT,
        editor_instructions TEXT,
        status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
        assigned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        response_date DATETIME NULL,
        FOREIGN KEY (article_id) REFERENCES authors_articles(id) ON DELETE CASCADE,
        FOREIGN KEY (editor_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create reviewer_articles table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS reviewer_articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        editor_article_id INT NOT NULL,
        reviewer_id INT NOT NULL,
        article_id INT NOT NULL,
        reviewer_comments TEXT,
        recommendation ENUM('accept', 'minor_revision', 'major_revision', 'reject'),
        status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
        reviewed_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (editor_article_id) REFERENCES editor_articles(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (article_id) REFERENCES authors_articles(id) ON DELETE CASCADE
      )
    `);

    // Create article_comments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS article_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        article_id INT NOT NULL,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        comment TEXT NOT NULL,
        comment_type ENUM('editor_to_author', 'reviewer_to_editor', 'author_to_editor') NOT NULL,
        attachment_name VARCHAR(255),
        attachment_path VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (article_id) REFERENCES authors_articles(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create indexes
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_authors_articles_author_id ON authors_articles(author_id)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_authors_articles_status ON authors_articles(status)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_editor_articles_editor_id ON editor_articles(editor_id)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_editor_articles_reviewer_id ON editor_articles(reviewer_id)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_reviewer_articles_reviewer_id ON reviewer_articles(reviewer_id)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_article_comments_article_id ON article_comments(article_id)');

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

export default getDatabase;
