# 🚀 Complete Setup Guide - JournalFlow Army Journal

## ✅ What Has Been Created

Your complete role-based journaling application with MySQL database integration is ready!

---

## 📁 Project Structure

```
PAGB/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── layout.tsx                  # Root layout
│   │   ├── login/
│   │   │   └── page.tsx               # Login page
│   │   ├── signup/
│   │   │   └── page.tsx               # Signup page
│   │   ├── author/
│   │   │   └── dashboard/
│   │   │       └── page.tsx           # Author dashboard
│   │   ├── reviewer/
│   │   │   └── dashboard/
│   │   │       └── page.tsx           # Reviewer dashboard
│   │   ├── editor/
│   │   │   └── dashboard/
│   │   │       └── page.tsx           # Editor dashboard
│   │   ├── administrator/
│   │   │   └── dashboard/
│   │   │       └── page.tsx           # Administrator dashboard
│   │   └── api/
│   │       └── auth/
│   │           ├── login/
│   │           │   └── route.ts       # Login API
│   │           └── signup/
│   │               └── route.ts       # Signup API
│   └── lib/
│       └── db.ts                       # Database connection
├── database/
│   ├── setup.sql                       # Database schema
│   └── seed-users.js                   # User seeding script
├── package.json                        # Dependencies
├── env.example                         # Environment variables template
└── tsconfig.json                       # TypeScript config
```

---

## 🔧 Installation Steps

### Step 1: Install Dependencies

```bash
npm install
```

This will install:
- **mysql2** - MySQL database driver
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables
- **TypeScript types** - For type safety

### Step 2: Configure Environment Variables

1. Copy the example environment file:
```bash
copy env.example .env
```

2. Edit `.env` and update with your MySQL credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=armyjournal
DB_USER=root
DB_PASSWORD=your_mysql_password
```

### Step 3: Set Up MySQL Database

1. **Open MySQL Workbench or MySQL Command Line**

2. **Run the setup script**:
```bash
mysql -u root -p < database/setup.sql
```

Or manually execute the SQL in `database/setup.sql`

3. **Seed default users**:
```bash
npm run db:setup
```

This will create 4 default users with hashed passwords:
- **Author**: username=`author`, password=`author123`
- **Reviewer**: username=`reviewers`, password=`reviewers123`
- **Editor**: username=`editor`, password=`editor123`
- **Administrator**: username=`administrator`, password=`admin123`

### Step 4: Run the Application

```bash
npm run dev
```

Open: **http://localhost:3000**

---

## 👥 User Roles & Credentials

### 1. Author
- **Username**: `author`
- **Password**: `author123`
- **Access**: Can create and submit articles
- **Dashboard**: `/author/dashboard`

### 2. Reviewer
- **Username**: `reviewers`
- **Password**: `reviewers123`
- **Access**: Can review articles submitted by authors
- **Dashboard**: `/reviewer/dashboard`

### 3. Editor
- **Username**: `editor`
- **Password**: `editor123`
- **Access**: Can edit articles forwarded by reviewers
- **Dashboard**: `/editor/dashboard`

### 4. Administrator
- **Username**: `administrator`
- **Password**: `admin123`
- **Access**: Can publish articles forwarded by editors
- **Dashboard**: `/administrator/dashboard`

---

## 🔄 Article Workflow

```
Author (Create) 
    ↓
Reviewer (Review & Forward)
    ↓
Editor (Edit & Forward)
    ↓
Administrator (Publish)
```

### Workflow Details:

1. **Author** creates an article → Status: `draft`
2. **Author** submits article → Status: `submitted`
3. **Reviewer** reviews and forwards → Status: `with_editor`
4. **Editor** edits and forwards → Status: `with_admin`
5. **Administrator** publishes → Status: `published`

---

## 📊 Database Tables

### `users` Table
- Stores user information
- Fields: id, username, email, password (hashed), full_name, role, created_at, last_login

### `articles` Table
- Stores journal articles
- Fields: id, title, content, author_id, status, created_at, updated_at, submitted_at, published_at

### `article_workflow` Table
- Tracks article movement between roles
- Fields: id, article_id, from_user_id, to_user_id, from_role, to_role, action, comments, created_at

### `article_revisions` Table
- Tracks changes made by reviewers/editors
- Fields: id, article_id, revised_by, revised_content, revision_notes, created_at

---

## 🎨 Features by Role

### Author Features:
- ✅ Create new articles
- ✅ Edit draft articles
- ✅ Submit articles for review
- ✅ View article status
- ✅ Dashboard with statistics

### Reviewer Features:
- ✅ View submitted articles
- ✅ Read and review articles
- ✅ Make changes/suggestions
- ✅ Forward to editor
- ✅ Return to author (if needed)

### Editor Features:
- ✅ View articles from reviewers
- ✅ Make final edits
- ✅ Forward to administrator
- ✅ Track editing history

### Administrator Features:
- ✅ View final articles
- ✅ Publish articles
- ✅ View all published content
- ✅ Manage publication status

---

## 🔒 Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt (10 rounds)
2. **Role-Based Access**: Each role has specific permissions
3. **Protected Routes**: Dashboards check authentication
4. **SQL Injection Prevention**: Using parameterized queries
5. **XSS Protection**: React's built-in protection

---

## 🛠️ Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:setup` | Seed default users |

---

## 📝 API Endpoints

### Authentication
- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/signup` - User registration

### Articles (To be implemented)
- **GET** `/api/articles/author/:userId` - Get author's articles
- **GET** `/api/articles/reviewer` - Get articles for review
- **GET** `/api/articles/editor` - Get articles for editing
- **GET** `/api/articles/administrator` - Get articles for publication
- **POST** `/api/articles` - Create new article
- **PUT** `/api/articles/:id` - Update article
- **POST** `/api/articles/:id/submit` - Submit article
- **POST** `/api/articles/:id/forward` - Forward article
- **POST** `/api/articles/:id/publish` - Publish article

---

## 🔜 Next Steps

### Immediate Tasks:
1. ✅ Login/Signup pages - **COMPLETE**
2. ✅ Role-based dashboards - **COMPLETE**
3. ✅ Database setup - **COMPLETE**
4. ⏳ Article creation page
5. ⏳ Article review/edit pages
6. ⏳ Article API endpoints
7. ⏳ File upload functionality
8. ⏳ Rich text editor integration

### Future Enhancements:
- [ ] Email notifications
- [ ] Article search and filter
- [ ] Export to PDF
- [ ] Analytics dashboard
- [ ] User management (for admin)
- [ ] Article versioning
- [ ] Comments system
- [ ] Activity logs

---

## 🐛 Troubleshooting

### Database Connection Issues:
```
Error: connect ECONNREFUSED
```
**Solution**: 
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database `armyjournal` exists

### Port Already in Use:
```
Error: Port 3000 is already in use
```
**Solution**:
- Kill the process using port 3000
- Or Next.js will auto-select another port

### Module Not Found:
```
Error: Cannot find module 'mysql2'
```
**Solution**:
```bash
npm install
```

---

## 📚 Technology Stack

- **Frontend**: Next.js 15.5.4, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: MySQL (armyjournal)
- **Authentication**: bcryptjs
- **ORM**: mysql2 (direct queries)

---

## ✅ Testing the Application

### 1. Test Login:
1. Go to http://localhost:3000/login
2. Use credentials: `author` / `author123`
3. Should redirect to `/author/dashboard`

### 2. Test Signup:
1. Go to http://localhost:3000/signup
2. Fill in the form
3. Select a role
4. Submit and login

### 3. Test Role Access:
- Login as different roles
- Verify each sees their respective dashboard
- Check role-specific features

---

## 📞 Support

For issues or questions:
1. Check this guide
2. Review database logs
3. Check browser console for errors
4. Verify environment variables

---

## 🎉 Success Criteria

✅ All dependencies installed  
✅ Database created and seeded  
✅ Login/Signup working  
✅ Role-based dashboards accessible  
✅ Authentication flow complete  
✅ TypeScript compilation successful  

---

**Status**: ✅ **READY FOR DEVELOPMENT**

**Database**: armyjournal  
**Default Users**: 4 roles seeded  
**Next Step**: Run `npm install` then `npm run dev`  

---

*Setup Guide Created: October 2, 2025*  
*Version: 1.0.0*  
*Team: INOTECH*
