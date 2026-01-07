import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';

function requireRole(request: NextRequest, roles: string[]) {
  const role = request.headers.get('x-user-role');
  const userId = request.headers.get('x-user-id');
  if (!userId || !role || !roles.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const forbidden = requireRole(request, ['editor', 'administrator', 'reviewer']);
  if (forbidden) return forbidden;

  let connection: mysql.Connection | null = null;

  try {
    const { searchParams } = new URL(request.url);
    const reviewerId = searchParams.get('reviewerId');
    const editorId = searchParams.get('editorId');

    const authUserId = request.headers.get('x-user-id');
    const authUserRole = request.headers.get('x-user-role');

    // Reviewers can only query their own
    if (authUserRole === 'reviewer') {
      if (reviewerId && reviewerId !== authUserId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Editors can only query their own
    if (authUserRole === 'editor') {
      if (editorId && editorId !== authUserId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    connection = await getDatabase();

    let query = `
      SELECT rfd.*, 
             r.full_name as reviewer_name,
             e.full_name as editor_name,
             aa.title as article_title,
             aa.abstract as article_abstract
      FROM reviewer_forwarded_documents rfd
      LEFT JOIN users r ON rfd.reviewer_id = r.id
      LEFT JOIN users e ON rfd.editor_id = e.id
      LEFT JOIN authors_articles aa ON rfd.article_id = aa.id
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    if (reviewerId) {
      conditions.push('rfd.reviewer_id = ?');
      params.push(Number(reviewerId));
    }

    if (editorId) {
      conditions.push('rfd.editor_id = ?');
      params.push(Number(editorId));
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY rfd.created_at DESC';

    const [rows] = (await connection.execute(query, params)) as [any[], any];

    return NextResponse.json({ items: rows });
  } catch (error) {
    console.error('Get reviewer_forwarded_documents error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const forbidden = requireRole(request, ['reviewer']);
  if (forbidden) return forbidden;

  let connection: mysql.Connection | null = null;

  try {
    const authUserId = request.headers.get('x-user-id');
    if (!authUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();

    const editorArticleId = formData.get('editorArticleId') as string;
    const articleId = formData.get('articleId') as string;
    const editorId = formData.get('editorId') as string;
    const comment = (formData.get('comment') as string) || '';

    const attachment = formData.get('attachment');
    const attachmentFile = attachment instanceof File ? attachment : null;

    if (!editorArticleId || !articleId || !editorId) {
      return NextResponse.json(
        { error: 'Missing required fields: editorArticleId, articleId, editorId' },
        { status: 400 }
      );
    }

    if (!attachmentFile || attachmentFile.size <= 0) {
      return NextResponse.json({ error: 'Attachment is required' }, { status: 400 });
    }

    let attachmentName: string | null = null;
    let attachmentPath: string | null = null;
    let attachmentType: string | null = null;
    let attachmentSize: number | null = null;

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'reviewer-forwarded');
    await fs.mkdir(uploadsDir, { recursive: true });

    const originalName = attachmentFile.name || 'attachment';
    const ext = path.extname(originalName);
    const safeBase = path
      .basename(originalName, ext)
      .replace(/[^a-z0-9-_]/gi, '_')
      .slice(0, 60);
    const uniqueName = `${Date.now()}_${Math.random().toString(16).slice(2)}_${safeBase}${ext}`;
    const fullPath = path.join(uploadsDir, uniqueName);

    const buffer = Buffer.from(await attachmentFile.arrayBuffer());
    await fs.writeFile(fullPath, buffer);

    attachmentName = originalName;
    attachmentPath = `/uploads/reviewer-forwarded/${uniqueName}`;
    attachmentType = attachmentFile.type || null;
    attachmentSize = attachmentFile.size;

    connection = await getDatabase();

    // Ensure the reviewer owns the editor_article and it is accepted
    const [eaRows] = (await connection.execute(
      'SELECT id, reviewer_id, editor_id, article_id, status FROM editor_articles WHERE id = ?',
      [Number(editorArticleId)]
    )) as [any[], any];

    const ea = eaRows[0];
    if (!ea) {
      return NextResponse.json({ error: 'Editor article not found' }, { status: 404 });
    }

    if (String(ea.reviewer_id) !== String(authUserId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (ea.status !== 'accepted') {
      return NextResponse.json({ error: 'Only accepted articles can be forwarded' }, { status: 400 });
    }

    // Force editorId/articleId from DB for consistency
    const finalEditorId = Number(ea.editor_id);
    const finalArticleId = Number(ea.article_id);

    const [result] = (await connection.execute(
      `INSERT INTO reviewer_forwarded_documents
       (editor_article_id, article_id, reviewer_id, editor_id, comment,
        attachment_name, attachment_path, attachment_type, attachment_size)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      , [
        Number(editorArticleId),
        finalArticleId,
        Number(authUserId),
        finalEditorId,
        comment || null,
        attachmentName,
        attachmentPath,
        attachmentType,
        attachmentSize,
      ])
    ) as [any, any];

    const [rows] = (await connection.execute(
      `SELECT rfd.*, r.full_name as reviewer_name, e.full_name as editor_name
       FROM reviewer_forwarded_documents rfd
       LEFT JOIN users r ON rfd.reviewer_id = r.id
       LEFT JOIN users e ON rfd.editor_id = e.id
       WHERE rfd.id = ?`,
      [result.insertId]
    )) as [any[], any];

    return NextResponse.json({ item: rows[0] });
  } catch (error) {
    console.error('Create reviewer_forwarded_documents error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
