import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, securityAnswer1, securityAnswer2 } = body;

    if (!identifier || !String(identifier).trim()) {
      return NextResponse.json({ success: false, error: 'Username or email is required' }, { status: 400 });
    }

    if (!String(securityAnswer1 || '').trim() || !String(securityAnswer2 || '').trim()) {
      return NextResponse.json({ success: false, error: 'Both security answers are required' }, { status: 400 });
    }

    const users = (await query(
      'SELECT id, username, email FROM users WHERE username = ? OR email = ? LIMIT 1',
      [identifier, identifier]
    )) as any[];

    if (!users || users.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid details' }, { status: 404 });
    }

    const user = users[0];

    let answerHash1: string | null = null;
    let answerHash2: string | null = null;

    try {
      const dbNameResult = (await query('SELECT DATABASE() AS db')) as any[];
      const dbName = process.env.DB_NAME || (dbNameResult?.[0]?.db as string) || '';

      if (dbName) {
        const userCols = (await query(
          `SELECT COLUMN_NAME AS name
           FROM INFORMATION_SCHEMA.COLUMNS
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
             AND COLUMN_NAME IN ('security_answer1_hash', 'security_answer2_hash')`,
          [dbName]
        )) as any[];

        const colSet = new Set((userCols || []).map((c) => String(c.name)));
        if (colSet.has('security_answer1_hash') && colSet.has('security_answer2_hash')) {
          const secRows = (await query(
            'SELECT security_answer1_hash, security_answer2_hash FROM users WHERE id = ? LIMIT 1',
            [user.id]
          )) as any[];
          if (secRows && secRows.length) {
            answerHash1 = secRows[0].security_answer1_hash || null;
            answerHash2 = secRows[0].security_answer2_hash || null;
          }
        }
      }
    } catch {
      // ignore and fallback to user_security_questions
    }

    await query(
      `CREATE TABLE IF NOT EXISTS user_security_questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        question_key VARCHAR(64) NOT NULL,
        question_text VARCHAR(255) NOT NULL,
        answer_hash VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_question (user_id, question_key)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    );

    if (!answerHash1 || !answerHash2) {
      const rows = (await query(
        `SELECT question_key, answer_hash
         FROM user_security_questions
         WHERE user_id = ? AND question_key IN (?, ?)` ,
        [user.id, 'school_name', 'birth_place']
      )) as any[];

      const byKey = new Map<string, string>();
      for (const r of rows || []) {
        byKey.set(String(r.question_key), String(r.answer_hash));
      }

      answerHash1 = byKey.get('school_name') || null;
      answerHash2 = byKey.get('birth_place') || null;
    }

    if (!answerHash1 || !answerHash2) {
      return NextResponse.json({ success: false, error: 'Security questions not set for this account' }, { status: 400 });
    }

    const ok1 = await bcrypt.compare(String(securityAnswer1).trim(), answerHash1);
    const ok2 = await bcrypt.compare(String(securityAnswer2).trim(), answerHash2);

    if (!ok1 || !ok2) {
      return NextResponse.json({ success: false, error: 'Invalid details' }, { status: 401 });
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

    const resetToken = crypto.randomUUID();
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [user.id, tokenHash, expiresAt]
    );

    return NextResponse.json(
      {
        success: true,
        resetToken,
        expiresInMinutes: 15,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
