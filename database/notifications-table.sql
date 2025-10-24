-- In-App Notifications System
USE armyjournal;

CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('article_assigned', 'review_submitted', 'approval_required', 'article_published', 'article_rejected', 'revision_requested', 'comment_added') NOT NULL,
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
);
