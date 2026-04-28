import mysql from 'mysql2/promise';

let connection: mysql.Connection | null = null;
let tablesInitialized = false;

export async function getDatabase() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'armyjournal';
  const port = parseInt(process.env.DB_PORT || '3306');

  if (connection) {
    try {
      await connection.ping();
      return connection;
    } catch {
      try { await connection.end(); } catch {}
      connection = null;
    }
  }

  if (!connection) {
    try {
      connection = await mysql.createConnection({ host, user, password, database, port });
    } catch (error: any) {
      if (error?.code === 'ER_BAD_DB_ERROR') {
        const bootstrap = await mysql.createConnection({ host, user, password, port });
        await bootstrap.execute(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
        await bootstrap.end();

        connection = await mysql.createConnection({ host, user, password, database, port });
      } else {
        throw error;
      }
    }

    if (!tablesInitialized) {
      await createTables();
      tablesInitialized = true;
    }
  }

  return connection;
}

/* ---------------- SAFE HELPERS ---------------- */

async function createIndexIfNotExists(name: string, table: string, columns: string) {
  const [rows]: any = await connection!.execute(`
    SELECT COUNT(1) as count
    FROM information_schema.STATISTICS
    WHERE table_schema = DATABASE()
      AND table_name = ?
      AND index_name = ?
  `, [table, name]);

  if (rows[0].count === 0) {
    await connection!.execute(`CREATE INDEX ${name} ON ${table}(${columns})`);
  }
}

async function columnExists(table: string, column: string) {
  const [rows]: any = await connection!.execute(`
    SELECT COUNT(1) as count
    FROM information_schema.COLUMNS
    WHERE table_schema = DATABASE()
      AND table_name = ?
      AND column_name = ?
  `, [table, column]);

  return rows[0].count > 0;
}

async function addColumnIfNotExists(table: string, column: string, definition: string) {
  const exists = await columnExists(table, column);
  if (!exists) {
    await connection!.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

/* ---------------- TABLE CREATION ---------------- */

async function createTables() {
  if (!connection) return;

  try {
    /* USERS */
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
      ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await addColumnIfNotExists('users', 'phone', 'VARCHAR(20)');

    /* AUTHORS ARTICLES */
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
        status ENUM('draft','submitted','under_review','reviewed','editor_review','accepted','published','rejected') DEFAULT 'draft',
        submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
      )
      ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    /* EDITOR ARTICLES */
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
        attachment_name VARCHAR(255),
        attachment_path VARCHAR(255),
        attachment_type VARCHAR(100),
        attachment_size INT,
        status ENUM('pending','accepted','rejected','completed') DEFAULT 'pending',
        assigned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        response_date DATETIME,
        FOREIGN KEY (article_id) REFERENCES authors_articles(id) ON DELETE CASCADE,
        FOREIGN KEY (editor_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL
      )
      ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    /* REVIEWER ARTICLES */
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS reviewer_articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        editor_article_id INT NOT NULL,
        reviewer_id INT NOT NULL,
        article_id INT NOT NULL,
        reviewer_comments TEXT,
        recommendation ENUM('accept','minor_revision','major_revision','reject'),
        status ENUM('pending','accepted','rejected','completed') DEFAULT 'pending',
        reviewed_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (editor_article_id) REFERENCES editor_articles(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (article_id) REFERENCES authors_articles(id) ON DELETE CASCADE
      )
      ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    /* COMMENTS */
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS article_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        article_id INT NOT NULL,
        commenter_id INT NOT NULL,
        commenter_role ENUM('author','editor','reviewer','administrator') NOT NULL,
        comment TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (article_id) REFERENCES authors_articles(id) ON DELETE CASCADE,
        FOREIGN KEY (commenter_id) REFERENCES users(id) ON DELETE CASCADE
      )
      ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    /* MESSAGES */
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
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
      )
      ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    /* INDEXES (SAFE) */
    await createIndexIfNotExists('idx_users_role', 'users', 'role');
    await createIndexIfNotExists('idx_authors_articles_author_id', 'authors_articles', 'author_id');
    await createIndexIfNotExists('idx_authors_articles_status', 'authors_articles', 'status');
    await createIndexIfNotExists('idx_editor_articles_editor_id', 'editor_articles', 'editor_id');
    await createIndexIfNotExists('idx_editor_articles_reviewer_id', 'editor_articles', 'reviewer_id');
    await createIndexIfNotExists('idx_reviewer_articles_reviewer_id', 'reviewer_articles', 'reviewer_id');
    await createIndexIfNotExists('idx_article_comments_article_id', 'article_comments', 'article_id');
    await createIndexIfNotExists('idx_article_messages_article_id', 'article_messages', 'article_id');
    await createIndexIfNotExists('idx_article_messages_sender_id', 'article_messages', 'sender_id');

    console.log('? Database tables created successfully');
  } catch (error) {
    console.error('? Error creating tables:', error);
  }
}

export default getDatabase;
