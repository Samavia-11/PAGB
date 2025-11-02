-- Create article_messages table for chat functionality
CREATE TABLE IF NOT EXISTS article_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    article_id INT NOT NULL,
    sender_id INT NOT NULL,
    sender_role ENUM('author', 'reviewer', 'editor') NOT NULL,
    message TEXT,
    file_url VARCHAR(500),
    file_name VARCHAR(255),
    file_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_article_id (article_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add some sample data (optional)
-- INSERT INTO article_messages (article_id, sender_id, sender_role, message) VALUES
-- (1, 1, 'author', 'Hello, I have submitted my article for review.'),
-- (1, 2, 'editor', 'Thank you for your submission. We will review it shortly.');
