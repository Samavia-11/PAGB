import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const sql = `SELECT a.*, u.full_name as author_name 
                 FROM articles a 
                 JOIN users u ON a.author_id = u.id 
                 WHERE a.id = ?`;
    const rows: any = await query(sql, [id]);
    if (!rows || rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ article: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const body = await request.json();
    const { title, content } = body;
    await query('UPDATE articles SET title = ?, content = ?, updated_at = NOW() WHERE id = ?', [title, content, id]);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    await query('DELETE FROM articles WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
