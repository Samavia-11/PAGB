-- ========================================
-- PAGB Editorial Board Database Migration
-- Version: 1.0
-- Date: October 22, 2025
-- ========================================

USE armyjournal;

-- ========================================
-- PART 1: UPDATE USERS TABLE
-- ========================================

-- Add new editorial roles to existing role enum
ALTER TABLE users 
MODIFY COLUMN role ENUM(
  'author',
  'reviewer', 
  'editor',
  'administrator',
  'patron_in_chief',
  'patron',
  'editor_in_chief',
  'assistant_editor',
  'advisory_board_member',
  'peer_reviewer'
) NOT NULL DEFAULT 'author';

-- Add additional columns for editorial board members
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS rank VARCHAR(100) NULL COMMENT 'Military rank or academic title',
ADD COLUMN IF NOT EXISTS organization VARCHAR(200) NULL COMMENT 'Institution/Department',
ADD COLUMN IF NOT EXISTS specialization TEXT NULL COMMENT 'Area of expertise',
ADD COLUMN IF NOT EXISTS board_position VARCHAR(100) NULL COMMENT 'Specific position on board',
ADD COLUMN IF NOT EXISTS is_board_member BOOLEAN DEFAULT FALSE COMMENT 'Flag for editorial board members';

-- ========================================
-- PART 2: CREATE EDITORIAL BOARD TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS editorial_board (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NULL COMMENT 'Links to users table if they have login access',
  board_role ENUM(
    'patron_in_chief',
    'patron',
    'editor_in_chief',
    'assistant_editor',
    'advisory_board',
    'peer_reviewer'
  ) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  rank_title VARCHAR(100) NULL COMMENT 'e.g., Lieutenant General, Dr, Professor',
  organization VARCHAR(200) NULL,
  department VARCHAR(200) NULL,
  specialization TEXT NULL,
  email VARCHAR(100) NULL,
  phone VARCHAR(50) NULL,
  appointment_date DATE NULL,
  term_end_date DATE NULL,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0 COMMENT 'For controlling display sequence',
  bio TEXT NULL COMMENT 'Biography/credentials',
  photo_url VARCHAR(255) NULL COMMENT 'Profile photo path',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_board_role (board_role),
  INDEX idx_active (is_active),
  INDEX idx_display_order (display_order)
);

-- ========================================
-- PART 3: CREATE EDITORIAL PERMISSIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS editorial_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(50) NOT NULL UNIQUE,
  role_description TEXT NULL,
  -- Article Management Permissions
  can_view_all_submissions BOOLEAN DEFAULT FALSE,
  can_view_assigned_submissions BOOLEAN DEFAULT FALSE,
  can_assign_reviewers BOOLEAN DEFAULT FALSE,
  can_assign_editors BOOLEAN DEFAULT FALSE,
  can_edit_articles BOOLEAN DEFAULT FALSE,
  can_approve_articles BOOLEAN DEFAULT FALSE,
  can_publish_articles BOOLEAN DEFAULT FALSE,
  can_reject_articles BOOLEAN DEFAULT FALSE,
  can_request_revisions BOOLEAN DEFAULT FALSE,
  -- User Management Permissions
  can_manage_users BOOLEAN DEFAULT FALSE,
  can_manage_board BOOLEAN DEFAULT FALSE,
  can_view_analytics BOOLEAN DEFAULT FALSE,
  -- Priority & Authority
  priority_level INT DEFAULT 0 COMMENT 'Higher number = higher authority (1-10)',
  approval_required_from INT NULL COMMENT 'Role level required for final approval',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- PART 4: UPDATE ARTICLE WORKFLOW TABLE
-- ========================================

-- Add new workflow actions
ALTER TABLE article_workflow 
MODIFY COLUMN action ENUM(
  'submitted',
  'forwarded',
  'returned',
  'published',
  'rejected',
  'assigned_to_assistant_editor',
  'sent_to_peer_review',
  'peer_review_complete',
  'peer_review_returned',
  'editor_review',
  'editor_approved',
  'patron_review',
  'patron_approved',
  'final_approval',
  'revision_requested'
) NOT NULL;

-- Add priority and deadline fields
ALTER TABLE article_workflow 
ADD COLUMN IF NOT EXISTS priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS deadline DATE NULL,
ADD COLUMN IF NOT EXISTS review_type ENUM('editorial', 'peer', 'strategic', 'final') NULL,
ADD COLUMN IF NOT EXISTS assigned_by INT NULL COMMENT 'User ID of person who assigned',
ADD COLUMN IF NOT EXISTS estimated_hours INT NULL COMMENT 'Estimated time for completion';

-- ========================================
-- PART 5: INSERT DEFAULT PERMISSIONS
-- ========================================

INSERT INTO editorial_permissions (
  role_name, 
  role_description,
  can_view_all_submissions, 
  can_view_assigned_submissions,
  can_assign_reviewers, 
  can_assign_editors,
  can_edit_articles, 
  can_approve_articles, 
  can_publish_articles, 
  can_reject_articles, 
  can_request_revisions,
  can_manage_users,
  can_manage_board,
  can_view_analytics,
  priority_level,
  approval_required_from
) VALUES
-- Patron-in-Chief (Level 10 - Highest Authority)
('patron_in_chief', 
 'Highest oversight authority - final approval on major decisions',
 TRUE, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, TRUE, FALSE, FALSE, TRUE, TRUE, 10, NULL),

-- Patron (Level 9 - Strategic Oversight)
('patron', 
 'Senior oversight authority - strategic guidance and approval',
 TRUE, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, TRUE, FALSE, FALSE, FALSE, TRUE, 9, 10),

-- Editor-in-Chief (Level 8 - Editorial Authority)
('editor_in_chief', 
 'Primary editorial authority - manages entire publication process',
 TRUE, FALSE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, 8, 9),

-- Assistant Editor (Level 6 - Editorial Support)
('assistant_editor', 
 'Supports editorial process - initial review and editing',
 TRUE, TRUE, TRUE, FALSE, TRUE, FALSE, FALSE, TRUE, TRUE, FALSE, FALSE, TRUE, 6, 8),

-- Peer Reviewer (Level 4 - Scholarly Review)
('peer_reviewer', 
 'Conducts scholarly peer review of submissions',
 FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, 4, 6),

-- Advisory Board Member (Level 3 - Strategic Guidance)
('advisory_board_member', 
 'Provides strategic guidance and expertise',
 TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, 3, NULL),

-- Regular Reviewer (Level 5)
('reviewer', 
 'Reviews articles and provides feedback',
 FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, 5, 6),

-- Author (Level 1)
('author', 
 'Submits articles for publication',
 FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 1, NULL),

-- Administrator (Level 10 - System Admin)
('administrator', 
 'Full system administration access',
 TRUE, FALSE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, 10, NULL);

-- ========================================
-- PART 6: INSERT EDITORIAL BOARD MEMBERS
-- ========================================

-- Leadership
INSERT INTO editorial_board (board_role, full_name, rank_title, organization, is_active, display_order) VALUES
('patron_in_chief', 'Lieutenant General Muhammad Aamer Najam, HI (M)', 'Lieutenant General', 'IGT&E', TRUE, 1),
('patron', 'Major General Muhammad Shahid Abro', 'Major General', 'DG HRD', TRUE, 2);

-- Editorial Team
INSERT INTO editorial_board (board_role, full_name, rank_title, organization, is_active, display_order) VALUES
('editor_in_chief', 'Dir E Wing', 'Director', 'E Wing', TRUE, 3);

-- Assistant Editors
INSERT INTO editorial_board (board_role, full_name, rank_title, organization, department, is_active, display_order) VALUES
('assistant_editor', 'Brigadier Dr Shahid Yaqub Abbasi', 'Brigadier', 'FGE&I Dte', 'Rawalpindi', TRUE, 4),
('assistant_editor', 'Colonel Dr Sayyam Bin Saeed', 'Colonel', 'HRD Dte', 'GHQ', TRUE, 5),
('assistant_editor', 'Lieutenant Colonel Dr Zillay Hussain Dar', 'Lieutenant Colonel', 'HRD Dte', 'GSO-1 PAGB', TRUE, 6),
('assistant_editor', 'Lieutenant Col Dr Qasim Ali Shah', 'Lieutenant Colonel', 'ISPR', 'GHQ', TRUE, 7),
('assistant_editor', 'Major Dr Muhammad Irfan', 'Major', 'Military College Jhelum', NULL, TRUE, 8);

-- Advisory Board
INSERT INTO editorial_board (board_role, full_name, rank_title, organization, is_active, display_order) VALUES
('advisory_board', 'Major General Dr Muhammad Samrez Salik, HI (M), (Retd)', 'Major General (Retd)', NULL, TRUE, 9),
('advisory_board', 'Dr Zulfiqar Khan', 'Dr', 'National Defence University', 'Professor/Dean Faculty of Contemporary Studies', TRUE, 10),
('advisory_board', 'Dr Zafar Iqbal Cheema', 'Dr', 'Strategic Vision Institute', 'President', TRUE, 11),
('advisory_board', 'Dr Rizwana Karim Abbasi', 'Dr', 'NUML', 'Professor International Relations', TRUE, 12),
('advisory_board', 'Dr Syed Waqas Ali Kausar', 'Dr', 'NUML', 'Professor/HOD Government & Public Policy', TRUE, 13),
('advisory_board', 'Dr Shaheen Akhtar', 'Dr', 'National Defence University', 'Professor International Relations', TRUE, 14),
('advisory_board', 'Dr Muhammad Sheharyar Khan', 'Dr', 'Iqra University', 'Associate Professor International Relations', TRUE, 15),
('advisory_board', 'Dr Sumeera Imran', 'Dr', 'National Defence University', 'Assistant Professor International Relations', TRUE, 16);

-- Peer Review Committee
INSERT INTO editorial_board (board_role, full_name, rank_title, organization, department, is_active, display_order) VALUES
('peer_reviewer', 'Dr Lubna Abid Ali', 'Dr', 'National Defence University', 'Dean Faculty of Contemporary Studies (FCS)', TRUE, 17),
('peer_reviewer', 'Dr Maria Saifuddin Effendi', 'Dr', 'National Defence University', 'Assistant Professor Peace & Conflict Studies', TRUE, 18),
('peer_reviewer', 'Brig Dr Saif Ur Rehman, TI (M), (Retd)', 'Brigadier (Retd)', 'NUML Peshawar', 'Regional Director', TRUE, 19),
('peer_reviewer', 'Dr Muhammad Bashir Khan', 'Dr', 'National Defence University', 'Professor Govt & Public Policy', TRUE, 20),
('peer_reviewer', 'Dr Muhammad Riaz Shad', 'Dr', 'NUML', 'Professor/Head of Department International Relations', TRUE, 21),
('peer_reviewer', 'Dr Asma Shakir Khawaja', 'Dr', 'CISS AJ&K', 'Executive Director', TRUE, 22),
('peer_reviewer', 'Dr Rubina Waseem', 'Dr', 'National Defence University', 'Department of Strategic Studies', TRUE, 23),
('peer_reviewer', 'Brig Dr Abdul Rauf', 'Brigadier', 'C&IT Br, GHQ', 'Director Special Plans', TRUE, 24),
('peer_reviewer', 'Brig Dr Muhammad Farooq', 'Brigadier', 'HRD Dte, GHQ', 'Director B Wing', TRUE, 25);

-- ========================================
-- PART 7: CREATE ARTICLE ASSIGNMENT TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS article_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  article_id INT NOT NULL,
  assigned_to INT NOT NULL COMMENT 'User ID',
  assigned_by INT NOT NULL COMMENT 'User ID',
  assignment_type ENUM('peer_review', 'editorial_review', 'final_approval') NOT NULL,
  status ENUM('pending', 'in_progress', 'completed', 'declined') DEFAULT 'pending',
  deadline DATE NULL,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  notes TEXT NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_article (article_id),
  INDEX idx_assigned_to (assigned_to),
  INDEX idx_status (status)
);

-- ========================================
-- PART 8: CREATE INDEXES FOR PERFORMANCE
-- ========================================

-- Add indexes to users table for editorial roles
CREATE INDEX idx_user_role ON users(role);
CREATE INDEX idx_is_board_member ON users(is_board_member);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Verify editorial board members
-- SELECT * FROM editorial_board ORDER BY display_order;

-- Verify permissions
-- SELECT * FROM editorial_permissions ORDER BY priority_level DESC;

-- Count board members by role
-- SELECT board_role, COUNT(*) as count FROM editorial_board GROUP BY board_role;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

SELECT 'Editorial Board Migration Completed Successfully!' as Status;
SELECT COUNT(*) as 'Total Board Members' FROM editorial_board;
SELECT COUNT(*) as 'Total Permissions' FROM editorial_permissions;
