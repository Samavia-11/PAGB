import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const unreadOnly = request.nextUrl.searchParams.get('unread') === 'true';

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sql = unreadOnly
      ? 'SELECT * FROM notifications WHERE user_id = ? AND is_read = FALSE ORDER BY created_at DESC'
      : 'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50';
    
    const notifications = await query(sql, [userId]);
    return NextResponse.json({ notifications });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, type, title, message, article_id, related_user_id, action_url } = body;

    const sql = `INSERT INTO notifications (user_id, type, title, message, article_id, related_user_id, action_url) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    await query(sql, [user_id, type, title, message, article_id, related_user_id, action_url]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}
