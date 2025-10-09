import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

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

    // For demo purposes, simulate successful registration
    // In a real app, you would save to database here
    console.log('New user registration:', {
      username,
      fullName,
      fatherName,
      cnic,
      contactNumber,
      qualification,
      role
    });

    // Create user data
    const userData = {
      id: Math.floor(Math.random() * 1000) + 100, // Mock ID
      username,
      email: `${username}@pagb.com`, // Mock email
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
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
