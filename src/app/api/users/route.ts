import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { validateUsername, validatePassword, validateEmail, isValidRole } from '@/lib/security';

export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get('role');

  try {
    let sql = 'SELECT id, username, full_name, email, role, created_at FROM users';
    const params: any[] = [];

    if (role) {
      sql += ' WHERE role = ?';
      params.push(role);
    }

    sql += ' ORDER BY created_at DESC';
    
    const users = await query(sql, params);
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, full_name, email, password, role } = body;

    // Validate required fields
    if (!username || !full_name || !email || !password || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Validate username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return NextResponse.json({ error: usernameValidation.error }, { status: 400 });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 });
    }

    // Validate email
    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate role
    if (!isValidRole(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be: author, reviewer, editor, or administrator' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser: any = await query('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existingUser && existingUser.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO users (username, full_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`;
    const result: any = await query(sql, [username, full_name, email, hashedPassword, role]);
    
    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
