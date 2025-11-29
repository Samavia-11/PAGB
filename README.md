
# PAGB
# JournalFlow - Your Digital Journaling Companion
For production:
pm2 stop pagb-app
pm2 restart pagb-app
pm2 delete pagb-app   
A modern, beautiful, and secure journaling application built with Next.js, Node.js, and MySQL. Transform your manual journaling process into a seamless digital experience.

## 🌟 Features

- **Beautiful Landing Page** - Modern, responsive design with smooth animations
- **Rich Text Editor** - Express yourself with markdown and rich text formatting
- **End-to-End Encryption** - Your private thoughts stay private
- **Daily Reminders** - Build and maintain your journaling habit
- **Analytics & Insights** - Track your writing habits and personal growth
- **Photo & Media Support** - Enhance entries with photos and voice memos
- **Time Capsule** - Set entries to be revealed in the future

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.5.4, React 19, Tailwind CSS 4
- **Backend**: Node.js (to be implemented)
- **Database**: MySQL (to be implemented)
- **Styling**: Tailwind CSS with custom gradients and animations

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- MySQL (for database)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd PAGB
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the landing page.

### 4. Build for production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
PAGB/
├── src/
│   └── app/
│       ├── page.js          # Landing page component
│       ├── layout.js        # Root layout with metadata
│       ├── globals.css      # Global styles
│       └── favicon.ico      # App icon
├── public/              # Static assets
├── node_modules/        # Dependencies
├── package.json         # Project dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
├── next.config.js       # Next.js configuration
├── env.example          # Environment variables template
└── README.md           # This file
```

## 🎨 Customization

### Update Branding
- Edit `src/app/page.js` to change the brand name "JournalFlow"
- Update metadata in `src/app/layout.js`
- Replace social media links in the footer

### Styling
- Modify Tailwind classes in components
- Update `globals.css` for global styles
- Customize colors in the gradient classes

## 🔜 Next Steps

### Backend Setup (Node.js)
1. Create an `api/` directory for backend routes
2. Set up Express.js server
3. Implement authentication (JWT)
4. Create API endpoints for journal entries

### Database Setup (MySQL)
1. Create database schema
2. Set up tables for users, journals, entries
3. Configure database connection
4. Implement ORM (Sequelize or Prisma)

### Additional Features to Implement
- [ ] User authentication (signup/login)
- [ ] Journal entry creation and editing
- [ ] Search and filter functionality
- [ ] Tags and categories
- [ ] Export journal entries
- [ ] Mobile app (React Native)

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 👥 Team

Developed by INOTECH

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.

---

**Note**: This is currently the frontend landing page. Backend API and database integration are in progress.

