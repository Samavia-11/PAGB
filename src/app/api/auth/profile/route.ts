import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import {
  validateEmail,
  validateUsername,
  validateLettersAndSpaces,
  validateAlphanumericAndSpaces,
  validateExactDigits,
  normalizeDigits,
} from '@/lib/security';

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

async function getDbName(): Promise<string> {
  try {
    const dbNameResult = (await query('SELECT DATABASE() AS db')) as any[];
    return String(process.env.DB_NAME || dbNameResult?.[0]?.db || '');
  } catch {
    return String(process.env.DB_NAME || '');
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbName = await getDbName();
    const cols = dbName
      ? ((await query(
          `SELECT COLUMN_NAME AS name
           FROM INFORMATION_SCHEMA.COLUMNS
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'`,
          [dbName]
        )) as any[])
      : ([] as any[]);

    const colSet = new Set((cols || []).map((c) => String(c.name).toLowerCase()));

    const selectCols: string[] = ['id', 'username', 'email', 'full_name', 'role', 'created_at'];
    if (colSet.has('father_name')) selectCols.push('father_name');
    if (colSet.has('cnic')) selectCols.push('cnic');
    if (colSet.has('contact_number')) selectCols.push('contact_number');
    if (colSet.has('qualification')) selectCols.push('qualification');

    const rows = (await query(
      `SELECT ${selectCols.join(', ')} FROM users WHERE id = ? LIMIT 1`,
      [userId]
    )) as any[];

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const u = rows[0];
    return NextResponse.json({
      user: {
        id: u.id,
        username: u.username,
        email: u.email,
        fullName: u.full_name,
        role: u.role,
        createdAt: u.created_at,
        fatherName: u.father_name ?? null,
        cnic: u.cnic ?? null,
        contactNumber: u.contact_number ?? null,
        qualification: u.qualification ?? null,
      },
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      username,
      email,
      fullName,
      fatherName,
      cnic,
      contactNumber,
      qualification,
    } = body;

    const updates: { key: string; value: any }[] = [];

    if (username !== undefined) {
      const v = String(username).trim();
      const validation = validateUsername(v);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error || 'Invalid username' }, { status: 400 });
      }
      updates.push({ key: 'username', value: v });
    }

    if (email !== undefined) {
      const v = String(email).trim();
      if (!validateEmail(v)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
      }
      updates.push({ key: 'email', value: v });
    }

    if (fullName !== undefined) {
      const v = String(fullName).trim();
      if (v) {
        const validation = validateLettersAndSpaces(v, 'Full name');
        if (!validation.valid) {
          return NextResponse.json({ error: validation.error || 'Invalid full name' }, { status: 400 });
        }
      }
      updates.push({ key: 'full_name', value: v || null });
    }

    const dbName = await getDbName();
    const cols = dbName
      ? ((await query(
          `SELECT COLUMN_NAME AS name
           FROM INFORMATION_SCHEMA.COLUMNS
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
             AND COLUMN_NAME IN ('father_name','cnic','contact_number','qualification')`,
          [dbName]
        )) as any[])
      : ([] as any[]);

    const colSet = new Set((cols || []).map((c) => String(c.name).toLowerCase()));

    if (fatherName !== undefined && colSet.has('father_name')) {
      const v = String(fatherName).trim();
      if (v) {
        const validation = validateLettersAndSpaces(v, 'Father name');
        if (!validation.valid) {
          return NextResponse.json({ error: validation.error || 'Invalid father name' }, { status: 400 });
        }
      }
      updates.push({ key: 'father_name', value: v || null });
    }
    if (cnic !== undefined && colSet.has('cnic')) {
      const v = String(cnic).trim();
      if (v) {
        const validation = validateExactDigits(v, 13, 'CNIC');
        if (!validation.valid) {
          return NextResponse.json({ error: validation.error || 'Invalid CNIC' }, { status: 400 });
        }
      }
      updates.push({ key: 'cnic', value: v ? normalizeDigits(v) : null });
    }
    if (contactNumber !== undefined && colSet.has('contact_number')) {
      const v = String(contactNumber).trim();
      if (v) {
        const validation = validateExactDigits(v, 11, 'Contact number');
        if (!validation.valid) {
          return NextResponse.json({ error: validation.error || 'Invalid contact number' }, { status: 400 });
        }
      }
      updates.push({ key: 'contact_number', value: v ? normalizeDigits(v) : null });
    }
    if (qualification !== undefined && colSet.has('qualification')) {
      const v = String(qualification).trim();
      if (v) {
        const validation = validateAlphanumericAndSpaces(v, 'Highest qualification');
        if (!validation.valid) {
          return NextResponse.json({ error: validation.error || 'Invalid qualification' }, { status: 400 });
        }
      }
      updates.push({ key: 'qualification', value: v || null });
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const newUsername = updates.find((u) => u.key === 'username')?.value;
    const newEmail = updates.find((u) => u.key === 'email')?.value;

    if (newUsername || newEmail) {
      const existing = (await query(
        'SELECT id FROM users WHERE (username = ? OR email = ?) AND id <> ? LIMIT 1',
        [newUsername || '', newEmail || '', userId]
      )) as any[];

      if (existing && existing.length > 0) {
        return NextResponse.json({ error: 'Username or email already exists' }, { status: 409 });
      }
    }

    const setSql = updates.map((u) => `${u.key} = ?`).join(', ');
    const params = updates.map((u) => u.value);
    params.push(userId);

    await query(`UPDATE users SET ${setSql} WHERE id = ?`, params);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
