import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Mock users for testing (replace with database later)
const mockUsers = [
  {
    id: 1,
    username: 'author',
    email: 'author@journal.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: author123
    full_name: 'Author User',
    role: 'author',
  },
  {
    id: 2,
    username: 'reviewer',
    email: 'reviewer@journal.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: reviewer123
    full_name: 'Reviewer User',
    role: 'reviewer',
  },
  {
    id: 3,
    username: 'editor',
    email: 'editor@journal.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: editor123
    full_name: 'Editor User',
    role: 'editor',
  },
  {
    id: 4,
    username: 'administrator',
    email: 'admin@journal.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: admin123
    full_name: 'Administrator User',
    role: 'administrator',
  },
];

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

    // Find user in mock data
    const user = mockUsers.find(u => u.username === username);

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // For demo purposes, accept simple passwords
    const validPasswords = {
      'author': 'author123',
      'reviewer': 'reviewer123', 
      'editor': 'editor123',
      'administrator': 'admin123'
    };
    
    const isValidPassword = validPasswords[username as keyof typeof validPasswords] === password;

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
