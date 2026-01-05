import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { query } from './db';

export interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  email?: string;
  full_name?: string;
  affiliation?: string;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'CHANGE_THIS_SECRET_IN_PRODUCTION_MIN_32_CHARS!'
);

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12);
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = async (user: User): Promise<string> => {
  const sessionId = crypto.randomUUID();
  return new SignJWT({
    userId: user.id,
    username: user.username,
    role: user.role,
    fullName: user.full_name || user.username,
    sessionId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
};

export const verifyToken = async (token: string): Promise<any | null> => {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
};

export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  const users = (await query(
    'SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1',
    [username, username]
  )) as any[];

  if (users.length === 0) {
    return null;
  }
  
  const user = users[0];
  
  // Verify password using bcrypt
  const isValidPassword = await verifyPassword(password, user.password);
  
  if (isValidPassword) {
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
      full_name: user.full_name,
      affiliation: user.affiliation
    };
  }
  
  return null;
};

export const getUserFromToken = async (token: string): Promise<User | null> => {
  const decoded = await verifyToken(token);
  if (!decoded) return null;

  const userId = Number((decoded as any).userId);
  if (!userId || Number.isNaN(userId)) return null;

  const users = (await query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId])) as any[];
  if (users.length === 0) {
    return null;
  }
  
  const user = users[0];
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    email: user.email,
    full_name: user.full_name,
    affiliation: user.affiliation
  };
};

export const createUserFromRequest = async (requestData: {
  username: string;
  email: string;
  password: string;
  role: string;
  fatherName?: string;
  cnic?: string;
  contactNumber?: string;
  qualification?: string;
}): Promise<User | null> => {
  try {
    // Hash the password
    const hashedPassword = await hashPassword(requestData.password);

    const dbName = process.env.DB_NAME || 'armyjournal';
    const cols = (await query(
      `SELECT COLUMN_NAME AS name
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'`,
      [dbName]
    )) as any[];

    const colSet = new Set((cols || []).map((c) => String(c.name).toLowerCase()));

    const columns: string[] = ['username', 'email', 'password', 'role', 'full_name'];
    const values: any[] = [
      requestData.username,
      requestData.email,
      hashedPassword,
      requestData.role,
      requestData.username,
    ];

    if (colSet.has('father_name')) {
      columns.push('father_name');
      values.push(requestData.fatherName || null);
    }
    if (colSet.has('cnic')) {
      columns.push('cnic');
      values.push(requestData.cnic || null);
    }
    if (colSet.has('contact_number')) {
      columns.push('contact_number');
      values.push(requestData.contactNumber || null);
    }
    if (colSet.has('qualification')) {
      columns.push('qualification');
      values.push(requestData.qualification || null);
    }
    if (colSet.has('created_at')) {
      columns.push('created_at');
      values.push(new Date());
    }

    const placeholders = columns.map(() => '?').join(', ');
    const insertSql = `INSERT INTO users (${columns.join(', ')}) VALUES (${placeholders})`;

    const result = (await query(insertSql, values)) as any;
    
    return {
      id: result.insertId,
      username: requestData.username,
      role: requestData.role as 'author' | 'reviewer' | 'editor' | 'administrator',
      email: requestData.email,
      full_name: requestData.username
    };
  } catch (error) {
    console.error('Error creating user from request:', error);
    return null;
  }
};
