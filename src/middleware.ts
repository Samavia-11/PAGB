/**
 * Global Security Middleware
 * Handles: Authentication, Authorization, Rate Limiting, CSRF Protection
 * 
 * @security This middleware runs on every request to /api/* routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

// ============================================================================
// CONFIGURATION
// ============================================================================

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'CHANGE_THIS_SECRET_IN_PRODUCTION_MIN_32_CHARS!'
);

const CSRF_SECRET = process.env.CSRF_SECRET || 'CHANGE_THIS_CSRF_SECRET_IN_PRODUCTION!';

// Rate limiting configuration: 100 requests per 10 minutes per IP
const RATE_LIMIT_MAX = 100;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/list-pdfs',
  '/api/list-author-pdfs',
  '/api/random-articles',
  '/api/archives-all',
  '/api/policies',
  '/api/policies-content',
  '/api/site-stats',
];

// Routes that don't require CSRF validation (read-only)
const CSRF_EXEMPT_ROUTES = [
  '/api/auth/login',
  '/api/auth/signup',
];

// ============================================================================
// RATE LIMITING (In-Memory - Use Redis in production)
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockExpires: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every minute
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime && now > entry.blockExpires) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000);
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  // Check if IP is blocked
  if (entry?.blocked && now < entry.blockExpires) {
    return { 
      allowed: false, 
      remaining: 0, 
      retryAfter: Math.ceil((entry.blockExpires - now) / 1000) 
    };
  }

  // Reset if window expired
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(ip, { 
      count: 1, 
      resetTime: now + RATE_LIMIT_WINDOW_MS,
      blocked: false,
      blockExpires: 0
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  // Increment count
  entry.count++;

  // Check if limit exceeded
  if (entry.count > RATE_LIMIT_MAX) {
    // Block for 15 minutes on abuse
    entry.blocked = true;
    entry.blockExpires = now + 15 * 60 * 1000;
    return { 
      allowed: false, 
      remaining: 0, 
      retryAfter: 900 // 15 minutes
    };
  }

  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

// ============================================================================
// CSRF TOKEN MANAGEMENT
// ============================================================================

const csrfTokenStore = new Map<string, { token: string; expires: number }>();

function generateCSRFToken(sessionId: string): string {
  const token = crypto.randomUUID() + '-' + Date.now().toString(36);
  csrfTokenStore.set(sessionId, { 
    token, 
    expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  });
  return token;
}

function validateCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokenStore.get(sessionId);
  if (!stored) return false;
  if (Date.now() > stored.expires) {
    csrfTokenStore.delete(sessionId);
    return false;
  }
  return stored.token === token;
}

// Cleanup expired CSRF tokens
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of csrfTokenStore.entries()) {
      if (now > entry.expires) {
        csrfTokenStore.delete(key);
      }
    }
  }, 60000);
}

// ============================================================================
// JWT UTILITIES
// ============================================================================

export interface JWTPayload {
  userId: number;
  username: string;
  role: string;
  fullName: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export async function createJWT(payload: Omit<JWTPayload, 'iat' | 'exp' | 'sessionId'>): Promise<string> {
  const sessionId = crypto.randomUUID();
  return new SignJWT({ ...payload, sessionId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// ============================================================================
// MIDDLEWARE FUNCTION
// ============================================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only apply to API routes
  if (!pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip') 
    || 'unknown';

  // ========== RATE LIMITING ==========
  const rateLimit = checkRateLimit(ip);
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { 
        error: 'Too many requests. Please try again later.',
        retryAfter: rateLimit.retryAfter 
      },
      { 
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfter || 60),
          'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
          'X-RateLimit-Remaining': '0',
        }
      }
    );
  }

  // ========== PUBLIC ROUTES (No Auth Required) ==========
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  const isGetRequest = request.method === 'GET';

  // For public GET routes, allow without authentication
  if (isPublicRoute && isGetRequest) {
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
    return response;
  }

  // ========== AUTHENTICATION ==========
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  // Also check for token in cookies (for browser requests)
  const cookieToken = request.cookies.get('auth-token')?.value;
  const finalToken = token || cookieToken;

  let user: JWTPayload | null = null;

  if (finalToken) {
    user = await verifyJWT(finalToken);
  }

  // For non-public routes, require authentication
  if (!isPublicRoute && !user) {
    // Allow login and signup without auth
    if (pathname === '/api/auth/login' || pathname === '/api/auth/signup') {
      // Continue to CSRF check for POST
    } else {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }
  }

  // ========== CSRF PROTECTION ==========
  const isStateChangingMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
  const isCSRFExempt = CSRF_EXEMPT_ROUTES.some(route => pathname.startsWith(route));

  if (isStateChangingMethod && !isCSRFExempt && user) {
    const csrfToken = request.headers.get('x-csrf-token');
    
    if (!csrfToken || !validateCSRFToken(user.sessionId, csrfToken)) {
      return NextResponse.json(
        { error: 'Invalid or missing CSRF token.' },
        { status: 403 }
      );
    }
  }

  // ========== INJECT USER INFO INTO REQUEST HEADERS ==========
  const requestHeaders = new Headers(request.headers);
  
  if (user) {
    requestHeaders.set('x-user-id', String(user.userId));
    requestHeaders.set('x-user-role', user.role);
    requestHeaders.set('x-user-name', user.fullName || user.username);
    requestHeaders.set('x-session-id', user.sessionId);
  }

  // Add security headers
  requestHeaders.set('X-Content-Type-Options', 'nosniff');
  requestHeaders.set('X-Frame-Options', 'DENY');
  requestHeaders.set('X-XSS-Protection', '1; mode=block');

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Add rate limit headers to response
  response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX));
  response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));

  return response;
}

// ============================================================================
// MIDDLEWARE CONFIG
// ============================================================================

export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
  ],
};
