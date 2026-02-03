import { ValidationRule, ValidationResult } from '../types/validation.types';
import { ArticleForm, AuthorEntry } from '../types/article.types';
import { VALIDATION_MESSAGES, MAX_ABSTRACT_WORDS, MAX_TITLE_CHARS } from './constants';

const digitsOnly = (value: string): string => String(value || '').replace(/\D/g, '');
const isLettersAndSpaces = (value: string): boolean => /^[A-Za-z\s]+$/.test(String(value || '').trim());
const isAlnumAndSpaces = (value: string): boolean => /^[A-Za-z0-9\s]+$/.test(String(value || '').trim());
const isNoSpecialCharsMultiline = (value: string): boolean => {
  const v = String(value || '');
  if (!v.trim()) return false;
  return /^[A-Za-z0-9\s\r\n]+$/.test(v);
};
const isExactly11Digits = (value: string): boolean => digitsOnly(value).length === 11;

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const validateTitle = (title: string): boolean => {
  const v = String(title || '').trim();
  if (!v) return true;
  return v.length <= MAX_TITLE_CHARS;
};

export const validateAbstract = (abstract: string): boolean => {
  const v = String(abstract || '').trim();
  if (!v) return true;
  const wordCount = v.split(/\s+/).filter(word => word.length > 0).length;
  return wordCount <= MAX_ABSTRACT_WORDS;
};

export const validateAuthors = (authors: AuthorEntry[]): boolean => {
  if (authors.length === 0) return false;
  
  const hasMainAuthor = authors.some(author => 
    author.role === 'Main Author' && 
    author.name.trim() && 
    author.email.trim() && 
    validateEmail(author.email) &&
    author.contact?.trim() &&
    isLettersAndSpaces(author.name) &&
    isExactly11Digits(author.contact || '')
  );
  
  const allAuthorsValid = authors.every(author => 
    author.name.trim() && 
    author.email.trim() && 
    validateEmail(author.email) &&
    isLettersAndSpaces(author.name) &&
    (!author.contact?.trim() || isExactly11Digits(author.contact || '')) &&
    (author.role !== 'Main Author' || Boolean(author.contact?.trim()))
  );
  
  return hasMainAuthor && allAuthorsValid;
};

export const validateKeywords = (keywords: string): boolean => {
  const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k);
  if (keywordArray.length < 3 || keywordArray.length > 10) return false;
  return keywordArray.every(k => isNoSpecialCharsMultiline(k));
};

export const validateKeywordsNoSpecialChars = (keywords: string): boolean => {
  const keywordArray = String(keywords || '').split(',').map(k => k.trim()).filter(k => k);
  if (keywordArray.length === 0) return true;
  return keywordArray.every(k => isNoSpecialCharsMultiline(k));
};

export const validateAffiliation = (affiliation: string): boolean => {
  const v = String(affiliation || '').trim();
  if (!v) return true;
  return isLettersAndSpaces(v);
};

export const validateNoSpecialChars = (value: string): boolean => {
  const v = String(value || '');
  if (!v.trim()) return true;
  return isNoSpecialCharsMultiline(v);
};

export const validateFile = (file: File | null): boolean => {
  if (!file) return false;
  // Guard against values coming back from localStorage (e.g. {}), or any non-File.
  // A real File should always have a name (string) and size (number).
  const maybeAny = file as any;
  if (typeof maybeAny?.name !== 'string' || typeof maybeAny?.size !== 'number') return false;

  const validTypes = ['.doc', '.docx'];
  const fileExtension = '.' + maybeAny.name.split('.').pop()?.toLowerCase();
  const isValidType = validTypes.includes(fileExtension);
  const isValidSize = maybeAny.size <= 10 * 1024 * 1024; // 10MB

  return isValidType && isValidSize;
};

export const validationRules: Record<string, ValidationRule[]> = {
  title: [
    {
      validate: (value: string) => value.trim().length > 0,
      message: VALIDATION_MESSAGES.REQUIRED,
      level: 'error'
    },
    {
      validate: (value: string) => validateTitle(value),
      message: VALIDATION_MESSAGES.TITLE_TOO_LONG,
      level: 'error'
    },
    {
      validate: (value: string) => (String(value || '').trim() ? isAlnumAndSpaces(value) : true),
      message: VALIDATION_MESSAGES.TITLE_ALNUM_ONLY,
      level: 'error'
    }
  ],
  articleType: [
    {
      validate: (value: string) => value.trim().length > 0,
      message: VALIDATION_MESSAGES.REQUIRED,
      level: 'error'
    }
  ],
  authors: [
    {
      validate: (authors: AuthorEntry[]) => validateAuthors(authors),
      message: VALIDATION_MESSAGES.MAIN_AUTHOR_REQUIRED,
      level: 'error'
    }
  ],
  affiliation: [
    {
      validate: (value: string) => validateAffiliation(value),
      message: VALIDATION_MESSAGES.NAME_TEXT_ONLY,
      level: 'error'
    },
    {
      validate: (value: string) => value.trim().length > 0,
      message: VALIDATION_MESSAGES.REQUIRED,
      level: 'error'
    }
  ],
  abstract: [
    {
      validate: (value: string) => value.trim().length > 0,
      message: VALIDATION_MESSAGES.REQUIRED,
      level: 'error'
    },
    {
      validate: (value: string) => validateAbstract(value),
      message: VALIDATION_MESSAGES.ABSTRACT_TOO_LONG,
      level: 'error'
    },
    {
      validate: (value: string) => validateNoSpecialChars(value),
      message: VALIDATION_MESSAGES.NO_SPECIAL_CHARS,
      level: 'error'
    }
  ],
  keywords: [
    {
      validate: (value: string) => validateKeywords(value),
      message: VALIDATION_MESSAGES.KEYWORDS_REQUIRED,
      level: 'error'
    },
    {
      validate: (value: string) => validateKeywordsNoSpecialChars(value),
      message: VALIDATION_MESSAGES.NO_SPECIAL_CHARS,
      level: 'error'
    }
  ],
  coverLetter: [
    {
      validate: (value: string) => validateNoSpecialChars(value),
      message: VALIDATION_MESSAGES.NO_SPECIAL_CHARS,
      level: 'error'
    }
  ],
  conflicts: [
    {
      validate: (value: string) => validateNoSpecialChars(value),
      message: VALIDATION_MESSAGES.NO_SPECIAL_CHARS,
      level: 'error'
    }
  ],
  funding: [
    {
      validate: (value: string) => validateNoSpecialChars(value),
      message: VALIDATION_MESSAGES.NO_SPECIAL_CHARS,
      level: 'error'
    }
  ],
  manuscriptFile: [
    {
      validate: (file: File | null) => validateFile(file),
      message: VALIDATION_MESSAGES.REQUIRED,
      level: 'error'
    }
  ],
  licenseAgreement: [
    {
      validate: (value: boolean) => value === true,
      message: VALIDATION_MESSAGES.LICENSE_REQUIRED,
      level: 'error'
    }
  ]
};

export const validateField = (fieldName: string, value: any, formData?: ArticleForm): string[] => {
  const rules = validationRules[fieldName as keyof typeof validationRules];
  if (!rules) return [];
  
  const errors: string[] = [];
  
  for (const rule of rules) {
    try {
      const isValid = rule.validate(value, formData);
      if (!isValid) {
        errors.push(rule.message);
      }
    } catch (error) {
      console.error(`Validation error for field ${fieldName}:`, error);
    }
  }
  
  return errors;
};

export const validateStep = (stepNumber: number, formData: ArticleForm): ValidationResult => {
  const stepFields = getStepFields(stepNumber);
  const errors: Record<string, string[]> = {};
  const warnings: Record<string, string[]> = {};
  
  for (const field of stepFields) {
    const fieldErrors = validateField(field, formData[field as keyof ArticleForm], formData);
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
};

export const validateForm = (formData: ArticleForm): ValidationResult => {
  const errors: Record<string, string[]> = {};
  const warnings: Record<string, string[]> = {};
  
  // Validate all fields
  for (const fieldName of Object.keys(formData)) {
    const fieldErrors = validateField(fieldName, formData[fieldName as keyof ArticleForm], formData);
    if (fieldErrors.length > 0) {
      errors[fieldName] = fieldErrors;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
};

const getStepFields = (stepNumber: number): string[] => {
  const stepFields: Record<number, string[]> = {
    1: ['title', 'articleType'],
    2: ['authors', 'affiliation'],
    3: ['abstract', 'keywords', 'manuscriptFile'],
    4: ['coverLetter', 'conflicts', 'funding', 'ethics', 'licenseAgreement']
  };
  
  return stepFields[stepNumber] || [];
};

export const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

export const countCharacters = (text: string): number => {
  return text.length;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
