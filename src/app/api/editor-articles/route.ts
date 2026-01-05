import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import mysql from 'mysql2/promise';

export async function POST(request: NextRequest) {
  let connection: mysql.Connection | null = null;
  
  try {
    const body = await request.json();
    const { 
      articleId, 
      editorId, 
      reviewerId, 
      title, 
      abstract, 
      content, 
      editorInstructions,
      status = 'pending'
    } = body;

    // Validate required fields
    if (!articleId || !editorId || !title || !abstract) {
      return NextResponse.json(
        { error: 'Missing required fields: articleId, editorId, title, abstract' },
        { status: 400 }
      );
    }

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
    const editorId = searchParams.get('editorId');
    const reviewerId = searchParams.get('reviewerId');
    const status = searchParams.get('status');

    connection = await getDatabase();

    let query = `
      SELECT ea.*, u.full_name as editor_name, r.full_name as reviewer_name,
             aa.title as original_title, aa.author_id
      FROM editor_articles ea
      LEFT JOIN users u ON ea.editor_id = u.id
      LEFT JOIN users r ON ea.reviewer_id = r.id
      LEFT JOIN authors_articles aa ON ea.article_id = aa.id
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
