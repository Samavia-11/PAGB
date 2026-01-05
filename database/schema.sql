-- Database Schema for Article Management System

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role ENUM('author', 'reviewer', 'editor', 'administrator') NOT NULL,
    phone VARCHAR(20),
    qualification TEXT,
    specialization TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Authors articles table
CREATE TABLE IF NOT EXISTS authors_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    abstract TEXT NOT NULL,
    keywords TEXT,
    content TEXT,
    authors JSON, -- Store authors array as JSON
    affiliation VARCHAR(255),
    article_type VARCHAR(100),
    manuscript_file_name VARCHAR(255),
    manuscript_file_path VARCHAR(255),
    status ENUM('draft', 'submitted', 'under_review', 'reviewed', 'editor_review', 'accepted', 'published', 'rejected') DEFAULT 'draft',
    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Editor articles table (articles forwarded by editors to reviewers)
CREATE TABLE IF NOT EXISTS editor_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL, -- Reference to authors_articles
    editor_id INTEGER NOT NULL,
    reviewer_id INTEGER,
    title VARCHAR(255) NOT NULL,
    abstract TEXT NOT NULL,
    content TEXT,
    editor_instructions TEXT,
    status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
    assigned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    response_date DATETIME,
    FOREIGN KEY (article_id) REFERENCES authors_articles(id) ON DELETE CASCADE,
    FOREIGN KEY (editor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Reviewer articles table (articles with reviewer comments)
CREATE TABLE IF NOT EXISTS reviewer_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    editor_article_id INTEGER NOT NULL, -- Reference to editor_articles
    reviewer_id INTEGER NOT NULL,
    article_id INTEGER NOT NULL, -- Reference to authors_articles
    reviewer_comments TEXT,
    recommendation ENUM('accept', 'minor_revision', 'major_revision', 'reject'),
    status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
    reviewed_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (editor_article_id) REFERENCES editor_articles(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES authors_articles(id) ON DELETE CASCADE
);

-- Article comments table (for editor to author communication)
CREATE TABLE IF NOT EXISTS article_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    comment_type ENUM('editor_to_author', 'reviewer_to_editor', 'author_to_editor') NOT NULL,
    attachment_name VARCHAR(255),
    attachment_path VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES authors_articles(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_authors_articles_author_id ON authors_articles(author_id);
CREATE INDEX IF NOT EXISTS idx_authors_articles_status ON authors_articles(status);
CREATE INDEX IF NOT EXISTS idx_editor_articles_editor_id ON editor_articles(editor_id);
CREATE INDEX IF NOT EXISTS idx_editor_articles_reviewer_id ON editor_articles(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviewer_articles_reviewer_id ON reviewer_articles(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_article_comments_article_id ON article_comments(article_id);
