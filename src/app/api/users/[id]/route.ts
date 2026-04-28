import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { validateUsername, validateEmail, isValidRole, validatePassword } from '@/lib/security';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const id = parseInt(idParam);
    
    const sql = 'SELECT id, username, full_name, email, role, created_at FROM users WHERE id = ?';
    const users: any = await query(sql, [id]);
    
    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ user: users[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const id = parseInt(idParam);
    const body = await request.json();
    const { username, full_name, email, password, role } = body;

    // Validate required fields
    if (!username || !full_name || !email || !role) {
      return NextResponse.json({ error: 'Username, full name, email, and role are required' }, { status: 400 });
    }

    // Validate username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return NextResponse.json({ error: usernameValidation.error }, { status: 400 });
    }

    // Validate email
    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate role
    if (!isValidRole(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be: author, reviewer, editor, or administrator' }, { status: 400 });
    }

    // Check if user exists
    const existingUser: any = await query('SELECT id FROM users WHERE id = ?', [id]);
    if (!existingUser || existingUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if username or email is already taken by another user
    const duplicateUser: any = await query('SELECT id FROM users WHERE (email = ? OR username = ?) AND id != ?', [email, username, id]);
    if (duplicateUser && duplicateUser.length > 0) {
      return NextResponse.json({ error: 'Username or email already exists' }, { status: 400 });
    }

    let sql, params;
    if (password && password.trim() !== '') {
      // Validate password if provided
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return NextResponse.json({ error: passwordValidation.error }, { status: 400 });
      }
      
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(password, 10);
      sql = `UPDATE users SET username = ?, full_name = ?, email = ?, password_hash = ?, role = ? WHERE id = ?`;
      params = [username, full_name, email, hashedPassword, role, id];
    } else {
      sql = `UPDATE users SET username = ?, full_name = ?, email = ?, role = ? WHERE id = ?`;
      params = [username, full_name, email, role, id];
    }

    await query(sql, params);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const id = parseInt(idParam);

    // Check if user exists
    const existingUser: any = await query('SELECT id FROM users WHERE id = ?', [id]);
    if (!existingUser || existingUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete the user
    await query('DELETE FROM users WHERE id = ?', [id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

