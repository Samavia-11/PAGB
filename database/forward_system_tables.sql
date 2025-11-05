-- Create table for forwarded articles
CREATE TABLE IF NOT EXISTS forwarded_articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  reviewer_name VARCHAR(255) NOT NULL,
  recommendation ENUM('accept', 'minor_revision', 'major_revision', 'reject') NOT NULL,
  reviewer_comments TEXT NOT NULL,
  editor_comments TEXT,
  original_content LONGTEXT NOT NULL,
  edited_content LONGTEXT NOT NULL,
  attached_files JSON,
  status ENUM('forwarded', 'responded', 'archived') DEFAULT 'forwarded',
  forwarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  INDEX idx_article_reviewer (article_id, reviewer_id),
  INDEX idx_status (status),
  INDEX idx_forwarded_at (forwarded_at)
);

-- Create table for editor responses
CREATE TABLE IF NOT EXISTS editor_responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  forwarded_article_id INT NOT NULL,
  article_id INT NOT NULL,
  editor_id INT,
  editor_name VARCHAR(255),
  editor_response TEXT,
  decision ENUM('accept', 'reject', 'revision_required', 'feedback_only'),
  response_type ENUM('feedback', 'decision', 'request_changes') DEFAULT 'feedback',
  status ENUM('pending', 'responded') DEFAULT 'pending',
  responded_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (forwarded_article_id) REFERENCES forwarded_articles(id) ON DELETE CASCADE,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  INDEX idx_forwarded_article (forwarded_article_id),
  INDEX idx_article_id (article_id),
  INDEX idx_status (status),
  INDEX idx_responded_at (responded_at)
);

-- Create table for forwarded articles archive
CREATE TABLE IF NOT EXISTS forwarded_archive (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  article_title VARCHAR(500) NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  reviewer_id INT NOT NULL,
  reviewer_name VARCHAR(255) NOT NULL,
  recommendation ENUM('accept', 'minor_revision', 'major_revision', 'reject') NOT NULL,
  reviewer_comments TEXT NOT NULL,
  editor_comments TEXT,
  original_content LONGTEXT NOT NULL,
  edited_content LONGTEXT NOT NULL,
  attached_files JSON,
  forwarded_at TIMESTAMP NOT NULL,
  archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_article_id (article_id),
  INDEX idx_reviewer_id (reviewer_id),
  INDEX idx_archived_at (archived_at),
  INDEX idx_forwarded_at (forwarded_at)
);

-- Create real-time notifications table (enhanced)
CREATE TABLE IF NOT EXISTS real_time_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  user_role ENUM('author', 'reviewer', 'editor', 'administrator') NOT NULL,
  notification_type ENUM('article_forwarded', 'editor_response', 'article_decision', 'review_request') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_id INT,
  related_type ENUM('article', 'forwarded_article', 'response') DEFAULT 'article',
  is_read BOOLEAN DEFAULT FALSE,
  is_real_time BOOLEAN DEFAULT TRUE,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  INDEX idx_user_role (user_id, user_role),
  INDEX idx_is_read (is_read),
  INDEX idx_is_real_time (is_real_time),
  INDEX idx_priority (priority),
  INDEX idx_created_at (created_at)
);

-- Add new article statuses
ALTER TABLE articles MODIFY COLUMN status ENUM(
  'draft', 'submitted', 'under_review', 'with_editor', 
  'revision_required', 'accepted', 'rejected', 'published'
) DEFAULT 'draft';

-- Create indexes for better performance
ALTER TABLE articles ADD INDEX IF NOT EXISTS idx_updated_at (updated_at);
ALTER TABLE notifications ADD INDEX IF NOT EXISTS idx_related_id (related_id);

-- Create view for active forwarded articles
CREATE OR REPLACE VIEW active_forwarded_articles AS
SELECT 
  fa.*,
  a.title as article_title,
  a.author_name,
  a.status as article_status,
  er.status as response_status,
  er.editor_response,
  er.decision,
  er.responded_at
FROM forwarded_articles fa
JOIN articles a ON fa.article_id = a.id
LEFT JOIN editor_responses er ON fa.id = er.forwarded_article_id
WHERE fa.status = 'forwarded'
ORDER BY fa.forwarded_at DESC;
