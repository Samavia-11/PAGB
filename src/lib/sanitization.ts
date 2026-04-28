/**
 * Security utilities for input sanitization and XSS prevention
 */

// HTML entity encoding for output
export function encodeHTML(str: string): string {
  if (typeof str !== 'string') return '';
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Sanitize text content (allow only safe characters)
export function sanitizeText(str: string): string {
  if (typeof str !== 'string') return '';
  
  // Remove potentially dangerous characters while preserving basic text
  return str.replace(/[<>\"'&]/g, '');
}

// Sanitize for display in HTML attributes
export function sanitizeAttribute(str: string): string {
  if (typeof str !== 'string') return '';
  
  return str.replace(/["'&<>=]/g, '');
}

// Sanitize URLs (allow only http, https, mailto protocols)
export function sanitizeURL(url: string): string {
  if (typeof url !== 'string') return '';
  
  try {
    const parsed = new URL(url, window.location.origin);
    
    // Allow only safe protocols
    const allowedProtocols = ['http:', 'https:', 'mailto:'];
    if (!allowedProtocols.includes(parsed.protocol)) {
      return '';
    }
    
    return parsed.toString();
  } catch {
    return '';
  }
}

// Validate and sanitize email addresses
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  
  // Basic email pattern validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return '';
  }
  
  return email.toLowerCase().trim();
}

// Sanitize names and general text fields
export function sanitizeName(name: string): string {
  if (typeof name !== 'string') return '';
  
  // Allow letters, numbers, spaces, hyphens, apostrophes, and periods
  return name.replace(/[^a-zA-Z0-9\s\-'\.]/g, '').trim();
}

// Sanitize specialization/skill names
export function sanitizeSpecialization(spec: string): string {
  if (typeof spec !== 'string') return '';
  
  // Allow letters, numbers, spaces, and common punctuation
  return spec.replace(/[^a-zA-Z0-9\s\-\(\)\[\]\{\}\.,&]/g, '').trim();
}

// Sanitize bio/description text (allow more characters but still safe)
export function sanitizeBio(bio: string): string {
  if (typeof bio !== 'string') return '';
  
  // Remove script tags and event handlers
  let sanitized = bio.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  // Remove dangerous HTML tags
  const dangerousTags = ['iframe', 'object', 'embed', 'form', 'input', 'button', 'link', 'meta'];
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}\\b[^>]*>.*?<\\/${tag}>`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  return sanitized.trim();
}

// XSS-safe React component for rendering HTML content
// Note: This should be used as a React component in a .tsx file
export const SafeHTMLRenderer = ({ content, className = '' }: { content: string; className?: string }) => {
  const sanitizedContent = encodeHTML(content);
  
  return {
    type: 'div',
    props: {
      className,
      dangerouslySetInnerHTML: { __html: sanitizedContent }
    }
  };
};

// Validate and sanitize search terms
export function sanitizeSearchTerm(term: string): string {
  if (typeof term !== 'string') return '';
  
  // Allow letters, numbers, spaces, and basic search characters
  return term.replace(/[^a-zA-Z0-9\s\-\.\,\?\*]/g, '').trim();
}

// Rate limiting for search/filter operations
export function createSearchThrottle(delay = 300) {
  let timeoutId: NodeJS.Timeout;
  
  return function<T extends (...args: any[]) => any>(func: T): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };
}

// Content Security Policy nonce generator
export function generateCSPNonce(): string {
  return btoa(crypto.getRandomValues(new Uint8Array(16)).toString()).replace(/[^a-zA-Z0-9]/g, '');
}

// Validate file upload types
export function validateFileType(filename: string, allowedTypes: string[]): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
}

// Sanitize file names
export function sanitizeFileName(filename: string): string {
  if (typeof filename !== 'string') return '';
  
  // Remove path traversal attempts and dangerous characters
  return filename
    .replace(/\.\./g, '')
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/^\.+/, '')
    .trim();
}
