-- Create table for article reviews
CREATE TABLE IF NOT EXISTS article_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  reviewer_name VARCHAR(255) NOT NULL,
  recommendation ENUM('accept', 'minor_revision', 'major_revision', 'reject') NOT NULL,
  comments TEXT NOT NULL,
  strengths TEXT,
  weaknesses TEXT,
  suggestions TEXT,
  confidential_comments TEXT,
  status ENUM('draft', 'submitted', 'archived') DEFAULT 'draft',
  submitted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  INDEX idx_article_reviewer (article_id, reviewer_id),
  INDEX idx_status (status),
  INDEX idx_submitted_at (submitted_at)
);

-- Create table for review archive
CREATE TABLE IF NOT EXISTS review_archive (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  article_title VARCHAR(500) NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  reviewer_id INT NOT NULL,
  reviewer_name VARCHAR(255) NOT NULL,
  recommendation ENUM('accept', 'minor_revision', 'major_revision', 'reject') NOT NULL,
  comments TEXT NOT NULL,
  strengths TEXT,
  weaknesses TEXT,
  suggestions TEXT,
  confidential_comments TEXT,
  submitted_at TIMESTAMP NOT NULL,
  archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_article_id (article_id),
  INDEX idx_reviewer_id (reviewer_id),
  INDEX idx_archived_at (archived_at)
);

-- Create table for notifications (if not exists)
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  user_role ENUM('author', 'reviewer', 'editor', 'administrator') NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_id INT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_role (user_id, user_role),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
);

-- Add indexes to existing tables for better performance
ALTER TABLE articles ADD INDEX IF NOT EXISTS idx_status (status);
ALTER TABLE articles ADD INDEX IF NOT EXISTS idx_author_name (author_name);
ALTER TABLE article_assignments ADD INDEX IF NOT EXISTS idx_status (status);
ALTER TABLE article_assignments ADD INDEX IF NOT EXISTS idx_completed_at (completed_at);
