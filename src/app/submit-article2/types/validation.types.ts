export interface ValidationRule {
  validate: (value: any, formData?: any) => boolean;
  message: string;
  level: 'error' | 'warning' | 'info';
}

export interface FieldValidation {
  [fieldName: string]: ValidationRule[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
}

export interface ValidationSchema {
  [step: number]: FieldValidation;
}

export type ValidationLevel = 'error' | 'warning' | 'info';
export type ValidationFunction = (value: any, formData?: any) => boolean;

export interface AsyncValidationRule extends ValidationRule {
  validate: (value: any, formData?: any) => Promise<boolean>;
}

export interface FieldConfig {
  name: string;
  label: string;
  required: boolean;
  validation: ValidationRule[];
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'file' | 'checkbox';
  options?: Array<{ value: string; label: string }>;
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
  description?: string;
}
