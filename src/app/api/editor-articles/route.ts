import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  let connection: mysql.Connection | null = null;
  
  try {
    const authUserId = request.headers.get('x-user-id');
    const authUserRole = request.headers.get('x-user-role');

    if (!authUserId || !authUserRole) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (authUserRole !== 'editor' && authUserRole !== 'administrator') {
      return NextResponse.json({ error: 'Only editors can forward articles' }, { status: 403 });
    }

    const formData = await request.formData();

    const articleId = formData.get('articleId') as string;
    const reviewerId = formData.get('reviewerId') as string;
    const title = formData.get('title') as string;
    const abstract = formData.get('abstract') as string;
    const content = formData.get('content') as string;
    const editorInstructions = formData.get('editorInstructions') as string;
    const status = (formData.get('status') as string) || 'pending';

    const attachment = formData.get('attachment');
    const attachmentFile = attachment instanceof File ? attachment : null;

    // Validate required fields
    if (!articleId || !reviewerId || !title || !abstract) {
      return NextResponse.json(
        { error: 'Missing required fields: articleId, reviewerId, title, abstract' },
        { status: 400 }
      );
    }

    let attachmentName: string | null = null;
    let attachmentPath: string | null = null;
    let attachmentType: string | null = null;
    let attachmentSize: number | null = null;

    if (attachmentFile && attachmentFile.size > 0) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'editor-articles');
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
      attachmentPath = `/uploads/editor-articles/${uniqueName}`;
      attachmentType = attachmentFile.type || null;
      attachmentSize = attachmentFile.size;
    }

    const editorId = parseInt(authUserId);

    connection = await getDatabase();

    // Insert into editor_articles table
    const [result] = await connection.execute(
      `INSERT INTO editor_articles 
       (article_id, editor_id, reviewer_id, title, abstract, content, editor_instructions,
        attachment_name, attachment_path, attachment_type, attachment_size, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(articleId),
        editorId,
        Number(reviewerId) || null,
        (title || '').trim(),
        (abstract || '').trim(),
        content || null,
        editorInstructions || null,
        attachmentName,
        attachmentPath,
        attachmentType,
        attachmentSize,
        status
      ]
    ) as [any, any];

    // Get the created editor article
    const [newEditorArticles] = await connection.execute(
      `SELECT ea.*, u.full_name as editor_name, r.full_name as reviewer_name
       FROM editor_articles ea
       LEFT JOIN users u ON ea.editor_id = u.id
       LEFT JOIN users r ON ea.reviewer_id = r.id
       WHERE ea.id = ?`,
      [result.insertId]
    ) as [any[], any];

    const newEditorArticle = newEditorArticles[0];

    return NextResponse.json({
      message: 'Article forwarded successfully',
      editorArticle: newEditorArticle
    });

  } catch (error) {
    console.error('Editor article creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  let connection: mysql.Connection | null = null;
  
  try {
    const { searchParams } = new URL(request.url);
    const editorIdParam = searchParams.get('editorId');
    const reviewerIdParam = searchParams.get('reviewerId');
    const status = searchParams.get('status');

    const authUserId = request.headers.get('x-user-id');
    const authUserRole = request.headers.get('x-user-role');

    if (!authUserId || !authUserRole) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const editorId = authUserRole === 'editor' ? (editorIdParam || authUserId) : editorIdParam;
    const reviewerId = authUserRole === 'reviewer' ? (reviewerIdParam || authUserId) : reviewerIdParam;

    // Restrict access: reviewers can only query their own, editors can only query their own
    if (authUserRole === 'reviewer') {
      if (reviewerId && reviewerId !== authUserId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    if (authUserRole === 'editor') {
      if (editorId && editorId !== authUserId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Allow administrators to query any
    if (authUserRole !== 'reviewer' && authUserRole !== 'editor' && authUserRole !== 'administrator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    connection = await getDatabase();

    let query = `
      SELECT ea.*, u.full_name as editor_name, r.full_name as reviewer_name,
             aa.title as original_title, aa.author_id,
             au.full_name as author_name, au.username as author_username,
             aa.status as article_status, aa.submission_date
      FROM editor_articles ea
      LEFT JOIN users u ON ea.editor_id = u.id
      LEFT JOIN users r ON ea.reviewer_id = r.id
      LEFT JOIN authors_articles aa ON ea.article_id = aa.id
      LEFT JOIN users au ON aa.author_id = au.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (editorId) {
      conditions.push('ea.editor_id = ?');
      params.push(editorId);
    }

    if (reviewerId) {
      conditions.push('ea.reviewer_id = ?');
      params.push(reviewerId);
    }

    if (status) {
      conditions.push('ea.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY ea.assigned_date DESC';

    const [editorArticles] = await connection.execute(query, params) as [any[], any];

    return NextResponse.json({
      editorArticles
    });

  } catch (error) {
    console.error('Get editor articles error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
