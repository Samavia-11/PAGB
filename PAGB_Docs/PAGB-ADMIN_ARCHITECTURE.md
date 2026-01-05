# PAGB-Admin Architecture Explanation

## Overview

The PAGB (Pakistan Army Green Book) admin system is split across two main directories in the Next.js application:
- `/src/app/pagb-admin/` - Frontend UI components
- `/src/app/api/pagb-admin/` - Backend API routes

This separation follows Next.js App Router conventions where:
- **App Router pages** handle the frontend user interface
- **API routes** handle backend logic and data operations

## Directory Structure

### Frontend: `/src/app/pagb-admin/`
```
pagb-admin/
├── articles/          # Article management UI
│   ├── page.tsx      # List all articles
│   └── [id]/         # Individual article pages
├── authors/          # Author management UI
│   └── page.tsx      # Manage authors
├── issues/           # Issue management UI
│   ├── page.tsx      # List all issues
│   └── [id]/         # Create/edit individual issues
├── layout.tsx        # Admin panel layout with navigation
├── login/            # Login page
│   └── page.tsx
├── logout/           # Logout page
│   └── page.tsx
└── page.tsx          # Dashboard home page
```

### Backend: `/src/app/api/pagb-admin/`
```
api/pagb-admin/
├── articles/         # Article API endpoints
│   ├── route.ts      # GET/POST articles
│   └── [id]/         # GET/PUT/DELETE individual articles
├── authors/          # Author API endpoints
│   ├── route.ts      # GET/POST authors
│   └── [id]/         # GET/PUT/DELETE individual authors
├── issues/           # Issue API endpoints
│   ├── route.ts      # GET/POST issues
│   └── [id]/         # GET/PUT/DELETE individual issues
├── login/            # Authentication endpoint
│   └── route.ts      # POST login
├── logout/           # Logout endpoint
│   └── route.ts      # POST logout
├── me/               # Current user info
│   └── route.ts      # GET authenticated user
└── uploads/          # File upload handling
    ├── route.ts      # File upload endpoint
    └── [filename]/   # Serve uploaded files
```

## How They Work Together

### 1. Authentication Flow
- **Frontend**: `/pagb-admin/login/page.tsx` displays login form
- **Backend**: `/api/pagb-admin/login/route.ts` handles authentication
- **Flow**: Frontend sends credentials → Backend validates → Sets JWT cookie → Frontend redirects to dashboard

### 2. Dashboard Access
- **Frontend**: `/pagb-admin/page.tsx` checks authentication via `/api/pagb-admin/me`
- **Backend**: `/api/pagb-admin/me/route.ts` validates JWT and returns user info
- **Security**: All admin pages check authentication before rendering

### 3. Data Management (Example: Issues)
- **Frontend**: `/pagb-admin/issues/page.tsx` displays issues list
- **Backend**: `/api/pagb-admin/issues/route.ts` provides CRUD operations
- **Interaction**: Frontend fetches data → User interacts → Frontend calls API → Backend processes → Frontend updates

## Key Features

### Frontend Responsibilities
- **User Interface**: React components with Tailwind CSS styling
- **Navigation**: Layout with consistent admin navigation
- **User Experience**: Loading states, error handling, confirmations
- **Data Display**: Tables, forms, cards for content management
- **Client-side Routing**: Next.js Link components for navigation

### Backend Responsibilities
- **Authentication**: JWT-based login/logout with secure cookies
- **Database Operations**: MySQL queries via pagbDb connection pool
- **File Handling**: PDF uploads, image management
- **Validation**: Input validation and error handling
- **Security**: Admin-only access control via requireAdmin middleware

## Security Implementation

### Authentication
- JWT tokens stored in httpOnly cookies
- Automatic token validation on protected routes
- Secure cookie settings for production

### Authorization
- `requireAdmin()` middleware protects all API endpoints
- Database-driven admin user management
- Role-based access control

### Data Protection
- SQL injection prevention via parameterized queries
- Input validation on all endpoints
- Secure file upload handling

## Benefits of This Architecture

### 1. Separation of Concerns
- Clear distinction between UI and business logic
- Easier maintenance and debugging
- Better code organization

### 2. Next.js Best Practices
- Follows App Router conventions
- Leverages server components and API routes
- Optimal performance with proper caching

### 3. Scalability
- API can be consumed by other clients (mobile apps, etc.)
- Frontend can be easily extended or redesigned
- Backend logic remains consistent

### 4. Security
- Centralized authentication logic
- Consistent authorization checks
- Secure data handling

## File Naming Conventions

### Frontend
- `page.tsx` - Main page component
- `layout.tsx` - Layout wrapper
- `[id]/` - Dynamic route segments
- Client components marked with `'use client'`

### Backend
- `route.ts` - API route handlers
- HTTP methods as exported functions (GET, POST, PUT, DELETE)
- Consistent error handling and response format

## Database Integration

The system uses a MySQL database with:
- **Connection pooling** via `getPagbPool()`
- **Helper functions** via `pagbQuery()`
- **Transaction support** for complex operations
- **Admin tables** for authentication and content management

## Development Workflow

1. **Frontend Development**: Create/edit React components in `/pagb-admin/`
2. **Backend Development**: Implement API endpoints in `/api/pagb-admin/`
3. **Integration**: Connect frontend to backend via fetch calls
4. **Testing**: Test both UI interactions and API responses
5. **Security**: Ensure all endpoints are properly protected

This architecture provides a robust, secure, and maintainable foundation for the PAGB journal management system.
