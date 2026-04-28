import DOMPurify from 'isomorphic-dompurify';

/**
 * Security: Sanitize user-provided content to prevent XSS attacks
 * Uses isomorphic-dompurify for server-side and client-side compatibility
 */

// Default configuration for content sanitization
const DEFAULT_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 'i', 'b',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a', 'img',
    'blockquote', 'code', 'pre'
  ],
  ALLOWED_ATTR: [
    'href', 'title', 'alt', 'src', 'class', 'id'
  ],
  ALLOW_DATA_ATTR: false
};

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param content - The content to sanitize
 * @param config - Optional custom sanitization configuration
 * @returns Sanitized content safe for rendering
 */
export function sanitizeHtml(content: string, config = DEFAULT_CONFIG): string {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  return DOMPurify.sanitize(content, config);
}

/**
 * Sanitize plain text content (removes all HTML tags)
 * @param content - The text content to sanitize
 * @returns Sanitized plain text
 */
export function sanitizeText(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  return DOMPurify.sanitize(content, { ALLOWED_TAGS: [] });
}

/**
 * Sanitize user input for form fields (strict sanitization)
 * @param content - The user input to sanitize
 * @returns Sanitized input safe for form display
 */
export function sanitizeInput(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  // Remove all HTML tags and escape special characters
  return DOMPurify.sanitize(content, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
}

/**
 * Sanitize message content for chat/messaging systems
 * @param content - The message content to sanitize
 * @returns Sanitized message content
 */
export function sanitizeMessage(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  // Allow basic formatting for messages but prevent XSS
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
    ALLOWED_ATTR: []
  });
}

export default {
  sanitizeHtml,
  sanitizeText,
  sanitizeInput,
  sanitizeMessage
};
