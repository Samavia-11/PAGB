import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, fullName, fatherName, cnic, contactNumber, qualification, role } = body;

    // Validation
    if (!username || !password || !fullName || !role) {
      return NextResponse.json(
        { message: 'Username, password, full name, and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['author', 'reviewer'].includes(role)) {
      return NextResponse.json(
        { message: 'Role must be either author or reviewer' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate email from username
    const email = `${username}@pagb.com`;

    // Check if username already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    ) as any[];

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: 'Username or email already exists' },
        { status: 409 }
      );
    }

    // Insert user into database
    const result = await query(
      'INSERT INTO users (username, email, password, full_name, role, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [username, email, hashedPassword, fullName, role]
    ) as any;

    // Create user data for response
    const userData = {
      id: result.insertId,
      username,
      email,
      fullName,
      role,
    };

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: userData,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    
    // Handle specific database errors
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { message: 'Username or email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
