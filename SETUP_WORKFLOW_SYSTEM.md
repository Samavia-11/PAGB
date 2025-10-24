# Editorial Workflow System Setup Guide

## 1. Run SQL Migrations

```bash
# In phpMyAdmin, execute these SQL files in order:
```

### File 1: `database/editorial-roles-migration.sql`
- Creates editorial board tables
- Adds role permissions
- Inserts board members

### File 2: `database/notifications-table.sql`
- Creates notifications table for in-app alerts

## 2. Install Dependencies

```bash
npm install bcryptjs jsonwebtoken mysql2
```

## 3. Configure Environment

Create `.env.local`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=armyjournal
JWT_SECRET=your-secret-key-here
```

## 4. Test Login Credentials

- **Author**: username=`author`, password=`author123`
- **Reviewer**: username=`reviewer`, password=`reviewer123`
- **Editor**: username=`editor`, password=`editor123`
- **Admin**: username=`administrator`, password=`admin123`

## 5. Workflow Process

### Author Flow:
1. Login → Dashboard
2. Create article (draft)
3. Submit article
4. Receive notifications on status changes

### Editor Flow:
1. Login → Dashboard
2. View submitted articles
3. Assign to assistant editors
4. Approve/Reject articles
5. Publish approved articles

### Reviewer Flow:
1. Login → Dashboard
2. View assigned articles
3. Submit review feedback
4. Track article progress

## 6. In-App Notifications

- Bell icon shows unread count
- Click notification to mark as read
- Real-time updates on article workflow
- No email required - all in-app

## 7. API Endpoints Created

- `POST /api/auth/login` - User login
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/[id]/read` - Mark as read
- `GET /api/articles` - List articles
- `POST /api/articles` - Create article
- `POST /api/articles/[id]/workflow` - Workflow actions

## 8. Access the System

1. Go to `/login`
2. Use test credentials
3. Navigate to `/dashboard`
4. Start managing articles

## Features Implemented

✅ Role-based dashboards
✅ In-app notification system
✅ Article workflow (submit, assign, approve, publish, reject)
✅ Real-time status updates
✅ Assignment tracking
✅ Editorial board roles (9 types)
✅ Permission-based actions
✅ Workflow history tracking

## Next Steps

- Run SQL migrations
- Test login with different roles
- Create test articles
- Verify workflow transitions
- Check notifications appear correctly
