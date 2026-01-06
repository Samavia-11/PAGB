import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import mysql from 'mysql2/promise';

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

    const body = await request.json();
    const { 
      articleId, 
      reviewerId, 
      title, 
      abstract, 
      content, 
      editorInstructions,
      status = 'pending'
    } = body;

    // Validate required fields
    if (!articleId || !reviewerId || !title || !abstract) {
      return NextResponse.json(
        { error: 'Missing required fields: articleId, reviewerId, title, abstract' },
        { status: 400 }
      );
    }

    const editorId = parseInt(authUserId);

    connection = await getDatabase();

    // Insert into editor_articles table
    const [result] = await connection.execute(
      `INSERT INTO editor_articles 
       (article_id, editor_id, reviewer_id, title, abstract, content, editor_instructions, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        articleId,
        editorId,
        reviewerId || null,
        title,
        abstract,
        content || null,
        editorInstructions || null,
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
