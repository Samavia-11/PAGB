import { NextRequest, NextResponse } from 'next/server';
import { createUserFromRequest } from '@/lib/auth';
import {
  validateLettersAndSpaces,
  validateAlphanumericAndSpaces,
  validateExactDigits,
  normalizeDigits,
  validatePassword,
} from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, role, fatherName, cnic, contactNumber, qualification } = await request.json();

    if (!username || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Username, email, password, and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['author', 'reviewer', 'editor', 'administrator'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
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

    const nameValidation = validateLettersAndSpaces(String(username), 'Full name');
    if (!nameValidation.valid) {
      return NextResponse.json({ error: nameValidation.error || 'Invalid name' }, { status: 400 });
    }
    if (String(fatherName || '').trim()) {
      const v = validateLettersAndSpaces(String(fatherName), 'Father name');
      if (!v.valid) return NextResponse.json({ error: v.error || 'Invalid father name' }, { status: 400 });
    }
    if (String(cnic || '').trim()) {
      const v = validateExactDigits(String(cnic), 13, 'CNIC');
      if (!v.valid) return NextResponse.json({ error: v.error || 'Invalid CNIC' }, { status: 400 });
    }
    if (String(contactNumber || '').trim()) {
      const v = validateExactDigits(String(contactNumber), 11, 'Contact number');
      if (!v.valid) return NextResponse.json({ error: v.error || 'Invalid contact number' }, { status: 400 });
    }
    if (String(qualification || '').trim()) {
      const v = validateAlphanumericAndSpaces(String(qualification), 'Highest qualification');
      if (!v.valid) return NextResponse.json({ error: v.error || 'Invalid qualification' }, { status: 400 });
    }

    const user = await createUserFromRequest({
      username,
      email,
      password,
      role,
      fatherName,
      cnic: String(cnic || '').trim() ? normalizeDigits(String(cnic)) : undefined,
      contactNumber: String(contactNumber || '').trim() ? normalizeDigits(String(contactNumber)) : undefined,
      qualification
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user account. Username might already exist.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Duplicate entry')) {
        return NextResponse.json(
          { error: 'Username or email already exists' },
          { status: 409 }
        );
      }
      if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
        return NextResponse.json(
          { error: 'Database connection failed. Please ensure MySQL is running.' },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create user account' },
      { status: 500 }
    );
  }
}
