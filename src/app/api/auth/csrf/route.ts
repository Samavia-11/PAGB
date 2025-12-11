/**
 * CSRF Token Endpoint
 * Generates and returns a CSRF token for the current session
 */

import { NextRequest, NextResponse } from 'next/server';

// CSRF token store (shared with middleware - in production use Redis)
const csrfTokenStore = new Map<string, { token: string; expires: number }>();

function generateCSRFToken(sessionId: string): string {
  const token = crypto.randomUUID() + '-' + Date.now().toString(36);
  csrfTokenStore.set(sessionId, { 
    token, 
    expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  });
  return token;
}

export async function GET(request: NextRequest) {
  // Get session ID from headers (set by middleware)
  const sessionId = request.headers.get('x-session-id');
  
  if (!sessionId) {
    return NextResponse.json(
      { error: 'No active session. Please log in first.' },
      { status: 401 }
    );
  }

  const token = generateCSRFToken(sessionId);

  return NextResponse.json({
    csrfToken: token,
    expiresIn: '24h'
  });
}

// Export for use in middleware
export { csrfTokenStore, generateCSRFToken };
