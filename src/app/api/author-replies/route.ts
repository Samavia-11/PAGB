import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import mysql from 'mysql2/promise';

function requireRole(request: NextRequest, roles: string[]) {
  const role = request.headers.get('x-user-role');
  const userId = request.headers.get('x-user-id');
  if (!userId || !role || !roles.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const forbidden = requireRole(request, ['editor', 'administrator']);
  if (forbidden) return forbidden;

  let connection: mysql.Connection | null = null;

  try {
    connection = await getDatabase();

    const [rows] = (await connection.execute(
      `SELECT 
         m.id as message_id,
         m.article_id,
         m.sender_id,
         m.message,
         m.file_url,
         m.file_name,
         m.file_type,
         m.created_at,
         aa.title as article_title,
         aa.abstract as article_abstract,
         aa.author_id,
         au.full_name as author_name,
         au.username as author_username
       FROM article_messages m
       INNER JOIN (
         SELECT article_id, MAX(created_at) as max_created_at
         FROM article_messages
         WHERE sender_role = 'author' AND file_url IS NOT NULL
         GROUP BY article_id
       ) latest
         ON latest.article_id = m.article_id AND latest.max_created_at = m.created_at
       LEFT JOIN authors_articles aa ON aa.id = m.article_id
       LEFT JOIN users au ON au.id = aa.author_id
       WHERE m.sender_role = 'author' AND m.file_url IS NOT NULL
       ORDER BY m.created_at DESC`
    )) as [any[], any];

    return NextResponse.json({ items: rows });
  } catch (error) {
    console.error('Get author replies error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
