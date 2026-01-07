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
  const forbidden = requireRole(request, ['editor', 'administrator', 'author']);
  if (forbidden) return forbidden;

  let connection: mysql.Connection | null = null;

  try {
    const { searchParams } = new URL(request.url);
    const editorIdParam = searchParams.get('editorId');
    const authorIdParam = searchParams.get('authorId');

    const authUserId = request.headers.get('x-user-id');
    const authUserRole = request.headers.get('x-user-role');

    if (authUserRole === 'author') {
      if (authorIdParam && authorIdParam !== authUserId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    if (authUserRole === 'editor') {
      if (editorIdParam && editorIdParam !== authUserId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    connection = await getDatabase();

    let query = `
      SELECT ead.*, 
             e.full_name as editor_name,
             a.full_name as author_name,
             aa.title as article_title,
             aa.abstract as article_abstract
      FROM editor_author_documents ead
      LEFT JOIN users e ON ead.editor_id = e.id
      LEFT JOIN users a ON ead.author_id = a.id
      LEFT JOIN authors_articles aa ON ead.article_id = aa.id
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    const editorId = authUserRole === 'editor' ? (editorIdParam || authUserId) : editorIdParam;
    const authorId = authUserRole === 'author' ? (authorIdParam || authUserId) : authorIdParam;

    if (editorId) {
      conditions.push('ead.editor_id = ?');
      params.push(Number(editorId));
    }

    if (authorId) {
      conditions.push('ead.author_id = ?');
      params.push(Number(authorId));
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY ead.created_at DESC';

    const [rows] = (await connection.execute(query, params)) as [any[], any];

    return NextResponse.json({ items: rows });
  } catch (error) {
    console.error('Get editor_author_documents error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const forbidden = requireRole(request, ['editor']);
  if (forbidden) return forbidden;

  let connection: mysql.Connection | null = null;

  try {
    const authUserId = request.headers.get('x-user-id');
    if (!authUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reviewerForwardId, authorId, comment } = body as {
      reviewerForwardId?: number;
      authorId?: number;
      comment?: string;
    };

    if (!reviewerForwardId || !authorId) {
      return NextResponse.json({ error: 'Missing required fields: reviewerForwardId, authorId' }, { status: 400 });
    }

    connection = await getDatabase();

    const [rfdRows] = (await connection.execute(
      `SELECT rfd.*
       FROM reviewer_forwarded_documents rfd
       WHERE rfd.id = ?`,
      [Number(reviewerForwardId)]
    )) as [any[], any];

    const rfd = rfdRows[0];
    if (!rfd) {
      return NextResponse.json({ error: 'Forwarded document not found' }, { status: 404 });
    }

    // Only the owning editor can send to author
    if (String(rfd.editor_id) !== String(authUserId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Copy the attachment metadata from reviewer_forwarded_documents
    const [result] = (await connection.execute(
      `INSERT INTO editor_author_documents
       (reviewer_forward_id, article_id, editor_id, author_id, comment,
        attachment_name, attachment_path, attachment_type, attachment_size)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(reviewerForwardId),
        Number(rfd.article_id),
        Number(authUserId),
        Number(authorId),
        (comment || '').trim() || null,
        rfd.attachment_name || null,
        rfd.attachment_path || null,
        rfd.attachment_type || null,
        rfd.attachment_size || null,
      ]
    )) as [any, any];

    const [rows] = (await connection.execute(
      `SELECT ead.*, e.full_name as editor_name, a.full_name as author_name
       FROM editor_author_documents ead
       LEFT JOIN users e ON ead.editor_id = e.id
       LEFT JOIN users a ON ead.author_id = a.id
       WHERE ead.id = ?`,
      [result.insertId]
    )) as [any[], any];

    return NextResponse.json({ item: rows[0] });
  } catch (error) {
    console.error('Create editor_author_documents error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
