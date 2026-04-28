import mysql from 'mysql2/promise';

let connection: mysql.Connection | null = null;
let tablesInitialized = false; // Performance optimization flag

export async function getDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'armyjournal';
  const port = parseInt(process.env.DB_PORT || '3306');

  // Reuse connection if possible, but recover from dropped/stale connections.
  if (connection) {
    try {
      await connection.ping();
      return connection;
    } catch {
      try {
        await connection.end();
      } catch {
        // ignore
      }
      connection = null;
    }
  }

  if (!connection) {
    try {
      connection = await mysql.createConnection({
        host,
        user,
        password,
        database,
        port,
        // Linux-specific MySQL connection optimizations
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        // SSL configuration for secure connections (optional on Linux)
        ssl: process.env.DB_SSL === 'true' ? {
          rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
        } : undefined,
        // Connection timeout settings for Linux
        connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '10000'),
        // Character set for Linux MySQL
        charset: 'utf8mb4',
      });
    } catch (error: any) {
      // Auto-create database if missing
      if (error?.code === 'ER_BAD_DB_ERROR') {
        const bootstrap = await mysql.createConnection({
          host,
          user,
          password,
          port,
          // Linux-specific MySQL connection optimizations
          enableKeepAlive: true,
          keepAliveInitialDelay: 0,
          connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '10000'),
          charset: 'utf8mb4',
        });
        await bootstrap.execute(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
        await bootstrap.end();

        connection = await mysql.createConnection({
          host,
          user,
          password,
          database,
          port,
          // Linux-specific MySQL connection optimizations
          enableKeepAlive: true,
          keepAliveInitialDelay: 0,
          ssl: process.env.DB_SSL === 'true' ? {
            rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
          } : undefined,
          connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '10000'),
          charset: 'utf8mb4',
        });
      } else {
        throw error;
      }
    }

    // Create tables if they don't exist (only once per server start)
    if (!tablesInitialized) {
      await createTables();
      tablesInitialized = true;
    }
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
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      )
    `);

    // Add phone column if users table already existed
    try {
      await connection.execute('ALTER TABLE users ADD COLUMN phone VARCHAR(20)');
    } catch (e: any) {
      if (e?.code !== 'ER_DUP_FIELDNAME') throw e;
    }

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
        cover_letter TEXT,
        conflicts TEXT,
        funding TEXT,
        ethics TINYINT(1) DEFAULT 0,
        license_agreement TINYINT(1) DEFAULT 0,
        manuscript_file_name VARCHAR(255),
        manuscript_file_path VARCHAR(255),
        status ENUM('draft', 'submitted', 'under_review', 'reviewed', 'editor_review', 'accepted', 'published', 'rejected') DEFAULT 'draft',
        submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
        ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      )
    `);

    // Add manuscript columns if authors_articles already existed
    try {
      await connection.execute('ALTER TABLE authors_articles ADD COLUMN manuscript_file_name VARCHAR(255)');
    } catch (e: any) {
      if (e?.code !== 'ER_DUP_FIELDNAME') throw e;
    }
    try {
      await connection.execute('ALTER TABLE authors_articles ADD COLUMN manuscript_file_path VARCHAR(255)');
    } catch (e: any) {
      if (e?.code !== 'ER_DUP_FIELDNAME') throw e;
    }

    // Add declaration columns if authors_articles already existed
    try {
      await connection.execute('ALTER TABLE authors_articles ADD COLUMN cover_letter TEXT');
    } catch (e: any) {
      if (e?.code !== 'ER_DUP_FIELDNAME') throw e;
    }
    try {
      await connection.execute('ALTER TABLE authors_articles ADD COLUMN conflicts TEXT');
    } catch (e: any) {
      if (e?.code !== 'ER_DUP_FIELDNAME') throw e;
    }
    try {
      await connection.execute('ALTER TABLE authors_articles ADD COLUMN funding TEXT');
    } catch (e: any) {
      if (e?.code !== 'ER_DUP_FIELDNAME') throw e;
    }
    try {
      await connection.execute('ALTER TABLE authors_articles ADD COLUMN ethics TINYINT(1) DEFAULT 0');
    } catch (e: any) {
      if (e?.code !== 'ER_DUP_FIELDNAME') throw e;
    }
    try {
      await connection.execute('ALTER TABLE authors_articles ADD COLUMN license_agreement TINYINT(1) DEFAULT 0');
    } catch (e: any) {
      if (e?.code !== 'ER_DUP_FIELDNAME') throw e;
    }

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
        attachment_name VARCHAR(255) NULL,
        attachment_path VARCHAR(255) NULL,
        attachment_type VARCHAR(100) NULL,
        attachment_size INT NULL,
        status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
        assigned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        response_date DATETIME NULL,
        FOREIGN KEY (article_id) REFERENCES authors_articles(id) ON DELETE CASCADE,
        FOREIGN KEY (editor_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL,
        ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      )
    `);

    // Add attachment columns if editor_articles already existed
    try {
      await connection.execute('ALTER TABLE editor_articles ADD COLUMN attachment_name VARCHAR(255) NULL');
    } catch (e: any) {
      if (e?.code !== 'ER_DUP_FIELDNAME') throw e;
    }
    try {
      await connection.execute('ALTER TABLE editor_articles ADD COLUMN attachment_path VARCHAR(255) NULL');
    } catch (e: any) {
      if (e?.code !== 'ER_DUP_FIELDNAME') throw e;
    }
    try {
      await connection.execute('ALTER TABLE editor_articles ADD COLUMN attachment_type VARCHAR(100) NULL');
    } catch (e: any) {
      if (e?.code !== 'ER_DUP_FIELDNAME') throw e;
    }
    try {
      await connection.execute('ALTER TABLE editor_articles ADD COLUMN attachment_size INT NULL');
    } catch (e: any) {
      if (e?.code !== 'ER_DUP_FIELDNAME') throw e;
    }

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
        FOREIGN KEY (article_id) REFERENCES authors_articles(id) ON DELETE CASCADE,
        ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      )
    `);

    // Create article_comments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS article_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        article_id INT NOT NULL,
        commenter_id INT NOT NULL,
        commenter_role ENUM('author','editor','reviewer','administrator') NOT NULL,
        comment TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (article_id) REFERENCES authors_articles(id) ON DELETE CASCADE,
        FOREIGN KEY (commenter_id) REFERENCES users(id) ON DELETE CASCADE,
        ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      )
    `);

    // Create article_messages table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS article_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        article_id INT NOT NULL,
        sender_id INT NOT NULL,
        sender_role ENUM('author','editor','reviewer','administrator') NOT NULL,
        message TEXT,
        file_url VARCHAR(500),
        file_name VARCHAR(255),
        file_type VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (article_id) REFERENCES authors_articles(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      )
    `);

    // Create editorial_board_items table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS editorial_board_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        section ENUM('executive_leadership','editorial_team_editor','editorial_team_sub_editor','advisory_board','peer_review_committee') NOT NULL,
        title VARCHAR(255) NULL,
        name VARCHAR(255) NOT NULL,
        affiliation VARCHAR(255) NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      )
    `);

    // Create reviewer_forwarded_documents table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS reviewer_forwarded_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        editor_article_id INT NOT NULL,
        article_id INT NOT NULL,
        reviewer_id INT NOT NULL,
        editor_id INT NOT NULL,
        comment TEXT,
        attachment_name VARCHAR(255),
        attachment_path VARCHAR(255),
        attachment_type VARCHAR(100),
        attachment_size INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (editor_article_id) REFERENCES editor_articles(id) ON DELETE CASCADE,
        FOREIGN KEY (article_id) REFERENCES authors_articles(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (editor_id) REFERENCES users(id) ON DELETE CASCADE,
        ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      )
    `);

    // Create editor_author_documents table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS editor_author_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reviewer_forward_id INT NOT NULL,
        article_id INT NOT NULL,
        editor_id INT NOT NULL,
        author_id INT NOT NULL,
        comment TEXT,
        attachment_name VARCHAR(255),
        attachment_path VARCHAR(255),
        attachment_type VARCHAR(100),
        attachment_size INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (reviewer_forward_id) REFERENCES reviewer_forwarded_documents(id) ON DELETE CASCADE,
        FOREIGN KEY (article_id) REFERENCES authors_articles(id) ON DELETE CASCADE,
        FOREIGN KEY (editor_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
        ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      )
    `);

    // Create editor_admin_documents table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS editor_admin_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reviewer_forward_id INT NOT NULL,
        article_id INT NOT NULL,
        editor_id INT NOT NULL,
        admin_id INT NOT NULL,
        comment TEXT,
        attachment_name VARCHAR(255),
        attachment_path VARCHAR(255),
        attachment_type VARCHAR(100),
        attachment_size INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (reviewer_forward_id) REFERENCES reviewer_forwarded_documents(id) ON DELETE CASCADE,
        FOREIGN KEY (article_id) REFERENCES authors_articles(id) ON DELETE CASCADE,
        FOREIGN KEY (editor_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
        ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      )
    `);

    // Create indexes (MySQL doesn't support IF NOT EXISTS with CREATE INDEX, so we use try-catch)
    const indexes = [
      'CREATE INDEX idx_users_role ON users(role)',
      'CREATE INDEX idx_authors_articles_author_id ON authors_articles(author_id)',
      'CREATE INDEX idx_authors_articles_status ON authors_articles(status)',
      'CREATE INDEX idx_editor_articles_editor_id ON editor_articles(editor_id)',
      'CREATE INDEX idx_editor_articles_reviewer_id ON editor_articles(reviewer_id)',
      'CREATE INDEX idx_reviewer_articles_reviewer_id ON reviewer_articles(reviewer_id)',
      'CREATE INDEX idx_article_comments_article_id ON article_comments(article_id)',
      'CREATE INDEX idx_editorial_board_section_sort ON editorial_board_items(section, sort_order)',
      'CREATE INDEX idx_article_messages_article_id ON article_messages(article_id)',
      'CREATE INDEX idx_article_messages_sender_id ON article_messages(sender_id)',
      'CREATE INDEX idx_reviewer_forwarded_editor_id ON reviewer_forwarded_documents(editor_id)',
      'CREATE INDEX idx_reviewer_forwarded_reviewer_id ON reviewer_forwarded_documents(reviewer_id)',
      'CREATE INDEX idx_editor_author_documents_editor_id ON editor_author_documents(editor_id)',
      'CREATE INDEX idx_editor_author_documents_author_id ON editor_author_documents(author_id)'
    ];

    for (const indexSql of indexes) {
      try {
        await connection.execute(indexSql);
      } catch (e: any) {
        // Ignore duplicate index errors
        if (e?.code !== 'ER_DUP_KEYNAME' && e?.code !== 'ER_DUP_ENTRY') {
          console.error(`Error creating index: ${indexSql}`, e);
        }
      }
    }

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

export default getDatabase;
