'use client';

import React, { useEffect, useCallback } from 'react';
import { useFormWizard } from '../../hooks/useFormWizard';
import { useArticleSubmission } from '../../hooks/useArticleSubmission';
import { StepIndicator } from './StepIndicator';
import { StepNavigation } from './StepNavigation';
import { 
  Step1BasicInfo, 
  Step2Authors, 
  Step3Manuscript, 
  Step4Declarations 
} from '../steps';
import { FORM_STEPS } from '../../utils/constants';
import { useRouter } from 'next/navigation';
import { useConfirmDialog } from '@/contexts/ConfirmDialogContext';
import { showNotification } from '@/utils/notifications';

interface FormWizardProps {
  user: any;
  initialData?: any;
  isEditMode?: boolean;
  editingArticleId?: number | null;
}

export const FormWizard: React.FC<FormWizardProps> = ({
  user,
  initialData,
  isEditMode = false,
  editingArticleId = null,
}) => {
  const router = useRouter();
  const confirm = useConfirmDialog();
  
  const {
    wizardState,
    steps,
    currentStep,
    formData,
    validationErrors,
    isSubmitting,
    isEditMode: wizardEditMode,
    editingArticleId: wizardEditingId,
    isEditingDraft,
    
    // Actions
    updateFormData,
    nextStep,
    previousStep,
    goToStep,
    setSubmitting,
    setEditMode,
    loadFormData,
    resetForm,
    
    // Validation
    validateCurrentStep,
    validateEntireForm,
    getFieldError,
    hasFieldError,
    isStepValid,
    canProceedToNext,
    
    // Utilities
    getProgressPercentage,
  } = useFormWizard(user?.id);

  const {
    submitArticle,
    updateArticle,
    saveDraftArticle,
    loadDraftArticle,
    convertDraftToSubmission,
    submissionError,
    submissionSuccess,
    resetSubmissionState,
  } = useArticleSubmission(user);

  // Initialize edit mode if props are provided
  useEffect(() => {
    if (isEditMode && editingArticleId) {
      setEditMode(true, editingArticleId, false);
      // TODO: Load article data
    }
  }, [isEditMode, editingArticleId, setEditMode]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSaveDraft();
      } else if (e.key === 'Enter' && !e.shiftKey && currentStep < FORM_STEPS.length) {
        const activeElement = document.activeElement;
        if (activeElement?.tagName !== 'TEXTAREA' && activeElement?.tagName !== 'INPUT') {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, formData]);

  const handleNext = useCallback(async () => {
    if (canProceedToNext()) {
      nextStep();
    } else {
      await validateCurrentStep();
    }
  }, [canProceedToNext, nextStep, validateCurrentStep]);

  const handlePrevious = useCallback(() => {
    previousStep();
  }, [previousStep]);

  const handleStepClick = useCallback((step: number) => {
    goToStep(step);
  }, [goToStep]);

  const handleSaveDraft = useCallback(async () => {
    try {
      setSubmitting(true);
      const draft = saveDraftArticle(formData, wizardEditingId || undefined);
      
      // Show success message
      showNotification.success('Draft saved successfully!');
      
      // If this is a new draft, reload to get the ID
      if (!wizardEditingId) {
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Save draft error:', error);
      showNotification.error('Failed to save draft: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }, [formData, wizardEditingId, saveDraftArticle, setSubmitting]);

  const handleSubmit = useCallback(async () => {
    try {
      setSubmitting(true);
      
      // Validate entire form
      const isValid = await validateEntireForm();
      if (!isValid) {
        showNotification.warning('Please fix all errors before submitting.');
        return;
      }

      let success = false;
      
      if (wizardEditMode && wizardEditingId) {
        if (isEditingDraft) {
          // Convert draft to submission
          success = await convertDraftToSubmission(wizardEditingId, formData);
        } else {
          // Update existing article
          success = await updateArticle(formData, wizardEditingId);
        }
      } else {
        // Submit new article
        success = await submitArticle(formData);
      }

      if (success) {
        showNotification.success('Article submitted successfully!');
        router.push('/dashboard/author');
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      showNotification.error('Submission failed: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }, [
    formData,
    wizardEditMode,
    wizardEditingId,
    isEditingDraft,
    submitArticle,
    updateArticle,
    convertDraftToSubmission,
    validateEntireForm,
    setSubmitting,
    router,
  ]);

  const handleCancel = useCallback(() => {
    (async () => {
      const ok = await confirm({
        title: 'Cancel submission?',
        message: 'Are you sure you want to cancel? Any unsaved changes will be lost.',
        confirmText: 'Yes, cancel',
        cancelText: 'No',
        danger: true,
      });
      if (!ok) return;
      router.push('/dashboard/author');
    })();
  }, [confirm, router]);

  const completedSteps = steps.filter(step => step.isCompleted).map(step => step.id);
  const canGoBack = currentStep > 1;
  const isLastStep = currentStep === FORM_STEPS.length;

  // Render current step component
  const renderCurrentStep = () => {
    const commonProps = {
      formData,
      onChange: updateFormData,
      errors: validationErrors,
      disabled: isSubmitting,
    };

    switch (currentStep) {
      case 1:
        return <Step1BasicInfo {...commonProps} />;
      case 2:
        return <Step2Authors {...commonProps} />;
      case 3:
        return <Step3Manuscript {...commonProps} />;
      case 4:
        return <Step4Declarations {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full pb-12">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {wizardEditMode ? 'Edit Article' : 'Submit Article'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {wizardEditMode
            ? 'Update your article information'
            : 'Follow the steps below to submit your article for review'}
        </p>
      </div>

      {/* Step Indicator */}
      <StepIndicator
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
        disabled={isSubmitting}
      />

      {/* Form Card */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6 sm:p-8">
          {renderCurrentStep()}
        </div>

        <StepNavigation
          currentStep={currentStep}
          totalSteps={FORM_STEPS.length}
          canGoBack={canGoBack}
          canGoNext={canProceedToNext()}
          isSubmitting={isSubmitting}
          isLastStep={isLastStep}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          disabled={isSubmitting}
          saveDraftText={wizardEditMode ? 'Update Draft' : 'Save Draft'}
          submitText={wizardEditMode ? 'Update Article' : 'Submit Article'}
        />
      </div>

      {/* Submission Error */}
      {submissionError && (
        <div className="mt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Submission Error</h3>
                <p className="mt-1 text-sm text-red-700">{submissionError}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
