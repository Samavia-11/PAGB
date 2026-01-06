import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import mysql from 'mysql2/promise';
import { isValidId } from '@/lib/security';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let connection: mysql.Connection | null = null;

  try {
    const authUserId = request.headers.get('x-user-id');
    const authUserRole = request.headers.get('x-user-role');

    if (!authUserId || !authUserRole) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (authUserRole !== 'reviewer' && authUserRole !== 'editor' && authUserRole !== 'administrator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const resolvedParams = await params;
    const editorArticleId = resolvedParams.id;

    if (!isValidId(editorArticleId)) {
      return NextResponse.json({ error: 'Invalid editor article ID' }, { status: 400 });
    }

    connection = await getDatabase();

    const [rows] = await connection.execute(
      `SELECT ea.*, u.full_name as editor_name, r.full_name as reviewer_name,
              aa.author_id, au.full_name as author_name, au.username as author_username
       FROM editor_articles ea
       LEFT JOIN users u ON ea.editor_id = u.id
       LEFT JOIN users r ON ea.reviewer_id = r.id
       LEFT JOIN authors_articles aa ON ea.article_id = aa.id
       LEFT JOIN users au ON aa.author_id = au.id
       WHERE ea.id = ?`,
      [editorArticleId]
    );

    const editorArticle = (rows as any[])[0];
    if (!editorArticle) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (authUserRole === 'reviewer' && String(editorArticle.reviewer_id) !== String(authUserId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (authUserRole === 'editor' && String(editorArticle.editor_id) !== String(authUserId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ editorArticle });
  } catch (error) {
    console.error('Get editor article error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let connection: mysql.Connection | null = null;

  try {
    const authUserId = request.headers.get('x-user-id');
    const authUserRole = request.headers.get('x-user-role');

    if (!authUserId || !authUserRole) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (authUserRole !== 'reviewer' && authUserRole !== 'administrator') {
      return NextResponse.json({ error: 'Only reviewers can respond' }, { status: 403 });
    }

    const resolvedParams = await params;
    const editorArticleId = resolvedParams.id;

    if (!isValidId(editorArticleId)) {
      return NextResponse.json({ error: 'Invalid editor article ID' }, { status: 400 });
    }

    const body = await request.json();
    const { action } = body as { action?: 'accept' | 'reject' };

    if (!action || (action !== 'accept' && action !== 'reject')) {
      return NextResponse.json({ error: 'Invalid action. Must be accept or reject' }, { status: 400 });
    }

    const newStatus = action === 'accept' ? 'accepted' : 'rejected';

    connection = await getDatabase();

    const [rows] = await connection.execute(
      'SELECT * FROM editor_articles WHERE id = ?',
      [editorArticleId]
    );

    const editorArticle = (rows as any[])[0];
    if (!editorArticle) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (authUserRole === 'reviewer' && String(editorArticle.reviewer_id) !== String(authUserId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (editorArticle.status !== 'pending') {
      return NextResponse.json({ error: 'Request has already been processed' }, { status: 400 });
    }

    await connection.execute(
      'UPDATE editor_articles SET status = ?, response_date = NOW() WHERE id = ?',
      [newStatus, editorArticleId]
    );

    if (action === 'accept') {
      await connection.execute(
        'UPDATE authors_articles SET status = ? WHERE id = ?',
        ['under_review', editorArticle.article_id]
      );
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error('Editor article decision error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
