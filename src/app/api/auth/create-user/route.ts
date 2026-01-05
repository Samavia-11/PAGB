import { NextRequest, NextResponse } from 'next/server';
import { createUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, role, fatherName, cnic, contactNumber, qualification } = await request.json();

    if (!username || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Username, email, password, and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['author', 'reviewer', 'editor', 'administrator'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    const user = await createUserFromRequest({
      username,
      email,
      password,
      role,
      fatherName,
      cnic,
      contactNumber,
      qualification
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user account. Username might already exist.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Duplicate entry')) {
        return NextResponse.json(
          { error: 'Username or email already exists' },
          { status: 409 }
        );
      }
      if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
        return NextResponse.json(
          { error: 'Database connection failed. Please ensure MySQL is running.' },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create user account' },
      { status: 500 }
    );
  }
}
