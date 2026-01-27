'use client';

import { useState, useCallback, useEffect } from 'react';
import { WizardState, ArticleForm, FormStep } from '../types/article.types';
import { validateStep, validateForm } from '../utils/validation';
import { saveWizardState, loadWizardState, clearWizardState } from '../utils/storage';
import { FORM_STEPS } from '../utils/constants';

const initialFormData: ArticleForm = {
  title: '',
  abstract: '',
  keywords: '',
  content: '',
  authors: [{ name: '', email: '', role: 'Main Author', contact: '' }],
  affiliation: '',
  articleType: '',
  coverLetter: '',
  conflicts: '',
  funding: '',
  ethics: false,
  licenseAgreement: false,
  manuscriptFile: null,
};

const initialWizardState: WizardState = {
  currentStep: 1,
  formData: initialFormData,
  validationErrors: {},
  isSubmitting: false,
  isEditMode: false,
  editingArticleId: null,
  isEditingDraft: false,
};

export const useFormWizard = (userId: number | null) => {
  const [wizardState, setWizardState] = useState<WizardState>(initialWizardState);
  const [steps, setSteps] = useState<FormStep[]>(
    FORM_STEPS.map(step => ({
      ...step,
      isCompleted: false,
      isValid: false,
    }))
  );

  // Load saved state on mount
  useEffect(() => {
    if (userId) {
      const savedState = loadWizardState();
      if (savedState && savedState.userId === userId) {
        setWizardState(prev => ({
          ...prev,
          formData: { ...prev.formData, ...savedState.formData, manuscriptFile: null },
          currentStep: savedState.currentStep || 1,
        }));
      }
    }
  }, [userId]);

  // Auto-save state changes
  useEffect(() => {
    if (userId && wizardState.currentStep > 1) {
      // Never persist File objects to localStorage. They stringify to `{}` and will
      // later crash validation when treated like a real File.
      const { manuscriptFile: _ignore, ...persistedFormData } = wizardState.formData;
      const saveData = {
        userId,
        formData: persistedFormData,
        currentStep: wizardState.currentStep,
      };
      saveWizardState(saveData);
    }
  }, [wizardState.formData, wizardState.currentStep, userId]);

  // Update step validation status
  useEffect(() => {
    const updatedSteps = steps.map(step => {
      const validation = validateStep(step.id, wizardState.formData);
      return {
        ...step,
        isValid: validation.isValid,
        isCompleted: step.id < wizardState.currentStep && validation.isValid,
      };
    });
    setSteps(updatedSteps);
  }, [wizardState.formData, wizardState.currentStep]);

  const updateFormData = useCallback((updates: Partial<ArticleForm>) => {
    setWizardState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...updates },
    }));
  }, []);

  const setCurrentStep = useCallback((step: number) => {
    if (step >= 1 && step <= FORM_STEPS.length) {
      setWizardState(prev => ({ ...prev, currentStep: step }));
    }
  }, []);

  const nextStep = useCallback(() => {
    const currentValidation = validateStep(wizardState.currentStep, wizardState.formData);
    if (currentValidation.isValid) {
      setWizardState(prev => ({
        ...prev,
        currentStep: Math.min(prev.currentStep + 1, FORM_STEPS.length),
      }));
    } else {
      setWizardState(prev => ({
        ...prev,
        validationErrors: currentValidation.errors,
      }));
    }
  }, [wizardState.currentStep, wizardState.formData]);

  const previousStep = useCallback(() => {
    setWizardState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }));
  }, []);

  const goToStep = useCallback((step: number) => {
    // Allow going to any previous step or next step if current is valid
    if (step < wizardState.currentStep) {
      setCurrentStep(step);
    } else if (step > wizardState.currentStep) {
      const currentValidation = validateStep(wizardState.currentStep, wizardState.formData);
      if (currentValidation.isValid) {
        setCurrentStep(step);
      } else {
        setWizardState(prev => ({
          ...prev,
          validationErrors: currentValidation.errors,
        }));
      }
    }
  }, [wizardState.currentStep, wizardState.formData, setCurrentStep]);

  const validateCurrentStep = useCallback(() => {
    const validation = validateStep(wizardState.currentStep, wizardState.formData);
    setWizardState(prev => ({
      ...prev,
      validationErrors: validation.errors,
    }));
    return validation.isValid;
  }, [wizardState.currentStep, wizardState.formData]);

  const validateEntireForm = useCallback(() => {
    const validation = validateForm(wizardState.formData);
    setWizardState(prev => ({
      ...prev,
      validationErrors: validation.errors,
    }));
    return validation.isValid;
  }, [wizardState.formData]);

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setWizardState(prev => ({ ...prev, isSubmitting }));
  }, []);

  const setEditMode = useCallback((isEditMode: boolean, editingArticleId: number | null = null, isEditingDraft: boolean = false) => {
    setWizardState(prev => ({
      ...prev,
      isEditMode,
      editingArticleId,
      isEditingDraft,
    }));
  }, []);

  const loadFormData = useCallback((formData: Partial<ArticleForm>) => {
    setWizardState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...formData },
    }));
  }, []);

  const resetForm = useCallback(() => {
    setWizardState(initialWizardState);
    clearWizardState();
    setSteps(
      FORM_STEPS.map(step => ({
        ...step,
        isCompleted: false,
        isValid: false,
      }))
    );
  }, []);

  const clearValidationErrors = useCallback(() => {
    setWizardState(prev => ({ ...prev, validationErrors: {} }));
  }, []);

  const getFieldError = useCallback((fieldName: string): string[] => {
    return wizardState.validationErrors[fieldName] || [];
  }, [wizardState.validationErrors]);

  const hasFieldError = useCallback((fieldName: string): boolean => {
    return getFieldError(fieldName).length > 0;
  }, [getFieldError]);

  const isStepValid = useCallback((stepNumber: number): boolean => {
    return steps.find(step => step.id === stepNumber)?.isValid || false;
  }, [steps]);

  const isStepCompleted = useCallback((stepNumber: number): boolean => {
    return steps.find(step => step.id === stepNumber)?.isCompleted || false;
  }, [steps]);

  const canProceedToNext = useCallback((): boolean => {
    return isStepValid(wizardState.currentStep);
  }, [wizardState.currentStep, isStepValid]);

  const getProgressPercentage = useCallback((): number => {
    return (wizardState.currentStep / FORM_STEPS.length) * 100;
  }, [wizardState.currentStep]);

  return {
    // State
    wizardState,
    steps,
    currentStep: wizardState.currentStep,
    formData: wizardState.formData,
    validationErrors: wizardState.validationErrors,
    isSubmitting: wizardState.isSubmitting,
    isEditMode: wizardState.isEditMode,
    editingArticleId: wizardState.editingArticleId,
    isEditingDraft: wizardState.isEditingDraft,

    // Actions
    updateFormData,
    setCurrentStep,
    nextStep,
    previousStep,
    goToStep,
    setSubmitting,
    setEditMode,
    loadFormData,
    resetForm,
    clearValidationErrors,

    // Validation
    validateCurrentStep,
    validateEntireForm,
    getFieldError,
    hasFieldError,
    isStepValid,
    isStepCompleted,
    canProceedToNext,

    // Utilities
    getProgressPercentage,
  };
};
