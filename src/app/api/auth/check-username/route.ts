import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const rows = (await query('SELECT id FROM users WHERE username = ? LIMIT 1', [username])) as any[];
    const exists = rows.length > 0;
    
    // Also check if username exists in pending requests
    // This is a server-side check, but we'll also check localStorage on client
    
    return NextResponse.json({
      exists,
      available: !exists
    });
  } catch (error) {
    console.error('Username check error:', error);
    return NextResponse.json(
      { error: 'Failed to check username availability' },
      { status: 500 }
    );
  }
}
