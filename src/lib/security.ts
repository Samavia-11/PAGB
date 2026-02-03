/**
 * Security utilities for input validation, sanitization, and authorization
 */

// HTML entity escaping to prevent XSS
export function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  return String(text).replace(/[&<>"'`=/]/g, (s) => map[s]);
}

// Allowed file types for uploads
export const ALLOWED_FILE_TYPES = {
  documents: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  images: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
  all: [] as string[], // Will be populated below
};
ALLOWED_FILE_TYPES.all = [...ALLOWED_FILE_TYPES.documents, ...ALLOWED_FILE_TYPES.images];

// Allowed file extensions
export const ALLOWED_EXTENSIONS = [
  '.pdf', '.docx',
  '.jpg', '.jpeg', '.png', '.gif', '.webp'
];

const getFileExtension = (fileName: string): string => {
  const lastDot = String(fileName || '').lastIndexOf('.');
  if (lastDot < 0) return '';
  return String(fileName).slice(lastDot).toLowerCase();
};

// Validate file type and extension
export function isAllowedFileType(
  file: File,
  options?: { allowedMimeTypes?: string[]; allowedExtensions?: string[] }
): { valid: boolean; error?: string } {
  const allowedMimeTypes = options?.allowedMimeTypes || ALLOWED_FILE_TYPES.all;
  const allowedExtensions = options?.allowedExtensions || ALLOWED_EXTENSIONS;

  const ext = getFileExtension(file?.name || '');
  const mime = String((file as any)?.type || '').toLowerCase();

  if (allowedExtensions.length > 0 && ext && !allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file extension. Allowed: ${allowedExtensions.join(', ')}`,
    };
  }

  if (allowedMimeTypes.length > 0 && mime && !allowedMimeTypes.includes(mime)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedExtensions.join(', ')}`,
    };
  }

  // If we can't determine mime/ext, fall back to extension check only
  if (!ext && mime && allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(mime)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedExtensions.join(', ')}`,
    };
  }

  return { valid: true };
}

// Maximum file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function isFileSizeValid(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
    };
  }
  return { valid: true };
}

// Validate that a value is a positive integer (for IDs)
export function isValidId(value: any): boolean {
  const num = parseInt(value);
  return !isNaN(num) && num > 0 && Number.isInteger(num);
}

// Sanitize filename for safe storage
export function sanitizeFileName(fileName: string): string {
  // Remove path traversal attempts and dangerous characters
  return fileName
    .replace(/\.\./g, '') // Remove path traversal
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_') // Remove dangerous chars
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255); // Limit length
}

// Input validation helpers
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export type ValidationResult = { valid: boolean; error?: string };

export function validateLettersAndSpaces(value: string, fieldLabel: string = 'Value'): ValidationResult {
  const v = String(value || '').trim();
  if (!v) return { valid: false, error: `${fieldLabel} is required` };
  if (!/^[A-Za-z ]+$/.test(v)) {
    return { valid: false, error: `${fieldLabel} can only contain letters and spaces` };
  }
  return { valid: true };
}

export function validateAlphanumericAndSpaces(value: string, fieldLabel: string = 'Value'): ValidationResult {
  const v = String(value || '').trim();
  if (!v) return { valid: false, error: `${fieldLabel} is required` };
  if (!/^[A-Za-z0-9 ]+$/.test(v)) {
    return { valid: false, error: `${fieldLabel} can only contain letters, numbers, and spaces` };
  }
  return { valid: true };
}

export function validateNoSpecialCharacters(value: string, fieldLabel: string = 'Value'): ValidationResult {
  const v = String(value || '').trim();
  if (!v) return { valid: false, error: `${fieldLabel} is required` };
  if (!/^[A-Za-z0-9\s]+$/.test(v)) {
    return { valid: false, error: `${fieldLabel} can only contain letters, numbers, and spaces` };
  }
  return { valid: true };
}

 export function validateMessageText(value: string, fieldLabel: string = 'Value'): ValidationResult {
   const v = String(value || '').trim();
   if (!v) return { valid: false, error: `${fieldLabel} is required` };
   if (!/^[A-Za-z0-9\s.,!?@()\-]+$/.test(v)) {
     return { valid: false, error: `${fieldLabel} must contain valid characters (letters, numbers, spaces, and basic punctuation only)` };
   }
   return { valid: true };
 }

export function normalizeDigits(value: string): string {
  return String(value || '').replace(/\D/g, '');
}

export function validateExactDigits(value: string, digitCount: number, fieldLabel: string = 'Value'): ValidationResult {
  const digits = normalizeDigits(value);
  if (!digits) return { valid: false, error: `${fieldLabel} is required` };
  if (digits.length !== digitCount) {
    return { valid: false, error: `${fieldLabel} must be exactly ${digitCount} digits` };
  }
  return { valid: true };
}

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username || username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }
  if (username.length > 50) {
    return { valid: false, error: 'Username must be less than 50 characters' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  const v = String(password || '');
  if (!v || v.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  if (v.length > 128) {
    return { valid: false, error: 'Password must be less than 128 characters' };
  }
  if (!/[A-Z]/.test(v)) {
    return { valid: false, error: 'Password must include at least 1 uppercase letter' };
  }
  if (!/[a-z]/.test(v)) {
    return { valid: false, error: 'Password must include at least 1 lowercase letter' };
  }
  if (!/\d/.test(v)) {
    return { valid: false, error: 'Password must include at least 1 digit' };
  }
  if (!/[^A-Za-z0-9]/.test(v)) {
    return { valid: false, error: 'Password must include at least 1 special character' };
  }
  return { valid: true };
}

// Role validation
export const VALID_ROLES = ['author', 'reviewer', 'editor', 'administrator'] as const;
export type UserRole = typeof VALID_ROLES[number];

export function isValidRole(role: string): role is UserRole {
  return VALID_ROLES.includes(role as UserRole);
}

// Authorization helper - checks if user can perform action on resource
export function canModifyArticle(userRole: string, userId: number, articleAuthorId: number): boolean {
  // Editors and administrators can modify any article
  if (userRole === 'editor' || userRole === 'administrator') {
    return true;
  }
  // Authors can only modify their own articles
  if (userRole === 'author' && userId === articleAuthorId) {
    return true;
  }
  return false;
}

export function canDeleteArticle(userRole: string, userId: number, articleAuthorId: number): boolean {
  // Only editors and administrators can delete articles
  if (userRole === 'editor' || userRole === 'administrator') {
    return true;
  }
  // Authors can delete their own draft articles
  if (userRole === 'author' && userId === articleAuthorId) {
    return true;
  }
  return false;
}

// Rate limiting helper (simple in-memory, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 100, 
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000);
