/**
 * Validation utilities for form inputs
 */

// Sanitize text to allow only letters, numbers, spaces, and basic punctuation
export const sanitizeText = (value: string) => 
  String(value || '').replace(/[^A-Za-z0-9\s.,!?@()\-]/g, '');

// Sanitize multiline text (preserves newlines)
export const sanitizeMultilineText = (value: string) => 
  String(value || '').replace(/[^A-Za-z0-9\s.,!?@()\r\n-]/g, '');

// Sanitize alphanumeric with spaces only (no punctuation)
export const sanitizeAlphanumericSpaces = (value: string) => 
  String(value || '').replace(/[^A-Za-z0-9\s]/g, '');

// Sanitize letters and spaces only
export const sanitizeLettersSpaces = (value: string) => 
  String(value || '').replace(/[^A-Za-z\s]/g, '');

// Validate if text contains only allowed characters
export const isValidText = (value: string) => 
  /^[A-Za-z0-9\s.,!?@()\-]*$/.test(String(value || ''));

// Validate if multiline text contains only allowed characters
export const isValidMultilineText = (value: string) => 
  /^[A-Za-z0-9\s.,!?@()\r\n-]*$/.test(String(value || ''));

// Get validation error message
export const getValidationError = (value: string, fieldName: string = 'Field') => {
  if (!value.trim()) return `${fieldName} cannot be empty`;
  
  const sanitized = sanitizeText(value);
  if (!sanitized.trim()) {
    return `${fieldName} must contain valid characters (letters, numbers, and basic punctuation only)`;
  }
  
  return null;
};
