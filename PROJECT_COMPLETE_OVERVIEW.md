# 📘 PAGB (Pakistan Army Green Book) - Complete Project Overview

## 🎯 Project Purpose

A comprehensive academic journal management system for Pakistan Army Green Book, handling the complete lifecycle of research articles from submission to publication with a hierarchical editorial workflow system.

---

## 🏗️ System Architecture

### **Technology Stack**

```
Frontend:  Next.js 15.5.4 + React 19 + TypeScript + Tailwind CSS 4
Backend:   Next.js API Routes (Serverless)
Database:  MySQL 8.0+
Auth:      BCrypt password hashing + JWT tokens
Icons:     Lucide React
```

---

## 📊 Database Schema Overview

### **Core Tables (8 Total)**

#### **1. users**
- Stores all system users (authors, reviewers, editors, board members)
- Fields: id, username, email, password, full_name, role, rank, organization, specialization, is_board_member
- Roles: author, reviewer, editor, administrator, patron_in_chief, patron, editor_in_chief, assistant_editor, advisory_board_member, peer_reviewer

#### **2. articles**
- Stores all article submissions
- Fields: id, title, content, author_id, status, created_at, updated_at, submitted_at, published_at
- Statuses: draft, submitted, under_review, with_editor, with_admin, published, rejected

#### **3. article_workflow**
- Tracks all actions performed on articles
- Fields: id, article_id, from_user_id, to_user_id, from_role, to_role, action, comments, priority, deadline, review_type
- Actions: submitted, forwarded, returned, published, rejected, assigned_to_assistant_editor, sent_to_peer_review, etc.

#### **4. article_revisions**
- Stores revision history
- Fields: id, article_id, revised_by, revised_content, revision_notes, created_at

#### **5. editorial_board**
- Stores editorial board member information
- Fields: id, user_id, board_role, full_name, rank_title, organization, department, specialization, email, phone, bio, photo_url
- Contains 25 board members

#### **6. editorial_permissions**
- Defines role-based permissions
- Fields: id, role_name, can_view_all_submissions, can_assign_reviewers, can_publish_articles, priority_level (1-10)
- 9 permission sets defined

#### **7. article_assignments**
- Tracks article assignments to reviewers/editors
- Fields: id, article_id, assigned_to, assigned_by, assignment_type, status, deadline, priority

#### **8. notifications**
- In-app notification system
- Fields: id, user_id, type, title, message, article_id, is_read, created_at, read_at
- Types: article_assigned, review_submitted, approval_required, article_published, article_rejected, revision_requested

---

## 🎭 User Roles & Permissions

### **Hierarchical Structure (Priority Level 1-10)**

#### **Level 10 - Highest Authority**
1. **Patron-in-Chief** (Lt Gen Muhammad Aamer Najam)
   - Final approval authority
   - Can publish/reject articles
   - Strategic oversight
   - Can view all submissions & analytics

2. **Administrator**
   - Full system access
   - User management
   - Board management
   - System configuration

#### **Level 9 - Strategic Oversight**
3. **Patron** (Maj Gen Muhammad Shahid Abro)
   - Strategic guidance
   - Approval authority (requires Patron-in-Chief approval)
   - Can view all submissions & analytics

#### **Level 8 - Editorial Authority**
4. **Editor-in-Chief** (Dir E Wing)
   - Manages entire publication process
   - Assigns reviewers and editors
   - Approves/rejects articles
   - Edits content
   - Requires Patron approval for final publication

#### **Level 6 - Editorial Support**
5. **Assistant Editors** (5 members)
   - Initial review and editing
   - Assigns peer reviewers
   - Can request revisions
   - Can reject articles
   - Requires Editor-in-Chief approval

#### **Level 5 - Content Review**
6. **Reviewers**
   - Reviews assigned articles
   - Provides feedback
   - Requests revisions
   - Limited view access

#### **Level 4 - Scholarly Review**
7. **Peer Reviewers** (9 members)
   - Scholarly peer review
   - Expert feedback
   - Can request revisions
   - View only assigned articles

#### **Level 3 - Advisory**
8. **Advisory Board Members** (8 members)
   - Strategic guidance
   - Subject matter experts
   - Can view all submissions
   - No direct workflow actions

#### **Level 1 - Content Creation**
9. **Authors**
   - Submit articles
   - Revise based on feedback
   - View own submissions only
   - No approval authority

---

## 📂 Project Structure

```
D:\PAGB-1\
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page (public)
│   │   ├── layout.tsx                  # Root layout
│   │   ├── login/page.tsx              # Login/Signup page
│   │   ├── dashboard/page.tsx          # Unified dashboard (all roles)
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts      # Login API
│   │   │   │   └── signup/route.ts     # Registration API
│   │   │   ├── articles/
│   │   │   │   ├── route.ts            # List/Create articles
│   │   │   │   └── [id]/workflow/route.ts  # Workflow actions
│   │   │   ├── notifications/
│   │   │   │   ├── route.ts            # Get/Create notifications
│   │   │   │   └── [id]/read/route.ts  # Mark as read
│   │   │   └── test-db/route.ts        # DB connection test
│   │   ├── author/
│   │   │   ├── dashboard/page.tsx      # Author dashboard (legacy)
│   │   │   ├── articles/page.tsx       # Article management
│   │   │   ├── articles/new/page.tsx   # Create article
│   │   │   └── drafts/page.tsx         # Draft articles
│   │   ├── reviewer/
│   │   │   └── dashboard/page.tsx      # Reviewer dashboard (legacy)
│   │   ├── editor/
│   │   │   └── dashboard/page.tsx      # Editor dashboard (legacy)
│   │   └── administrator/
│   │       ├── dashboard/page.tsx      # Admin dashboard (legacy)
│   │       └── current-issue/page.tsx  # Current issue management
│   └── lib/
│       └── db.ts                       # Database connection pool
├── database/
│   ├── setup.sql                       # Initial schema
│   ├── editorial-roles-migration.sql   # Editorial board setup
│   ├── notifications-table.sql         # Notifications schema
│   └── seed-users.js                   # User seeding script
├── public/
│   ├── pdfs/                           # PDF articles (18 files)
│   └── images/
│       ├── thumbnails/                 # Article thumbnails
│       └── shanahan-1.webp             # Background image
└── scripts/
    └── generate-pdf-thumbnails.js      # PDF thumbnail generator

```

---

## 🔄 Complete Workflow Process

### **Article Lifecycle**

```
1. DRAFT (Author)
   ↓ [Submit]
   
2. SUBMITTED (System)
   ↓ [Editor-in-Chief assigns]
   
3. UNDER_REVIEW (Assistant Editor)
   ↓ [Assistant Editor sends to peer review]
   
4. WITH_EDITOR (Peer Reviewers)
   ↓ [Peer review complete]
   
5. WITH_EDITOR (Editor-in-Chief)
   ↓ [Editor approves]
   
6. WITH_ADMIN (Patron/Patron-in-Chief)
   ↓ [Final approval]
   
7. PUBLISHED (Public)

Alternative paths:
- Any stage → REJECTED
- Any stage → DRAFT (revision requested)
```

### **Detailed Workflow Steps**

#### **Step 1: Author Submission**
- Author creates article (status: DRAFT)
- Author clicks "Submit"
- Status → SUBMITTED
- Notification sent to Editor-in-Chief
- Workflow record created: action='submitted'

#### **Step 2: Editor-in-Chief Assignment**
- Editor-in-Chief reviews submission
- Assigns to Assistant Editor
- Status → UNDER_REVIEW
- Article_assignment record created
- Notification sent to Assistant Editor
- Workflow record: action='assigned_to_assistant_editor'

#### **Step 3: Assistant Editor Review**
- Assistant Editor reviews content
- Can request revisions (→ DRAFT)
- Can reject (→ REJECTED)
- Can send to peer review
- Status → WITH_EDITOR (peer review phase)
- Assigns to Peer Reviewers
- Notifications sent to peer reviewers
- Workflow record: action='sent_to_peer_review'

#### **Step 4: Peer Review**
- Peer reviewers provide feedback
- Multiple reviewers can be assigned
- Can request revisions
- Submit review completion
- Notifications sent back to Assistant Editor
- Workflow record: action='peer_review_complete'

#### **Step 5: Editor-in-Chief Approval**
- Reviews peer review feedback
- Reviews article quality
- Can approve → WITH_ADMIN
- Can reject → REJECTED
- Can request revision → DRAFT
- Workflow record: action='editor_approved'
- Notification sent to Patron

#### **Step 6: Final Approval**
- Patron or Patron-in-Chief reviews
- Final strategic assessment
- Can approve → publish
- Can reject → REJECTED
- Workflow record: action='patron_approved' or 'final_approval'

#### **Step 7: Publication**
- Status → PUBLISHED
- Published_at timestamp set
- Article appears on public site
- Notification sent to author
- Workflow record: action='published'

---

## 🔔 Notification System

### **Trigger Events**

1. **article_assigned**
   - When: Article assigned to reviewer/editor
   - Recipient: Assigned user
   - Action URL: /dashboard/articles/[id]

2. **review_submitted**
   - When: Reviewer submits feedback
   - Recipient: Assigning editor
   - Action URL: /dashboard/articles/[id]

3. **approval_required**
   - When: Article needs higher authority approval
   - Recipient: Approving authority
   - Action URL: /dashboard/articles/[id]

4. **article_published**
   - When: Article published
   - Recipient: Author
   - Action URL: /articles/[id]

5. **article_rejected**
   - When: Article rejected
   - Recipient: Author
   - Action URL: /dashboard/articles/[id]

6. **revision_requested**
   - When: Changes requested
   - Recipient: Author
   - Action URL: /dashboard/articles/[id]

7. **comment_added**
   - When: New comment on article
   - Recipient: Relevant parties
   - Action URL: /dashboard/articles/[id]

---

## 🌐 Frontend Modules

### **1. Landing Page (`/`)**
**Purpose:** Public-facing homepage
**Features:**
- Hero section with "2024-2025 ARMY GREEN BOOK" branding
- 6 featured articles with magazine-style thumbnails
- Article cards with title, author, description, PDF link
- Editorial Board section (25 members displayed)
- Quick Links section
- Recent Issues section (2 PDF downloads)
- Statistics: 18 articles, 25 authors, 1 issue
- Responsive navigation
- Search bar (UI only, not functional)

### **2. Login/Signup Page (`/login`)**
**Purpose:** User authentication
**Features:**
- Toggle between Sign In / Sign Up
- Sign In: username + password
- Sign Up: full form (name, father's name, CNIC, contact, qualification, role)
- Password visibility toggle
- Form validation
- Error handling
- Role-based redirection to `/dashboard`

### **3. Unified Dashboard (`/dashboard`)**
**Purpose:** Central hub for all roles
**Features:**
- Role-specific greeting
- Real-time notification bell with unread count
- Article list with status badges
- Role-based action buttons:
  - Author: Submit button
  - Assistant Editor: Assign to Editor button
  - Editor-in-Chief: Publish/Reject buttons
- Notification sidebar (10 most recent)
- Click notification to mark as read
- Status color coding (draft=gray, submitted=blue, under_review=yellow, with_editor=purple, published=green, rejected=red)

### **4. Author Dashboard (Legacy) (`/author/dashboard`)**
**Purpose:** Author-specific interface
**Features:**
- Welcome message
- Quick stats (drafts, submitted, published)
- Recent articles list
- Quick actions (new article, view all)
- Submissions overview
- Navigation to article management

### **5. Article Management (`/author/articles`)**
**Purpose:** Manage author's articles
**Features:**
- List all articles by author
- Status indicators
- Edit/Delete actions
- Filter by status

### **6. Create Article (`/Author/articles/new`)**
**Purpose:** New article submission
**Features:**
- Title input
- Content editor
- Save as draft
- Submit for review
- Form validation

### **7. Edit Article (`/Author/articles/edit/[id]`)**
**Purpose:** Edit existing article
**Features:**
- Load existing content
- Update title/content
- Save changes
- Resubmit after revisions

### **8. Drafts Page (`/author/drafts`)**
**Purpose:** View draft articles
**Features:**
- List all draft articles
- Quick edit access
- Delete drafts
- Submit drafts

### **9. Reviewer Dashboard (Legacy) (`/reviewer/dashboard`)**
**Purpose:** Reviewer interface
**Features:**
- Assigned articles
- Review submission form
- Status tracking

### **10. Editor Dashboard (Legacy) (`/editor/dashboard`)**
**Purpose:** Editor interface
**Features:**
- All submitted articles
- Assignment interface
- Approval/rejection actions

### **11. Administrator Dashboard (Legacy) (`/administrator/dashboard`)**
**Purpose:** Admin interface
**Features:**
- User management
- System statistics
- Board management

### **12. Current Issue Page (`/administrator/current-issue`)**
**Purpose:** Manage current publication issue
**Features:**
- Issue overview
- Article inclusion
- Publication preparation

---

## 🔌 Backend API Endpoints

### **Authentication APIs**

#### **POST `/api/auth/login`**
**Purpose:** User login
**Request:**
```json
{
  "username": "author",
  "password": "author123"
}
```
**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "author",
    "email": "author@journal.com",
    "fullName": "Author User",
    "role": "author"
  }
}
```

#### **POST `/api/auth/signup`**
**Purpose:** User registration
**Request:**
```json
{
  "username": "newauthor",
  "password": "password123",
  "fullName": "New Author",
  "fatherName": "Father Name",
  "cnic": "12345-1234567-1",
  "contactNumber": "+92 300 1234567",
  "qualification": "PhD in Computer Science",
  "role": "author"
}
```

### **Article APIs**

#### **GET `/api/articles`**
**Purpose:** List articles
**Headers:** x-user-id, x-user-role
**Query Params:** status (optional)
**Response:**
```json
{
  "articles": [
    {
      "id": 1,
      "title": "Article Title",
      "author_name": "Author Name",
      "status": "submitted",
      "created_at": "2024-10-22T10:00:00.000Z",
      "updated_at": "2024-10-22T11:00:00.000Z"
    }
  ]
}
```

#### **POST `/api/articles`**
**Purpose:** Create article
**Request:**
```json
{
  "title": "New Article Title",
  "content": "Article content here...",
  "author_id": 1
}
```

#### **POST `/api/articles/[id]/workflow`**
**Purpose:** Perform workflow action
**Request:**
```json
{
  "action": "submit",
  "from_user_id": 1,
  "to_user_id": 2,
  "from_role": "author",
  "to_role": "assistant_editor",
  "comments": "Ready for review"
}
```
**Actions:** submit, assign_assistant_editor, send_to_peer_review, approve, publish, reject, request_revision

### **Notification APIs**

#### **GET `/api/notifications`**
**Purpose:** Get user notifications
**Headers:** x-user-id
**Query Params:** unread=true (optional)
**Response:**
```json
{
  "notifications": [
    {
      "id": 1,
      "type": "article_assigned",
      "title": "New Article Assigned",
      "message": "An article has been assigned to you",
      "is_read": false,
      "created_at": "2024-10-22T10:00:00.000Z",
      "action_url": "/dashboard/articles/1"
    }
  ]
}
```

#### **POST `/api/notifications`**
**Purpose:** Create notification
**Request:**
```json
{
  "user_id": 2,
  "type": "article_assigned",
  "title": "New Article",
  "message": "You have been assigned an article",
  "article_id": 1,
  "related_user_id": 1,
  "action_url": "/dashboard/articles/1"
}
```

#### **PATCH `/api/notifications/[id]/read`**
**Purpose:** Mark notification as read
**Response:** { "success": true }

### **Database Test API**

#### **GET `/api/test-db`**
**Purpose:** Test database connection
**Response:**
```json
{
  "status": "connected",
  "message": "Database connection successful"
}
```

---

## 🎨 UI/UX Design System

### **Color Palette**
- Primary Green: `#4A5F3A` (Army green)
- Accent Orange: `#E85D04` (Highlight color)
- Warning Yellow: `#FFD700` (PAGB branding)
- Background: `#F9FAFB` (Light gray)
- Text Primary: `#1F2937` (Dark gray)
- Text Secondary: `#6B7280` (Medium gray)

### **Typography**
- Headings: Georgia, Serif (professional)
- Body: Arial, sans-serif (readable)
- Branding: Impact, sans-serif (bold military style)

### **Components**
- Magazine-style thumbnails (128x176px)
- Status badges (color-coded)
- Notification bell with counter
- Action buttons (role-specific)
- Form inputs with icons
- Responsive grid layouts

---

## 📦 Dependencies

### **Production**
- next: 15.5.4 (React framework)
- react: 19.1.0
- react-dom: 19.1.0
- mysql2: 3.15.1 (Database driver)
- bcryptjs: 2.4.3 (Password hashing)
- lucide-react: 0.544.0 (Icons)
- dotenv: 16.6.1 (Environment variables)

### **Development**
- typescript: 5.7.3
- tailwindcss: 4
- eslint: 9
- @types/node, @types/react, @types/bcryptjs

---

## 🔐 Security Features

1. **Password Security**
   - BCrypt hashing (10 rounds)
   - No plain text passwords
   - Secure password comparison

2. **Role-Based Access Control**
   - Hierarchical permissions
   - Action authorization
   - View restrictions

3. **Data Validation**
   - Input sanitization
   - SQL injection prevention (parameterized queries)
   - XSS protection

4. **Session Management**
   - LocalStorage for client-side state
   - User data encryption recommended (future)

---

## 📊 Current Data

### **Editorial Board: 25 Members**
- 1 Patron-in-Chief
- 1 Patron
- 1 Editor-in-Chief
- 5 Assistant Editors
- 8 Advisory Board Members
- 9 Peer Reviewers

### **Articles: 18 PDFs**
1. Pakistan's National Security Policies
2. Afghan Refugees and Non-Refoulement
3. [Article 3]
4. Pakistan-Afghanistan Relations
5. Modi's Neighbourhood First Policy
6. Character of Future Military Conflict
7. Socially Disruptive Proxies
8-18. (Additional articles in public/pdfs)

### **Test Users**
- author / author123
- reviewer / reviewer123
- editor / editor123
- administrator / admin123

---

## 🚀 Deployment Requirements

### **Server Requirements**
- Node.js 18+
- MySQL 8.0+
- 2GB RAM minimum
- 10GB storage

### **Environment Variables**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=armyjournal
JWT_SECRET=your_secret_key
NODE_ENV=production
```

### **Build Commands**
```bash
npm install
npm run db:setup
npm run build
npm start
```

---

## 📈 System Metrics

- **Database Tables:** 8
- **API Endpoints:** 8
- **Frontend Pages:** 12+
- **User Roles:** 9
- **Workflow States:** 7
- **Permission Levels:** 10
- **Notification Types:** 7
- **Editorial Board Members:** 25
- **Published Articles:** 18

---

## 🎯 Key Features Summary

✅ Hierarchical editorial workflow
✅ In-app notification system
✅ Role-based dashboards
✅ Article submission & tracking
✅ Peer review management
✅ Multi-level approval system
✅ PDF article display
✅ Magazine-style thumbnails
✅ Editorial board showcase
✅ Real-time status updates
✅ Assignment tracking
✅ Workflow history
✅ Permission-based actions
✅ Responsive design
✅ Secure authentication

---

## 📝 Notes

- Email notifications system pending (currently in-app only)
- Search functionality UI present but not functional
- Some legacy dashboards exist alongside unified dashboard
- PDF thumbnail generation script available but manual
- Security enhancements recommended before production
- Analytics dashboard planned but not implemented

---

**Project Status:** ✅ Core functionality complete, ready for testing
**Last Updated:** October 22, 2025
**Version:** 1.0.0
