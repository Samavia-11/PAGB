import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/database';
import mysql from 'mysql2/promise';
import {
  validateLettersAndSpaces,
  validateAlphanumericAndSpaces,
  validateExactDigits,
  normalizeDigits,
  validatePassword,
} from '@/lib/security';

export async function POST(request: NextRequest) {
  let connection: mysql.Connection | null = null;
  
  try {
    const body = await request.json();
    const { username, email, password, fullName, role, phone, qualification, specialization } = body;

    // Validate required fields
    if (!username || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['author', 'reviewer', 'editor', 'administrator'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(String(password));
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error || 'Invalid password' },
        { status: 400 }
      );
    }

    if (String(fullName || '').trim()) {
      const v = validateLettersAndSpaces(String(fullName), 'Full name');
      if (!v.valid) return NextResponse.json({ error: v.error || 'Invalid full name' }, { status: 400 });
    }
    if (String(phone || '').trim()) {
      const v = validateExactDigits(String(phone), 11, 'Contact number');
      if (!v.valid) return NextResponse.json({ error: v.error || 'Invalid contact number' }, { status: 400 });
    }
    if (String(qualification || '').trim()) {
      const v = validateAlphanumericAndSpaces(String(qualification), 'Highest qualification');
      if (!v.valid) return NextResponse.json({ error: v.error || 'Invalid qualification' }, { status: 400 });
    }

    connection = await getDatabase();

    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    ) as [any[], any];

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User with this username or email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert new user
    const [result] = await connection.execute(
      `INSERT INTO users (username, email, password_hash, full_name, role, phone, qualification, specialization)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        username,
        email,
        passwordHash,
        fullName || null,
        role,
        phone ? normalizeDigits(String(phone)) : null,
        qualification || null,
        specialization || null,
      ]
    ) as [any, any];

    // Get the created user
    const [newUsers] = await connection.execute(
      'SELECT id, username, email, full_name, role, phone, qualification, specialization, created_at FROM users WHERE id = ?',
      [result.insertId]
    ) as [any[], any];

    const newUser = newUsers[0];

    return NextResponse.json({
      message: 'User registered successfully',
      user: newUser
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
