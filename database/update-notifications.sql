USE armyjournal;

-- Update notifications table to include review request types
ALTER TABLE notifications MODIFY type ENUM(
  'article_assigned', 
  'review_submitted', 
  'approval_required', 
  'article_published', 
  'article_rejected', 
  'revision_requested', 
  'comment_added', 
  'review_request_response', 
  'review_request_sent'
) NOT NULL;
