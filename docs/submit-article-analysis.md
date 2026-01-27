# Submit Article Page - Current Implementation Analysis

## Overview
The submit article page is located at `/src/app/submit-article/page.tsx` and serves as the main interface for authors to submit academic articles to the journal system.

## Current Structure Analysis

### 1. Component Architecture
- **Single Large Component**: The entire form is implemented as one monolithic React component (997 lines)
- **State Management**: Uses React hooks (useState, useEffect) for local state management
- **File Structure**: Single file contains all logic, UI, and data handling

### 2. Data Models & Interfaces
```typescript
interface ArticleForm {
  title: string;
  abstract: string;
  keywords: string;
  content: string;
  authors: AuthorEntry[];
  affiliation: string;
  articleType: string;
  coverLetter: string;
  conflicts: string;
  funding: string;
  ethics: boolean;
  licenseAgreement: boolean;
  manuscriptFile: File | null;
}

interface AuthorEntry {
  name: string;
  email: string;
  role: string;
  contact?: string;
}
```

### 3. Form Organization
The form is structured into three collapsible accordion sections:

#### Section 1: Authors & Affiliation
- Dynamic author management (add/remove authors)
- Role assignment (Main Author/Co-Author)
- Contact information validation
- Institutional affiliation field

#### Section 2: Manuscript
- Article type selection
- Abstract textarea
- Keywords with tag-based input
- File upload for manuscript

#### Section 3: Declarations
- Cover letter
- Conflict of interest
- Funding statement
- Ethics compliance checkbox
- License agreement checkbox

### 4. Key Features
- **Draft Saving**: Ability to save incomplete submissions
- **Edit Mode**: Edit existing articles within 3-hour window
- **Validation**: Client-side form validation with error messages
- **File Upload**: Support for DOC/DOCX files (max 10MB)
- **Local Storage**: Drafts stored in localStorage
- **Responsive Design**: Grid layouts for mobile/desktop

### 5. User Interaction Flow
1. Authentication check on page load
2. Form data entry with real-time validation
3. Draft saving capability
4. Final submission with API integration
5. Navigation to dashboard after submission

### 6. Technical Implementation Details

#### State Management
- 15+ useState hooks for different form fields
- Complex state update logic for author management
- Local storage integration for persistence

#### Validation Logic
- Real-time validation on field changes
- Custom validation functions for author requirements
- Error state management and display

#### API Integration
- Form data submission to `/api/articles`
- File upload handling with FormData
- Editor dashboard notification system

### 7. Current UI/UX Issues

#### HCI Violations
1. **Cognitive Overload**: Too many fields visible at once
2. **Inconsistent Layout**: Mixed grid layouts and spacing
3. **Poor Visual Hierarchy**: All sections have similar visual weight
4. **Accessibility Issues**: Missing ARIA labels and keyboard navigation
5. **Error Handling**: Error messages not optimally positioned

#### ISO 9241 Violations
1. **Suitability for the Task**: Complex workflow not broken into logical steps
2. **Self-Descriptiveness**: Unclear section organization
3. **Conformity with User Expectations**: Non-standard form patterns
4. **Learnability**: Steep learning curve for new users
5. **Error Tolerance**: Limited error prevention and recovery

### 8. Strengths
- Comprehensive form coverage
- Draft functionality
- Responsive design
- Real-time validation
- File upload capability

### 9. Technical Debt
- Monolithic component structure
- Mixed concerns (UI, logic, data)
- Complex state management
- Limited error handling
- No TypeScript strict mode
- Minimal accessibility features

### 10. Dependencies
- React hooks (useState, useEffect)
- Next.js router
- Lucide React icons
- Custom Layout component
- Browser APIs (localStorage, BroadcastChannel)

## Current File Structure
```
src/app/submit-article/
└── page.tsx (997 lines - single monolithic component)
```

## Summary
The current implementation provides comprehensive functionality but suffers from significant structural and UX issues that impact maintainability and user experience. The monolithic approach and complex state management make it difficult to maintain and extend, while the UI design violates several HCI and ISO standards for usability.
