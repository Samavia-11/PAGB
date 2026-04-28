/**
 * Shared CSRF Token Management
 * Used by both middleware and API routes
 */

// Shared CSRF token store (in production, should use Redis or database)
export const csrfTokenStore = new Map<string, { token: string; expires: number }>();

export function generateCSRFToken(sessionId: string): string {
  const token = crypto.randomUUID() + '-' + Date.now().toString(36);
  csrfTokenStore.set(sessionId, { 
    token, 
    expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  });
  return token;
}

export function validateCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokenStore.get(sessionId);
  if (!stored) return false;
  if (Date.now() > stored.expires) {
    csrfTokenStore.delete(sessionId);
    return false;
  }
  return stored.token === token;
}

// Cleanup expired CSRF tokens every hour
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [sessionId, data] of csrfTokenStore.entries()) {
      if (now > data.expires) {
        csrfTokenStore.delete(sessionId);
      }
    }
  }, 60 * 60 * 1000); // 1 hour
}
