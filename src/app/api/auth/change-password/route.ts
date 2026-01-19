import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { validatePassword } from '@/lib/security';

async function getAuthenticatedUserId(request: NextRequest): Promise<number | null> {
  const headerUserId = request.headers.get('x-user-id');
  if (headerUserId && !Number.isNaN(Number(headerUserId))) {
    return Number(headerUserId);
  }

  const token =
    request.cookies.get('auth-token')?.value ||
    request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) return null;

  const user = await getUserFromToken(token);
  if (!user) return null;

  return user.id;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
    }

    const validation = validatePassword(String(newPassword));
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error || 'Invalid password' }, { status: 400 });
    }

    const rows = (await query('SELECT password FROM users WHERE id = ? LIMIT 1', [userId])) as any[];
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const stored = rows[0].password;
    if (!stored || typeof stored !== 'string') {
      return NextResponse.json({ error: 'Account requires password reset. Please contact administrator.' }, { status: 400 });
    }

    const isValid = await bcrypt.compare(String(currentPassword), stored);
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    const hashed = await bcrypt.hash(String(newPassword), 10);
    await query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
