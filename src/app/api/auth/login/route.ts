import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { query } from '@/lib/db';
import { checkRateLimit } from '@/lib/security';

// JWT Secret - MUST be set in environment variables in production
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'CHANGE_THIS_SECRET_IN_PRODUCTION_MIN_32_CHARS!'
);

// CSRF token store for generating tokens on login
const csrfTokenStore = new Map<string, { token: string; expires: number }>();

function generateCSRFToken(sessionId: string): string {
  const token = crypto.randomUUID() + '-' + Date.now().toString(36);
  csrfTokenStore.set(sessionId, { 
    token, 
    expires: Date.now() + 24 * 60 * 60 * 1000
  });
  return token;
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting login attempts
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || request.headers.get('x-real-ip') 
      || 'unknown';

    const enforceRateLimit = process.env.NODE_ENV === 'production';
    // Stricter rate limit for login: 10 attempts per 15 minutes
    if (enforceRateLimit) {
      const rateLimit = checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { success: false, error: 'Too many login attempts. Please try again later.' },
          { status: 429 }
        );
      }
    }

    const body = await request.json();
    const { username, password } = body;

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Sanitize username input
    if (typeof username !== 'string' || username.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Invalid username format' },
        { status: 400 }
      );
    }

    // Find user in database
    const userResult: any = await query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (!userResult || userResult.length === 0) {
      // Use same error message to prevent user enumeration
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const user = userResult[0];

    // Check password - ONLY allow hashed passwords
    let isValidPassword = false;
    
    if (user.password) {
      // Only accept bcrypt hashed passwords
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        isValidPassword = await bcrypt.compare(password, user.password);
      } else {
        // Reject plaintext passwords - this is a security risk
        console.error(`SECURITY WARNING: User ${user.id} has unhashed password. Run password migration.`);
        return NextResponse.json(
          { success: false, error: 'Account requires password reset. Please contact administrator.' },
          { status: 401 }
        );
      }
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Generate session ID and JWT token
    const sessionId = crypto.randomUUID();
    
    const token = await new SignJWT({
      userId: user.id,
      username: user.username,
      role: user.role,
      fullName: user.full_name,
      sessionId: sessionId,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    // Generate CSRF token for this session
    const csrfToken = generateCSRFToken(sessionId);

    // Return user data with tokens
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    };

    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: userData,
        token: token,
        csrfToken: csrfToken,
      },
      { status: 200 }
    );

    // Set HTTP-only cookie for the auth token (more secure than localStorage)
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export CSRF store for middleware
export { csrfTokenStore };
