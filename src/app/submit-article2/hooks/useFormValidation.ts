'use client';

import { useState, useCallback, useEffect } from 'react';
import { ArticleForm, FormValidation } from '../types/article.types';
import { validateField, validateStep, validateForm } from '../utils/validation';
import { DEBOUNCE_DELAY } from '../utils/constants';

export const useFormValidation = (formData: ArticleForm, currentStep: number) => {
  const [validationErrors, setValidationErrors] = useState<FormValidation>({});
  const [isValidating, setIsValidating] = useState(false);
  const [debouncedValidation, setDebouncedValidation] = useState<FormValidation>({});

  // Debounced validation for real-time feedback
  useEffect(() => {
    const timer = setTimeout(() => {
      const stepValidation = validateStep(currentStep, formData);
      setDebouncedValidation(stepValidation.errors);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [formData, currentStep]);

  const validateSingleField = useCallback((fieldName: string, value: any) => {
    const errors = validateField(fieldName, value, formData);
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: errors,
    }));
    return errors;
  }, [formData]);

  const validateCurrentStep = useCallback(() => {
    setIsValidating(true);
    const validation = validateStep(currentStep, formData);
    setValidationErrors(validation.errors);
    setIsValidating(false);
    return validation.isValid;
  }, [currentStep, formData]);

  const validateEntireForm = useCallback(() => {
    setIsValidating(true);
    const validation = validateForm(formData);
    setValidationErrors(validation.errors);
    setIsValidating(false);
    return validation.isValid;
  }, [formData]);

  const clearFieldErrors = useCallback((fieldName: string) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setValidationErrors({});
    setDebouncedValidation({});
  }, []);

  const getFieldErrors = useCallback((fieldName: string): string[] => {
    return validationErrors[fieldName] || [];
  }, [validationErrors]);

  const getDebouncedFieldErrors = useCallback((fieldName: string): string[] => {
    return debouncedValidation[fieldName] || [];
  }, [debouncedValidation]);

  const hasFieldErrors = useCallback((fieldName: string): boolean => {
    return getFieldErrors(fieldName).length > 0;
  }, [getFieldErrors]);

  const hasDebouncedFieldErrors = useCallback((fieldName: string): boolean => {
    return getDebouncedFieldErrors(fieldName).length > 0;
  }, [getDebouncedFieldErrors]);

  const getStepErrors = useCallback((stepNumber: number): string[] => {
    const stepValidation = validateStep(stepNumber, formData);
    return Object.values(stepValidation.errors).flat();
  }, [formData]);

  const isStepValid = useCallback((stepNumber: number): boolean => {
    const stepValidation = validateStep(stepNumber, formData);
    return stepValidation.isValid;
  }, [formData]);

  const isCurrentStepValid = useCallback((): boolean => {
    return isStepValid(currentStep);
  }, [currentStep, isStepValid]);

  const getErrorCount = useCallback((): number => {
    return Object.values(validationErrors).reduce((total, errors) => total + errors.length, 0);
  }, [validationErrors]);

  const getDebouncedErrorCount = useCallback((): number => {
    return Object.values(debouncedValidation).reduce((total, errors) => total + errors.length, 0);
  }, [debouncedValidation]);

  return {
    // State
    validationErrors,
    debouncedValidation,
    isValidating,

    // Validation methods
    validateField: validateSingleField,
    validateCurrentStep,
    validateEntireForm,

    // Error management
    clearFieldErrors,
    clearAllErrors,

    // Error getters
    getFieldErrors,
    getDebouncedFieldErrors,
    hasFieldErrors,
    hasDebouncedFieldErrors,
    getStepErrors,

    // Validation status
    isStepValid,
    isCurrentStepValid,
    getErrorCount,
    getDebouncedErrorCount,
  };
};
