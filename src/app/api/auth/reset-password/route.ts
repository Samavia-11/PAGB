import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query } from '@/lib/db';
import { validatePassword } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resetToken, newPassword } = body;

    if (!resetToken || !String(resetToken).trim()) {
      return NextResponse.json({ success: false, error: 'Reset token is required' }, { status: 400 });
    }

    const passwordValidation = validatePassword(String(newPassword));
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.error || 'Invalid password' },
        { status: 400 }
      );
    }

    await query(
      `CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token_hash CHAR(64) NOT NULL,
        expires_at DATETIME NOT NULL,
        used_at DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_token_hash (token_hash),
        KEY idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    );

    const tokenHash = crypto.createHash('sha256').update(String(resetToken)).digest('hex');

    const rows = (await query(
      'SELECT id, user_id, expires_at, used_at FROM password_reset_tokens WHERE token_hash = ? LIMIT 1',
      [tokenHash]
    )) as any[];

    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid or expired reset token' }, { status: 400 });
    }

    const tokenRow = rows[0];

    if (tokenRow.used_at) {
      return NextResponse.json({ success: false, error: 'Invalid or expired reset token' }, { status: 400 });
    }

    const expiresAt = new Date(tokenRow.expires_at);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ success: false, error: 'Invalid or expired reset token' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(String(newPassword), 10);

    await query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, tokenRow.user_id]);
    await query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?', [tokenRow.id]);

    return NextResponse.json({ success: true, message: 'Password updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
