import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import mysql from 'mysql2/promise';

export async function POST(request: NextRequest) {
  let connection: mysql.Connection | null = null;
  
  try {
    const body = await request.json();
    const { 
      editorArticleId, 
      reviewerId, 
      articleId, 
      reviewerComments, 
      recommendation,
      status = 'completed'
    } = body;

    // Validate required fields
    if (!editorArticleId || !reviewerId || !articleId) {
      return NextResponse.json(
        { error: 'Missing required fields: editorArticleId, reviewerId, articleId' },
        { status: 400 }
      );
    }

    connection = await getDatabase();

    // Insert into reviewer_articles table
    const [result] = await connection.execute(
      `INSERT INTO reviewer_articles 
       (editor_article_id, reviewer_id, article_id, reviewer_comments, recommendation, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        editorArticleId,
        reviewerId,
        articleId,
        reviewerComments || null,
        recommendation || null,
        status
      ]
    ) as [any, any];

    // Update the editor_article status
    await connection.execute(
      'UPDATE editor_articles SET status = ?, response_date = NOW() WHERE id = ?',
      [status, editorArticleId]
    );

    // Get the created reviewer article
    const [newReviewerArticles] = await connection.execute(
      `SELECT ra.*, u.full_name as reviewer_name,
             ea.title as article_title, ea.abstract as article_abstract
       FROM reviewer_articles ra
       JOIN users u ON ra.reviewer_id = u.id
       JOIN editor_articles ea ON ra.editor_article_id = ea.id
       WHERE ra.id = ?`,
      [result.insertId]
    ) as [any[], any];

    const newReviewerArticle = newReviewerArticles[0];

    return NextResponse.json({
      message: 'Reviewer response submitted successfully',
      reviewerArticle: newReviewerArticle
    });

  } catch (error) {
    console.error('Reviewer article creation error:', error);
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
    const reviewerId = searchParams.get('reviewerId');
    const editorArticleId = searchParams.get('editorArticleId');
    const status = searchParams.get('status');

    connection = await getDatabase();

    let query = `
      SELECT ra.*, u.full_name as reviewer_name,
             ea.title as article_title, ea.abstract as article_abstract,
             e.full_name as editor_name
      FROM reviewer_articles ra
      JOIN users u ON ra.reviewer_id = u.id
      JOIN editor_articles ea ON ra.editor_article_id = ea.id
      LEFT JOIN users e ON ea.editor_id = e.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (reviewerId) {
      conditions.push('ra.reviewer_id = ?');
      params.push(reviewerId);
    }

    if (editorArticleId) {
      conditions.push('ra.editor_article_id = ?');
      params.push(editorArticleId);
    }

    if (status) {
      conditions.push('ra.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY ra.reviewed_date DESC';

    const [reviewerArticles] = await connection.execute(query, params) as [any[], any];

    return NextResponse.json({
      reviewerArticles
    });

  } catch (error) {
    console.error('Get reviewer articles error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
