/**
 * CSRF Token Endpoint
 * Generates and returns a CSRF token for the current session
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCSRFToken } from '@/lib/csrf';

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
