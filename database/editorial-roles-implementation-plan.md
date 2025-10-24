# Editorial Board Roles - Implementation Plan

## 📋 Overview
This document outlines the implementation plan for integrating the PAGB Editorial Board structure into the existing database and user management system.

---

## 🎯 Editorial Board Structure

### **Leadership Tier**
1. **Patron-in-Chief** - Highest oversight authority
2. **Patron** - Senior oversight authority

### **Editorial Tier**
3. **Editor** (Editor-in-Chief) - Primary editorial authority
4. **Assistant Editors** - Support editorial processes

### **Advisory Tier**
5. **Advisory Board Members** - Provide strategic guidance and expertise

### **Review Tier**
6. **Peer Review Committee Members** - Conduct scholarly peer reviews

---

## 🗄️ Database Schema Updates

### **Part 1: Update Users Table - Add New Roles**

```sql
-- Modify the existing users table to include editorial roles
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
ADD COLUMN rank VARCHAR(100) NULL COMMENT 'Military rank or academic title',
ADD COLUMN organization VARCHAR(200) NULL COMMENT 'Institution/Department',
ADD COLUMN specialization TEXT NULL COMMENT 'Area of expertise',
ADD COLUMN board_position VARCHAR(100) NULL COMMENT 'Specific position on board',
ADD COLUMN is_board_member BOOLEAN DEFAULT FALSE COMMENT 'Flag for editorial board members';
```

### **Part 2: Create Editorial Board Table**

```sql
-- New table specifically for editorial board management
CREATE TABLE IF NOT EXISTS editorial_board (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  board_role ENUM(
    'patron_in_chief',
    'patron',
    'editor_in_chief',
    'assistant_editor',
    'advisory_board',
    'peer_reviewer'
  ) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  rank VARCHAR(100) NULL,
  organization VARCHAR(200) NULL,
  specialization TEXT NULL,
  email VARCHAR(100) NULL,
  phone VARCHAR(50) NULL,
  appointment_date DATE NULL,
  term_end_date DATE NULL,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0 COMMENT 'For controlling display sequence',
  bio TEXT NULL COMMENT 'Biography/credentials',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_board_role (board_role),
  INDEX idx_active (is_active)
);
```

### **Part 3: Create Assignment/Permission Table**

```sql
-- Table for managing what actions each editorial role can perform
CREATE TABLE IF NOT EXISTS editorial_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(50) NOT NULL UNIQUE,
  can_view_submissions BOOLEAN DEFAULT FALSE,
  can_assign_reviewers BOOLEAN DEFAULT FALSE,
  can_edit_articles BOOLEAN DEFAULT FALSE,
  can_approve_articles BOOLEAN DEFAULT FALSE,
  can_publish_articles BOOLEAN DEFAULT FALSE,
  can_reject_articles BOOLEAN DEFAULT FALSE,
  can_request_revisions BOOLEAN DEFAULT FALSE,
  can_manage_users BOOLEAN DEFAULT FALSE,
  can_manage_board BOOLEAN DEFAULT FALSE,
  priority_level INT DEFAULT 0 COMMENT 'Higher number = higher authority',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 👥 Role Hierarchy & Permissions

### **Level 1: Patron-in-Chief**
- **Permissions**: 
  - Full oversight (view all)
  - Final approval authority
  - Can override all decisions
- **Workflow**: Receives reports, provides guidance
- **System Access**: Dashboard view, analytics, final approval

### **Level 2: Patron**
- **Permissions**:
  - View all submissions
  - Strategic oversight
  - Can approve/reject after editor review
- **Workflow**: Reviews editor recommendations
- **System Access**: Dashboard view, review queue

### **Level 3: Editor-in-Chief**
- **Permissions**:
  - Full editorial control
  - Assign articles to reviewers
  - Final editorial decisions
  - Can publish/reject
- **Workflow**: Central point for all editorial decisions
- **System Access**: Full editorial dashboard

### **Level 4: Assistant Editors**
- **Permissions**:
  - View assigned articles
  - Edit and revise content
  - Recommend for publication
  - Assign to peer reviewers
- **Workflow**: Pre-screening, initial editing
- **System Access**: Article management, editing tools

### **Level 5: Advisory Board Members**
- **Permissions**:
  - View articles (read-only)
  - Provide strategic feedback
  - Recommend policy changes
- **Workflow**: Consulted on major decisions
- **System Access**: Read-only access to articles

### **Level 6: Peer Review Committee**
- **Permissions**:
  - View assigned articles
  - Provide detailed reviews
  - Recommend accept/reject/revise
- **Workflow**: Scholarly peer review process
- **System Access**: Review submission forms

---

## 🔄 Updated Article Workflow

### **New Workflow States:**

```
Author Submission
     ↓
Assistant Editor (Initial Review)
     ↓
Peer Review Committee (if needed)
     ↓
Assistant Editor (Revisions)
     ↓
Editor-in-Chief (Final Editorial Decision)
     ↓
Patron (Strategic Approval)
     ↓
Patron-in-Chief (Final Oversight - if needed)
     ↓
Publication
```

### **Update article_workflow Table:**

```sql
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
  'editor_review',
  'patron_review',
  'final_approval'
) NOT NULL;

-- Add priority and deadline fields
ALTER TABLE article_workflow 
ADD COLUMN priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
ADD COLUMN deadline DATE NULL,
ADD COLUMN review_type ENUM('editorial', 'peer', 'strategic', 'final') NULL;
```

---

## 📊 Implementation Steps

### **Phase 1: Database Migration (Week 1)**
1. ✅ Run ALTER TABLE commands to update schema
2. ✅ Create editorial_board table
3. ✅ Create editorial_permissions table
4. ✅ Insert default permissions for each role

### **Phase 2: Seed Editorial Board Data (Week 1-2)**
1. ✅ Insert all current board members into editorial_board table
2. ✅ Link board members to user accounts
3. ✅ Set up role permissions

### **Phase 3: Update Backend API (Week 2-3)**
1. ✅ Create API endpoints for editorial board management
2. ✅ Implement role-based access control (RBAC)
3. ✅ Update article workflow logic

### **Phase 4: Frontend Implementation (Week 3-4)**
1. ✅ Create Editorial Board public page (Done!)
2. ✅ Create Editorial Dashboard for board members
3. ✅ Update article submission workflow UI

### **Phase 5: Testing & Deployment (Week 4)**
1. ✅ Test all role permissions
2. ✅ Test workflow transitions
3. ✅ Deploy to production

---

## 🔐 Security Considerations

### **Access Control:**
- Implement JWT tokens with role claims
- Use middleware to validate editorial permissions
- Audit log for all editorial actions

### **Data Privacy:**
- Board member contact info restricted
- Article reviews confidential
- Workflow history tracked

---

## 📝 SQL Script: Insert Editorial Permissions

```sql
-- Insert default permissions for each editorial role
INSERT INTO editorial_permissions (
  role_name, 
  can_view_submissions, 
  can_assign_reviewers, 
  can_edit_articles, 
  can_approve_articles, 
  can_publish_articles, 
  can_reject_articles, 
  can_request_revisions,
  can_manage_users,
  can_manage_board,
  priority_level
) VALUES
-- Patron-in-Chief (Level 10 - Highest)
('patron_in_chief', TRUE, FALSE, FALSE, TRUE, TRUE, TRUE, FALSE, FALSE, TRUE, 10),

-- Patron (Level 9)
('patron', TRUE, FALSE, FALSE, TRUE, TRUE, TRUE, FALSE, FALSE, FALSE, 9),

-- Editor-in-Chief (Level 8)
('editor_in_chief', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, 8),

-- Assistant Editor (Level 6)
('assistant_editor', TRUE, TRUE, TRUE, FALSE, FALSE, TRUE, TRUE, FALSE, FALSE, 6),

-- Peer Reviewer (Level 4)
('peer_reviewer', TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, 4),

-- Advisory Board Member (Level 3)
('advisory_board_member', TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 3);
```

---

## 🎨 UI Components Needed

### **1. Editorial Board Dashboard**
- List of pending articles for review
- Assignment interface
- Review submission forms
- Workflow status tracker

### **2. Board Member Profiles**
- Public-facing profile pages
- Internal contact directory
- Expertise/specialization tags

### **3. Workflow Management**
- Visual workflow tracker
- Email notifications for assignments
- Deadline reminders

---

## 📧 Email Notifications

### **Automated Emails:**
1. Article assigned to assistant editor
2. Article sent for peer review
3. Peer review completed
4. Editor decision made
5. Patron approval request
6. Final publication notification

---

## 🔄 Next Steps

1. **Review this plan** with your team
2. **Run database migrations** (provided SQL scripts)
3. **Insert editorial board data** using provided format
4. **Test workflow** with sample articles
5. **Deploy backend API** for role management
6. **Create dashboards** for each role level

---

## 📞 Support & Questions

For implementation support:
- Technical Lead: [Your Name]
- Database Admin: [Admin Name]
- Project Manager: [PM Name]

---

**Document Version**: 1.0  
**Last Updated**: October 22, 2025  
**Status**: Ready for Implementation
