# Submit Article Page - Refactored Structure Proposal

## Overview
This proposal outlines a refactored structure for the submit article page that follows HCI and ISO 9241 standards, improving maintainability, user experience, and accessibility.

## Proposed Architecture

### 1. Component-Based Architecture

#### File Structure
```
src/app/submit-article/
├── page.tsx                    # Main page component
├── components/
│   ├── FormWizard/
│   │   ├── index.tsx          # Main wizard controller
│   │   ├── StepIndicator.tsx  # Progress indicator
│   │   └── StepNavigation.tsx # Previous/Next buttons
│   ├── steps/
│   │   ├── Step1BasicInfo.tsx # Title & basic info
│   │   ├── Step2Authors.tsx   # Author management
│   │   ├── Step3Manuscript.tsx # Manuscript details
│   │   ├── Step4Declarations.tsx # Declarations
│   │   └── Step5Review.tsx    # Review & submit
│   ├── shared/
│   │   ├── FormField.tsx      # Reusable form field
│   │   ├── FileUpload.tsx     # File upload component
│   │   ├── KeywordInput.tsx   # Keyword tag input
│   │   ├── AuthorEntry.tsx    # Author entry component
│   │   └── ValidationMessage.tsx # Error display
│   └── layout/
│       ├── FormContainer.tsx  # Main form container
│       └── ProgressSidebar.tsx # Progress sidebar
├── hooks/
│   ├── useFormWizard.ts       # Wizard state management
│   ├── useFormValidation.ts   # Validation logic
│   ├── useArticleSubmission.ts # Submission logic
│   └── useDraftManagement.ts  # Draft functionality
├── types/
│   ├── article.types.ts       # Type definitions
│   └── validation.types.ts    # Validation types
├── utils/
│   ├── validation.ts          # Validation functions
│   ├── storage.ts             # Local storage utilities
│   └── constants.ts           # Form constants
└── styles/
    └── submit-article.module.css # Component styles
```

### 2. Step-by-Step Wizard Design

#### Step 1: Basic Information
- Article title with character counter
- Article type selection with descriptions
- Brief introduction and progress indicator

#### Step 2: Authors & Affiliation
- Single author entry per screen
- Clear role assignment interface
- Institutional affiliation with autocomplete
- Contact validation with format hints

#### Step 3: Manuscript Details
- Abstract with word counter and guidelines
- Keywords with suggestions and validation
- File upload with drag-and-drop
- Preview of uploaded document

#### Step 4: Declarations
- Simplified declaration forms
- Clear explanations for each field
- Required vs optional indicators
- Checkbox agreements with links to terms

#### Step 5: Review & Submit
- Complete form summary
- Edit links for each section
- Final validation check
- Submission confirmation

### 3. HCI & ISO 9241 Compliance

#### ISO 9241-110: Dialogue Principles
1. **Suitability for the Task**: Step-by-step breakdown reduces cognitive load
2. **Self-Descriptiveness**: Clear labels, instructions, and progress indicators
3. **Conformity with User Expectations**: Standard wizard pattern
4. **Learnability**: Progressive disclosure of complexity
5. **Controllability**: Users can navigate between steps freely
6. **Error Tolerance**: Real-time validation and clear error messages

#### HCI Design Principles
1. **Visibility of System Status**: Progress indicator and clear step labels
2. **Match Between System and Real World**: Academic submission workflow
3. **User Control and Freedom**: Save draft, navigate freely, edit previous steps
4. **Consistency and Standards**: Consistent field layouts and interactions
5. **Error Prevention**: Real-time validation and confirmation dialogs
6. **Recognition Rather Than Recall**: Auto-suggestions and clear field labels
7. **Flexibility and Efficiency of Use**: Keyboard shortcuts and quick navigation
8. **Aesthetic and Minimalist Design**: Clean, focused interface per step
9. **Help Users Recognize, Diagnose, and Recover from Errors**: Clear error messages
10. **Help and Documentation**: Contextual help and guidelines

### 4. Enhanced Accessibility Features

#### WCAG 2.1 AA Compliance
- Semantic HTML5 structure
- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management
- Error announcement

#### Accessibility Implementation
```typescript
// Example accessible form field
const FormField = ({ label, error, required, ...props }) => (
  <div className="form-field">
    <label htmlFor={props.id} className="form-label">
      {label}
      {required && <span className="required-indicator" aria-label="required">*</span>}
    </label>
    <input
      {...props}
      aria-describedby={error ? `${props.id}-error` : undefined}
      aria-invalid={!!error}
      className={`form-input ${error ? 'error' : ''}`}
    />
    {error && (
      <div id={`${props.id}-error`} className="error-message" role="alert">
        {error}
      </div>
    )}
  </div>
);
```

### 5. Improved State Management

#### Custom Hooks Architecture
```typescript
// useFormWizard.ts
export const useFormWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const nextStep = useCallback(() => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  }, [formData]);
  
  const previousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);
  
  return {
    currentStep,
    formData,
    validationErrors,
    isSubmitting,
    nextStep,
    previousStep,
    updateFormData: setFormData,
    goToStep: setCurrentStep
  };
};
```

### 6. Enhanced Validation Strategy

#### Multi-Level Validation
1. **Field-level validation**: Real-time feedback
2. **Step-level validation**: Before navigation
3. **Form-level validation**: Before submission
4. **Server-side validation**: Final verification

#### Validation Types
```typescript
interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
  level: 'error' | 'warning' | 'info';
}

interface FieldValidation {
  [fieldName: string]: ValidationRule[];
}
```

### 7. Progressive Enhancement

#### Core Features (Always Available)
- Basic form submission
- Client-side validation
- Draft saving
- Error handling

#### Enhanced Features (Progressive)
- Auto-save functionality
- Keyboard shortcuts
- Advanced validation
- Real-time collaboration
- Offline support

### 8. Mobile-First Responsive Design

#### Breakpoint Strategy
- **Mobile (< 768px)**: Single column, full-width fields
- **Tablet (768px - 1024px)**: Two-column layouts where appropriate
- **Desktop (> 1024px)**: Optimal multi-column layouts

#### Touch-Friendly Interactions
- Large tap targets (minimum 44px)
- Swipe gestures for step navigation
- Touch-optimized file upload
- Mobile keyboard optimization

### 9. Performance Optimizations

#### Code Splitting
```typescript
// Lazy loading of step components
const Step1BasicInfo = lazy(() => import('./steps/Step1BasicInfo'));
const Step2Authors = lazy(() => import('./steps/Step2Authors'));
// ... other steps
```

#### Optimizations
- Component memoization
- Debounced validation
- Efficient re-renders
- Optimized bundle size

### 10. Error Handling & User Feedback

#### Error Recovery Strategies
1. **Prevention**: Real-time validation
2. **Detection**: Immediate error identification
3. **Recovery**: Clear correction paths
4. **Learning**: Explanatory error messages

#### Feedback Mechanisms
- Loading states with progress indicators
- Success confirmations with next steps
- Error messages with specific guidance
- Auto-save notifications

### 11. Testing Strategy

#### Testing Types
1. **Unit Tests**: Component logic and utilities
2. **Integration Tests**: Component interactions
3. **E2E Tests**: Complete user flows
4. **Accessibility Tests**: Screen reader and keyboard navigation
5. **Performance Tests**: Load times and interactions

#### Test Coverage Goals
- 90%+ code coverage
- All user flows tested
- Accessibility compliance verified
- Performance benchmarks met

### 12. Implementation Phases

#### Phase 1: Foundation (Week 1-2)
- Set up new file structure
- Create base components
- Implement wizard navigation
- Basic validation framework

#### Phase 2: Core Features (Week 3-4)
- Implement all form steps
- Add validation logic
- Integrate with existing APIs
- Draft functionality

#### Phase 3: Enhancement (Week 5-6)
- Accessibility improvements
- Mobile optimization
- Error handling refinement
- Performance optimization

#### Phase 4: Testing & Polish (Week 7-8)
- Comprehensive testing
- User acceptance testing
- Bug fixes and refinements
- Documentation updates

### 13. Migration Strategy

#### Backward Compatibility
- Maintain existing API contracts
- Preserve draft data format
- Gradual rollout with feature flags
- Fallback to original form if needed

#### Data Migration
- Convert existing draft formats
- Maintain localStorage compatibility
- API response format preservation

### 14. Success Metrics

#### User Experience Metrics
- Form completion rate
- Time to submission
- Error rate reduction
- User satisfaction scores

#### Technical Metrics
- Page load time
- Bundle size reduction
- Accessibility score
- Test coverage percentage

## Conclusion

This refactored structure addresses the current implementation's issues by:
- Breaking down complexity into manageable steps
- Following established HCI and ISO standards
- Improving maintainability through modular architecture
- Enhancing accessibility and mobile experience
- Providing better error handling and user feedback
- Ensuring robust testing and performance

The proposed wizard-based approach will significantly improve the user experience while making the codebase more maintainable and extensible for future enhancements.
