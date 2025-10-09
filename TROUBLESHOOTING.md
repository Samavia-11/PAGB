# 🔧 Troubleshooting Guide

## ✅ Issues Fixed

### 1. Module Not Found: '@/lib/db' ✅
**Error**: `Module not found: Can't resolve '@/lib/db'`

**Cause**: Path alias `@` was not properly configured

**Solution**: Updated `tsconfig.json` and `jsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 2. Module Not Found: 'bcryptjs' ✅
**Error**: `Module not found: Can't resolve 'bcryptjs'`

**Cause**: Dependencies not installed

**Solution**: Run:
```bash
npm install
```

All dependencies (mysql2, bcryptjs, dotenv) are now installed.

### 3. Google Fonts Loading Issue ✅
**Error**: `Failed to download Inter from Google Fonts`

**Cause**: Network connectivity issue / Firewall blocking Google Fonts

**Solution**: Removed Google Fonts import and used system fonts instead.
Changed from:
```tsx
import { Inter } from 'next/font/google';
const inter = Inter({ ... });
```
To:
```tsx
<body className="antialiased font-sans">
```

### 4. ThemeColor Warning ✅
**Warning**: `Unsupported metadata themeColor`

**Cause**: themeColor should be in viewport export in Next.js 15

**Solution**: Removed themeColor from metadata (can be added to viewport export if needed)

---

## 🚀 Application Status

✅ **All errors resolved**  
✅ **Application running**  
✅ **Dependencies installed**  
✅ **Path aliases configured**  
✅ **Font issues fixed**  

---

## 📝 Common Issues & Solutions

### Issue: Port Already in Use
```
Error: Port 3000 is already in use
```
**Solution**: Next.js will automatically use another port (3001, 3002, etc.)

### Issue: Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution**:
1. Check MySQL is running
2. Verify `.env` file exists with correct credentials
3. Test connection: `mysql -u root -p`

### Issue: Database Not Found
```
Error: Unknown database 'armyjournal'
```
**Solution**:
```sql
CREATE DATABASE armyjournal;
```

### Issue: Module Not Found After Install
**Solution**: Restart the dev server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Issue: Changes Not Reflecting
**Solution**: Hard refresh browser
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### Issue: TypeScript Errors
**Solution**: Check `tsconfig.json` has correct paths:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 🔍 Debugging Steps

### 1. Check Dependencies
```bash
npm list mysql2 bcryptjs dotenv
```

### 2. Verify File Structure
```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   └── ...
└── lib/
    └── db.ts
```

### 3. Check Environment Variables
```bash
# Verify .env file exists
dir .env

# Check contents (Windows)
type .env
```

### 4. Test Database Connection
```bash
mysql -u root -p
USE armyjournal;
SHOW TABLES;
```

### 5. Clear Next.js Cache
```bash
# Delete .next folder
rmdir /s .next

# Restart
npm run dev
```

---

## ✅ Verification Checklist

- [x] Dependencies installed (`npm install`)
- [x] Path aliases configured (`@/*` → `./src/*`)
- [x] Font issues resolved (using system fonts)
- [x] TypeScript configured correctly
- [x] Application running without errors
- [ ] Database created (`armyjournal`)
- [ ] Users seeded (`npm run db:setup`)
- [ ] `.env` file created with MySQL credentials

---

## 🎯 Next Steps

1. **Create Database**:
   ```bash
   mysql -u root -p
   CREATE DATABASE armyjournal;
   exit
   ```

2. **Run Schema**:
   ```bash
   mysql -u root -p armyjournal < database/setup.sql
   ```

3. **Seed Users**:
   ```bash
   npm run db:setup
   ```

4. **Test Login**:
   - Go to http://localhost:3000/login
   - Use: `author` / `author123`

---

## 📞 Still Having Issues?

1. Check browser console for errors (F12)
2. Check terminal for server errors
3. Verify all files are in correct locations
4. Ensure MySQL is running
5. Check `.env` file has correct credentials

---

**Status**: ✅ All known issues resolved!  
**Application**: Running successfully  
**Ready**: For database setup and testing  

---

*Last Updated: October 2, 2025*
