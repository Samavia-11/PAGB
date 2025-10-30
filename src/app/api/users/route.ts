import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

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

    // Check if user already exists
    const existingUser: any = await query('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existingUser && existingUser.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const sql = `INSERT INTO users (username, full_name, email, password, role) VALUES (?, ?, ?, ?, ?)`;
    const result: any = await query(sql, [username, full_name, email, password, role]);
    
    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
