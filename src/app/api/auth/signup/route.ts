import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import {
  validateLettersAndSpaces,
  validateAlphanumericAndSpaces,
  validateExactDigits,
  normalizeDigits,
  validatePassword,
} from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      username,
      email,
      password,
      fullName,
      fatherName,
      cnic,
      contactNumber,
      qualification,
      role,
      securityAnswer1,
      securityAnswer2,
    } = body;

    // Validation
    if (!username || !password || !fullName || !role) {
      return NextResponse.json(
        { message: 'Username, password, full name, and role are required' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(String(password));
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { message: passwordValidation.error || 'Invalid password' },
        { status: 400 }
      );
    }

    if (!String(securityAnswer1 || '').trim() || !String(securityAnswer2 || '').trim()) {
      return NextResponse.json(
        { message: 'Security question answers are required' },
        { status: 400 }
      );
    }

    const fullNameValidation = validateLettersAndSpaces(String(fullName), 'Full name');
    if (!fullNameValidation.valid) {
      return NextResponse.json({ message: fullNameValidation.error }, { status: 400 });
    }

    if (String(fatherName || '').trim()) {
      const fatherNameValidation = validateLettersAndSpaces(String(fatherName), 'Father name');
      if (!fatherNameValidation.valid) {
        return NextResponse.json({ message: fatherNameValidation.error }, { status: 400 });
      }
    }

    if (String(cnic || '').trim()) {
      const cnicValidation = validateExactDigits(String(cnic), 13, 'CNIC');
      if (!cnicValidation.valid) {
        return NextResponse.json({ message: cnicValidation.error }, { status: 400 });
      }
    }

    if (String(contactNumber || '').trim()) {
      const contactValidation = validateExactDigits(String(contactNumber), 11, 'Contact number');
      if (!contactValidation.valid) {
        return NextResponse.json({ message: contactValidation.error }, { status: 400 });
      }
    }

    if (String(qualification || '').trim()) {
      const qualificationValidation = validateAlphanumericAndSpaces(String(qualification), 'Highest qualification');
      if (!qualificationValidation.valid) {
        return NextResponse.json({ message: qualificationValidation.error }, { status: 400 });
      }
    }

    const security1Validation = validateAlphanumericAndSpaces(String(securityAnswer1), 'Security answer 1');
    if (!security1Validation.valid) {
      return NextResponse.json({ message: security1Validation.error }, { status: 400 });
    }
    const security2Validation = validateAlphanumericAndSpaces(String(securityAnswer2), 'Security answer 2');
    if (!security2Validation.valid) {
      return NextResponse.json({ message: security2Validation.error }, { status: 400 });
    }

    // Validate role
    if (!['author', 'reviewer'].includes(role)) {
      return NextResponse.json(
        { message: 'Role must be either author or reviewer' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Prefer provided email (if present), otherwise generate from username
    const resolvedEmail = String(email || '').trim() || `${username}@pagb.com`;

    // Check if username already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, resolvedEmail]
    ) as any[];

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: 'Username or email already exists' },
        { status: 409 }
      );
    }

    // Insert user into database
    const result = await query(
      'INSERT INTO users (username, email, password, full_name, role, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [username, resolvedEmail, hashedPassword, fullName, role]
    ) as any;

    const userId = result.insertId;

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
      const addCols: string[] = [];
      if (!colSet.has('security_answer1_hash')) addCols.push('ADD COLUMN security_answer1_hash VARCHAR(255) NULL');
      if (!colSet.has('security_answer2_hash')) addCols.push('ADD COLUMN security_answer2_hash VARCHAR(255) NULL');
      if (addCols.length) {
        await query(`ALTER TABLE users ${addCols.join(', ')}`);
      }
    }

    // Create the security questions table if it doesn't exist
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

    const answer1Hash = await bcrypt.hash(String(securityAnswer1).trim(), 10);
    const answer2Hash = await bcrypt.hash(String(securityAnswer2).trim(), 10);

    try {
      await query(
        'UPDATE users SET security_answer1_hash = ?, security_answer2_hash = ? WHERE id = ?',
        [answer1Hash, answer2Hash, userId]
      );
    } catch {
      // ignore if columns are not present
    }

    await query(
      `INSERT INTO user_security_questions (user_id, question_key, question_text, answer_hash)
       VALUES (?, ?, ?, ?), (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         question_text = VALUES(question_text),
         answer_hash = VALUES(answer_hash)` ,
      [
        userId,
        'school_name',
        'What is the name of your school?',
        answer1Hash,
        userId,
        'birth_place',
        'What is the name of the place where you were born?',
        answer2Hash,
      ]
    );

    // Create user data for response
    const userData = {
      id: userId,
      username,
      email: resolvedEmail,
      fullName: String(fullName).trim(),
      role,
    };

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: userData,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    
    // Handle specific database errors
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { message: 'Username or email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
