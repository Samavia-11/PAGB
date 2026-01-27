'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Save, Send, X } from 'lucide-react';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  canGoBack: boolean;
  canGoNext: boolean;
  isSubmitting: boolean;
  isLastStep: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  disabled?: boolean;
  saveDraftText?: string;
  submitText?: string;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  canGoBack,
  canGoNext,
  isSubmitting,
  isLastStep,
  onPrevious,
  onNext,
  onSaveDraft,
  onSubmit,
  onCancel,
  disabled = false,
  saveDraftText = 'Save Draft',
  submitText = 'Submit Article',
}) => {
  return (
    <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        {/* Left side - Previous and Cancel */}
        <div className="flex items-center space-x-3">
          {canGoBack && (
            <button
              type="button"
              onClick={onPrevious}
              disabled={disabled || isSubmitting}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
          )}
          
          <button
            type="button"
            onClick={onCancel}
            disabled={disabled || isSubmitting}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </button>
        </div>

        {/* Center - Save Draft */}
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={disabled || isSubmitting}
          className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>{saveDraftText}</span>
        </button>

        {/* Right side - Next/Submit */}
        <div className="flex items-center space-x-3">
          {!isLastStep ? (
            <button
              type="button"
              onClick={onNext}
              disabled={disabled || isSubmitting || !canGoNext}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={disabled || isSubmitting || !canGoNext}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>{submitText}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Progress indicator for mobile */}
      <div className="mt-4 sm:hidden">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
          <div
            className="bg-blue-600 h-1 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <span className="hidden sm:inline">Keyboard shortcuts: </span>
        <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl+S</kbd> to save draft
        {!isLastStep && (
          <>
            <span className="mx-2">•</span>
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd> to continue
          </>
        )}
      </div>
    </div>
  );
};
