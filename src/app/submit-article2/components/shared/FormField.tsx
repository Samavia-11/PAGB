'use client';

import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  value: string | number | boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  error?: string[];
  warning?: string[];
  required?: boolean;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox';
  options?: Array<{ value: string; label: string }>;
  maxLength?: number;
  minLength?: number;
  rows?: number;
  disabled?: boolean;
  description?: string;
  className?: string;
  showCharacterCount?: boolean;
  showWordCount?: boolean;
  children?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  error = [],
  warning = [],
  required = false,
  placeholder,
  type = 'text',
  options = [],
  maxLength,
  minLength,
  rows = 4,
  disabled = false,
  description,
  className = '',
  showCharacterCount = false,
  showWordCount = false,
  children,
}) => {
  const hasError = error.length > 0;
  const hasWarning = warning.length > 0;
  const fieldId = `field-${name}`;
  
  const characterCount = typeof value === 'string' ? value.length : 0;
  const wordCount = typeof value === 'string' ? value.trim().split(/\s+/).filter(word => word.length > 0).length : 0;

  const baseInputClasses = `
    w-full px-4 py-3 border-2 rounded-lg transition-all duration-200
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'}
    ${hasWarning ? 'border-yellow-500 bg-yellow-50' : ''}
    ${className}
  `;

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={fieldId}
            name={name}
            value={value as string}
            onChange={onChange}
            placeholder={placeholder}
            maxLength={maxLength}
            minLength={minLength}
            rows={rows}
            disabled={disabled}
            className={`${baseInputClasses} resize-none`}
            aria-describedby={`${fieldId}-description ${hasError ? `${fieldId}-error` : ''} ${hasWarning ? `${fieldId}-warning` : ''}`}
            aria-invalid={hasError}
            aria-required={required}
          />
        );

      case 'select':
        return (
          <select
            id={fieldId}
            name={name}
            value={value as string}
            onChange={onChange}
            disabled={disabled}
            className={`${baseInputClasses} text-gray-900`}
            aria-describedby={`${fieldId}-description ${hasError ? `${fieldId}-error` : ''} ${hasWarning ? `${fieldId}-warning` : ''}`}
            aria-invalid={hasError}
            aria-required={required}
          >
            <option value="">{placeholder || 'Select an option'}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              id={fieldId}
              name={name}
              type="checkbox"
              checked={Boolean(value)}
              onChange={onChange}
              disabled={disabled}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              aria-describedby={`${fieldId}-description ${hasError ? `${fieldId}-error` : ''} ${hasWarning ? `${fieldId}-warning` : ''}`}
              aria-invalid={hasError}
              aria-required={required}
            />
            {children ? (
              <div className="ml-3">{children}</div>
            ) : (
              <label htmlFor={fieldId} className="ml-3 text-sm font-medium text-gray-700">
                {label}
              </label>
            )}
          </div>
        );

      default:
        return (
          <input
            id={fieldId}
            name={name}
            type={type}
            value={value as string}
            onChange={onChange}
            placeholder={placeholder}
            maxLength={maxLength}
            minLength={minLength}
            disabled={disabled}
            className={baseInputClasses}
            aria-describedby={`${fieldId}-description ${hasError ? `${fieldId}-error` : ''} ${hasWarning ? `${fieldId}-warning` : ''}`}
            aria-invalid={hasError}
            aria-required={required}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {type !== 'checkbox' && (
        <label htmlFor={fieldId} className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}

      {description && (
        <div id={`${fieldId}-description`} className="text-sm text-gray-500">
          {description}
        </div>
      )}

      {renderInput()}

      {(showCharacterCount || showWordCount) && type === 'textarea' && (
        <div className="flex justify-between text-sm text-gray-500">
          {showCharacterCount && (
            <span>{characterCount}{maxLength ? `/${maxLength}` : ''} characters</span>
          )}
          {showWordCount && <span>{wordCount} words</span>}
        </div>
      )}

      {hasError && (
        <div id={`${fieldId}-error`} className="space-y-1" role="alert">
          {error.map((errorMessage, index) => (
            <p key={index} className="text-sm text-red-600 flex items-center">
              <span className="w-1 h-1 bg-red-600 rounded-full mr-2 flex-shrink-0" />
              {errorMessage}
            </p>
          ))}
        </div>
      )}

      {hasWarning && (
        <div id={`${fieldId}-warning`} className="space-y-1">
          {warning.map((warningMessage, index) => (
            <p key={index} className="text-sm text-yellow-600 flex items-center">
              <span className="w-1 h-1 bg-yellow-600 rounded-full mr-2 flex-shrink-0" />
              {warningMessage}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
