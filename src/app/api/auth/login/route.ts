import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find user in database
    console.log('Looking for user:', username);
    const userResult: any = await query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );
    console.log('User query result:', userResult);

    if (!userResult || userResult.length === 0) {
      console.log('User not found in database');
      return NextResponse.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const user = userResult[0];
    console.log('Found user:', { id: user.id, username: user.username, role: user.role });

    // Check password
    let isValidPassword = false;
    
    if (user.password) {
      // If password is hashed, use bcrypt
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        isValidPassword = await bcrypt.compare(password, user.password);
      } else {
        // If password is plain text (for testing), compare directly
        isValidPassword = user.password === password;
      }
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Return user data (excluding password)
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    };

    return NextResponse.json(
      {
        message: 'Login successful',
        user: userData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
