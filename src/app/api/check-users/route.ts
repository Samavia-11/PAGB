import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get all users
    const users: any = await query('SELECT id, username, full_name, role FROM users ORDER BY id');

    return NextResponse.json({
      success: true,
      users: users,
      totalUsers: Array.isArray(users) ? users.length : 0
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
