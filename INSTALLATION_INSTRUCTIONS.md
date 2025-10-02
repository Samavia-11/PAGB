# 📦 Installation Instructions - Army Journal Application

## 🎯 Quick Start (5 Steps)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create Environment File
```bash
copy env.example .env
```

Edit `.env` and add your MySQL password:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=armyjournal
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
```

### Step 3: Create Database
Open MySQL and run:
```sql
CREATE DATABASE armyjournal;
```

Or run the setup script:
```bash
mysql -u root -p < database/setup.sql
```

### Step 4: Seed Default Users
```bash
npm run db:setup
```

This creates 4 users:
- `author` / `author123`
- `reviewers` / `reviewers123`
- `editor` / `editor123`
- `administrator` / `admin123`

### Step 5: Start Application
```bash
npm run dev
```

Open: **http://localhost:3000**

---

## ✅ Verify Installation

1. **Check Landing Page**: http://localhost:3000
2. **Test Login**: http://localhost:3000/login
   - Use: `author` / `author123`
   - Should redirect to: `/author/dashboard`
3. **Test Other Roles**: Login with different credentials

---

## 🔧 Troubleshooting

### MySQL Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Fix**: Start MySQL service
```bash
# Windows
net start MySQL80

# Or check MySQL is running in Services
```

### Database Not Found
```
Error: Unknown database 'armyjournal'
```
**Fix**: Create the database
```sql
CREATE DATABASE armyjournal;
```

### Module Not Found
```
Error: Cannot find module 'mysql2'
```
**Fix**: Install dependencies
```bash
npm install
```

---

## 📋 Login Credentials

| Role | Username | Password | Dashboard URL |
|------|----------|----------|---------------|
| Author | `author` | `author123` | `/author/dashboard` |
| Reviewer | `reviewers` | `reviewers123` | `/reviewer/dashboard` |
| Editor | `editor` | `editor123` | `/editor/dashboard` |
| Administrator | `administrator` | `admin123` | `/administrator/dashboard` |

---

## 🎉 You're Ready!

Your Army Journal application is now running with:
- ✅ TypeScript landing page
- ✅ Login/Signup pages
- ✅ 4 role-based dashboards
- ✅ MySQL database integration
- ✅ Authentication system
- ✅ Protected routes

**Next**: Start creating articles as an Author!

---

*For detailed information, see SETUP_GUIDE.md*
