'use client';

import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { FORM_STEPS } from '../../utils/constants';

interface StepIndicatorProps {
  currentStep: number;
  completedSteps: number[];
  onStepClick: (step: number) => void;
  disabled?: boolean;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  completedSteps,
  onStepClick,
  disabled = false,
}) => {
  return (
    <div className="mb-8">
      {/* Mobile: Compact View */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">
            Step {currentStep} of {FORM_STEPS.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((currentStep / FORM_STEPS.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / FORM_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: Full View */}
      <div className="hidden md:block">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {FORM_STEPS.map((step, index) => {
              const stepNumber = index + 1;
              const isCurrent = stepNumber === currentStep;
              const isCompleted = completedSteps.includes(stepNumber);
              const isUpcoming = stepNumber > currentStep;

              return (
                <li key={step.id} className="flex-1 relative">
                  {/* Connector Line */}
                  {index < FORM_STEPS.length - 1 && (
                    <div
                      className={`
                        absolute top-5 left-8 w-full h-0.5
                        ${isCompleted ? 'bg-blue-600' : 'bg-gray-200'}
                      `}
                      aria-hidden="true"
                    />
                  )}

                  {/* Step Circle */}
                  <div className="relative flex items-center">
                    <button
                      type="button"
                      onClick={() => onStepClick(stepNumber)}
                      disabled={disabled || isUpcoming}
                      className={`
                        relative w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm
                        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                        ${isCurrent 
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                          : isCompleted 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-gray-200 text-gray-500'
                        }
                        ${isUpcoming ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105'}
                      `}
                      aria-label={`Go to step ${stepNumber}: ${step.title}`}
                      aria-current={isCurrent ? 'step' : undefined}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span>{stepNumber}</span>
                      )}
                    </button>

                    {/* Step Title */}
                    <div className="ml-4 min-w-0 flex-1">
                      <p className={`
                        text-sm font-medium
                        ${isCurrent 
                          ? 'text-blue-600' 
                          : isCompleted 
                            ? 'text-gray-900' 
                            : 'text-gray-500'
                        }
                      `}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 hidden lg:block">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
};
