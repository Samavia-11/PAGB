# 🚀 Quick Reference - Army Journal

## ⚡ Quick Start (Copy & Paste)

```bash
# 1. Install
npm install

# 2. Setup .env
copy env.example .env
# Edit .env: Add your MySQL password

# 3. Create database
mysql -u root -p
CREATE DATABASE armyjournal;
exit

# 4. Run schema
mysql -u root -p armyjournal < database/setup.sql

# 5. Seed users
npm run db:setup

# 6. Start app
npm run dev
```

## 🔑 Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Author | `author` | `author123` |
| Reviewer | `reviewers` | `reviewers123` |
| Editor | `editor` | `editor123` |
| Admin | `administrator` | `admin123` |

## 🌐 URLs

- **Home**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Signup**: http://localhost:3000/signup
- **Author**: http://localhost:3000/author/dashboard
- **Reviewer**: http://localhost:3000/reviewer/dashboard
- **Editor**: http://localhost:3000/editor/dashboard
- **Admin**: http://localhost:3000/administrator/dashboard

## 💻 Commands

```bash
npm run dev          # Start development
npm run build        # Build for production
npm start            # Start production
npm run db:setup     # Seed users
npm run lint         # Run linter
```

## 📁 Key Files

```
src/app/page.tsx                    # Landing page
src/app/login/page.tsx              # Login
src/app/signup/page.tsx             # Signup
src/app/author/dashboard/page.tsx   # Author dashboard
src/lib/db.ts                       # Database connection
database/setup.sql                  # Database schema
database/seed-users.js              # User seeding
.env                                # Environment variables
```

## 🗄️ Database

**Name**: `armyjournal`

**Tables**:
- `users` - User accounts
- `articles` - Journal articles
- `article_workflow` - Workflow tracking
- `article_revisions` - Revision history

## 🔄 Workflow

```
Author → Reviewer → Editor → Administrator
(Create)  (Review)   (Edit)    (Publish)
```

## 🐛 Common Issues

**Port in use**: Next.js will auto-select another port  
**MySQL error**: Check MySQL is running  
**Module not found**: Run `npm install`  
**DB not found**: Run `CREATE DATABASE armyjournal;`

## ✅ Checklist

- [ ] MySQL installed and running
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with MySQL password
- [ ] Database `armyjournal` created
- [ ] Schema applied (`setup.sql`)
- [ ] Users seeded (`npm run db:setup`)
- [ ] App running (`npm run dev`)
- [ ] Login tested with `author` / `author123`

## 📚 Documentation

- `INSTALLATION_INSTRUCTIONS.md` - Quick install
- `SETUP_GUIDE.md` - Detailed guide
- `IMPLEMENTATION_COMPLETE.md` - Full overview

---

**Ready?** Run `npm run dev` and open http://localhost:3000 🚀
