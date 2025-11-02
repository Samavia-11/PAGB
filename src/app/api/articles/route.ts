import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get('status');
  const role = request.headers.get('x-user-role');
  const userId = request.headers.get('x-user-id');

  try {
    let sql = `SELECT a.*, u.full_name as author_name 
               FROM articles a 
               JOIN users u ON a.author_id = u.id`;
    const params: any[] = [];

    if (status) {
      sql += ' WHERE a.status = ?';
      params.push(status);
    } else if (role === 'author') {
      sql += ' WHERE a.author_id = ?';
      params.push(userId);
    }

    sql += ' ORDER BY a.created_at DESC';
    
    const articles = await query(sql, params);
    return NextResponse.json({ articles });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, author_id } = body;

    const sql = `INSERT INTO articles (title, content, author_id, status) VALUES (?, ?, ?, 'draft')`;
    const result: any = await query(sql, [title, content, author_id]);
    
    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create article' + error}, { status: 500 });
  }
}
