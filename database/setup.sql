-- Create database if not exists
CREATE DATABASE IF NOT EXISTS armyjournal;
USE armyjournal;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('author', 'reviewer', 'editor', 'administrator') NOT NULL DEFAULT 'author',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  INDEX idx_username (username),
  INDEX idx_role (role)
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id INT NOT NULL,
  status ENUM('draft', 'submitted', 'under_review', 'with_editor', 'with_admin', 'published', 'rejected') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP NULL,
  published_at TIMESTAMP NULL,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_author (author_id),
  INDEX idx_status (status)
);

-- Article workflow table (tracks article movement between roles)
CREATE TABLE IF NOT EXISTS article_workflow (
  id INT PRIMARY KEY AUTO_INCREMENT,
  article_id INT NOT NULL,
  from_user_id INT NOT NULL,
  to_user_id INT NULL,
  from_role ENUM('author', 'reviewer', 'editor', 'administrator') NOT NULL,
  to_role ENUM('author', 'reviewer', 'editor', 'administrator') NULL,
  action ENUM('submitted', 'forwarded', 'returned', 'published', 'rejected') NOT NULL,
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_article (article_id),
  INDEX idx_from_user (from_user_id),
  INDEX idx_to_user (to_user_id)
);

-- Article revisions table (tracks changes made by reviewers/editors)
CREATE TABLE IF NOT EXISTS article_revisions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  article_id INT NOT NULL,
  revised_by INT NOT NULL,
  revised_content TEXT NOT NULL,
  revision_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (revised_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_article (article_id),
  INDEX idx_revised_by (revised_by)
);

-- Insert default users with hashed passwords
-- Password hashing: bcrypt with 10 rounds
-- Note: These are pre-hashed passwords for the specified credentials

-- Author: username=author, password=author123
INSERT INTO users (username, email, password, full_name, role) VALUES
('author', 'author@armyjournal.com', '$2a$10$YourHashedPasswordHere1', 'Author User', 'author')
ON DUPLICATE KEY UPDATE username=username;

-- Reviewer: username=reviewers, password=reviewers123
INSERT INTO users (username, email, password, full_name, role) VALUES
('reviewers', 'reviewers@armyjournal.com', '$2a$10$YourHashedPasswordHere2', 'Reviewer User', 'reviewer')
ON DUPLICATE KEY UPDATE username=username;

-- Editor: username=editor, password=editor123
INSERT INTO users (username, email, password, full_name, role) VALUES
('editor', 'editor@armyjournal.com', '$2a$10$YourHashedPasswordHere3', 'Editor User', 'editor')
ON DUPLICATE KEY UPDATE username=username;

-- Administrator: username=administrator, password=admin123
INSERT INTO users (username, email, password, full_name, role) VALUES
('administrator', 'admin@armyjournal.com', '$2a$10$YourHashedPasswordHere4', 'Administrator User', 'administrator')
ON DUPLICATE KEY UPDATE username=username;

-- Note: Run the seed-users.js script to properly hash and insert these users
