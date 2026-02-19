# PAGB - Pakistan Armed Forces Journal Management System

A comprehensive, modern journal management system built for the Pakistan Armed Forces (PAGB) to streamline the publication process, manage submissions, facilitate peer review, and maintain academic standards.

## 🚀 Overview

PAGB is a full-stack web application that provides a complete solution for academic journal management, featuring role-based access control, article submission workflows, peer review processes, and administrative oversight.

### Key Features

- **Multi-Role System**: Authors, Reviewers, Editors, and Administrators
- **Article Management**: Complete submission lifecycle from draft to publication
- **Peer Review System**: Automated reviewer assignment and review tracking
- **File Management**: Secure document uploads with type restrictions
- **Real-time Notifications**: In-app messaging and email notifications
- **Analytics Dashboard**: Comprehensive statistics and reporting
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **TypeScript**: Full type safety and improved development experience

## 🛠️ Technology Stack

### Frontend
- **Next.js 15.5.4** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript 5.7.3** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **Chart.js** - Data visualization

### Backend
- **Node.js** - JavaScript runtime
- **MySQL 2** - Database management
- **bcryptjs** - Password hashing
- **JOSE** - JWT token handling
- **Next.js API Routes** - Serverless API endpoints

### Development Tools
- **ESLint** - Code linting
- **Turbopack** - Fast development bundler
- **PostCSS** - CSS processing

## 📋 System Requirements

- **Node.js**: 18.x or higher
- **MySQL**: 8.0 or higher
- **npm**: 9.x or higher
- **Operating System**: Windows, macOS, or Linux

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd PAGB
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the environment template and configure:

```bash
cp env.example .env
```

Edit `.env` file with your database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=pagb_db

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

Create a MySQL database and run the setup script:

```sql
CREATE DATABASE pagb_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Run the database setup:

```bash
npm run db:setup
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
PAGB/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Role-specific dashboards
│   │   ├── reviewer/          # Reviewer interfaces
│   │   ├── editor/            # Editor interfaces
│   │   └── ...
│   ├── components/           # Reusable React components
│   ├── lib/                  # Utility libraries
│   └── utils/                # Helper functions
├── database/                 # Database setup and migrations
├── public/                   # Static assets
├── docs/                     # Documentation
└── scripts/                  # Build and deployment scripts
```

## 👥 User Roles & Permissions

### Authors
- Submit articles and manuscripts
- Track submission status
- Respond to reviewer feedback
- Manage personal profile

### Reviewers
- Access assigned articles for review
- Submit review recommendations
- Download and review attachments
- Communicate with editors

### Editors
- Manage article submissions
- Assign reviewers to articles
- Forward articles to reviewers/authors
- Monitor review progress
- Publish approved articles

### Administrators
- User management and permissions
- System configuration
- Analytics and reporting
- Publication management
- Issue creation and management

## 🔄 Workflow Process

### Article Submission Flow

1. **Author Submission**: Authors submit articles through the submission form
2. **Editor Review**: Editors review and assign appropriate reviewers
3. **Peer Review**: Reviewers evaluate articles and provide feedback
4. **Author Revision**: Authors address reviewer comments
5. **Final Approval**: Editors make final publication decisions
6. **Publication**: Approved articles are published in current issues

### Review Process

- **Pending**: Article awaiting reviewer assignment
- **In Review**: Article currently under review
- **Revision Required**: Author needs to make changes
- **Approved**: Article ready for publication
- **Rejected**: Article not suitable for publication

## 📁 File Management

### Supported File Types
- **PDF Documents** (.pdf) - Primary manuscript format
- **Word Documents** (.docx) - Alternative manuscript format

### File Restrictions
- Maximum file size: 10MB
- Automatic virus scanning
- Secure storage with access controls

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions by user role
- **Input Sanitization**: Protection against XSS attacks
- **File Type Validation**: Restriction to allowed file types
- **SQL Injection Protection**: Parameterized queries
- **CSRF Protection**: Cross-site request forgery prevention

## 📊 Analytics & Reporting

### Dashboard Metrics
- Submission statistics
- Review completion rates
- User activity tracking
- Publication timelines
- Geographic distribution

### Administrative Reports
- Monthly submission summaries
- Reviewer performance metrics
- Publication analytics
- System usage statistics

## 🎨 UI/UX Features

- **Responsive Design**: Works on all device sizes
- **Dark Mode Support**: Eye-friendly interface option
- **Accessibility**: WCAG 2.1 compliant
- **Real-time Updates**: Live status updates
- **Intuitive Navigation**: User-friendly interface
- **Search & Filter**: Advanced content discovery

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run db:setup         # Initialize database
npm run db:create-messages  # Create messaging tables
```

## 🧪 Testing

The application includes comprehensive testing for:

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Complete user workflow testing
- **Security Tests**: Vulnerability scanning

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Article Management
- `GET /api/articles` - List articles
- `POST /api/articles` - Create article
- `PATCH /api/articles` - Update article
- `DELETE /api/articles` - Delete article

### Review System
- `GET /api/review-requests` - Get review assignments
- `POST /api/reviews/submit` - Submit review
- `GET /api/editor-articles` - Get editor articles

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables for Production

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
DB_HOST=your-production-db-host
DB_USER=your-production-db-user
DB_PASSWORD=your-production-db-password
DB_NAME=your-production-db-name
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style Guidelines

- Use TypeScript for all new code
- Follow ESLint configuration
- Write meaningful commit messages
- Add unit tests for new features
- Update documentation as needed

## 📝 License

This project is proprietary software owned by the Pakistan Armed Forces (PAGB). All rights reserved.

## 🆘 Support & Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify MySQL service is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **Authentication Issues**
   - Clear browser cookies and localStorage
   - Verify JWT secret is set correctly
   - Check user role permissions

3. **File Upload Problems**
   - Verify file type restrictions
   - Check file size limits
   - Ensure upload directory permissions

### Getting Help

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs through the issue tracker
- **Support**: Contact the development team

## 🔄 Version History

### v0.1.0 (Current)
- Initial release with core functionality
- Multi-role user system
- Article submission and review workflow
- Basic analytics dashboard
- File management system

## 🎯 Future Roadmap

- **Advanced Analytics**: Machine learning insights
- **Mobile App**: Native iOS and Android applications
- **Integration**: ORCID, DOI, and academic database integration
- **Collaboration Tools**: Real-time co-authoring features
- **Multilingual Support**: International language support
- **Advanced Search**: Full-text search with filters

---

**Developed with ❤️ for the Pakistan Armed Forces (PAGB)**

*For technical support or questions, please contact the development team.*
