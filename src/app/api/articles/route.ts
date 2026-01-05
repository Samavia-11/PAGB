import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import mysql from 'mysql2/promise';

// Valid article statuses
const VALID_STATUSES = ['draft', 'submitted', 'under_review', 'reviewed', 'editor_review', 'accepted', 'published', 'rejected'];

export async function GET(request: NextRequest) {
  let connection: mysql.Connection | null = null;
  
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const authorId = searchParams.get('authorId');
    const role = request.headers.get('x-user-role');
    const userId = request.headers.get('x-user-id');

    // Validate status parameter if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status parameter' }, { status: 400 });
    }

    connection = await getDatabase();

    let query = `
      SELECT aa.*, u.full_name as author_name, u.email as author_email
      FROM authors_articles aa
      JOIN users u ON aa.author_id = u.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    // Filter based on user role
    if (role === 'author' && userId) {
      conditions.push('aa.author_id = ?');
      params.push(userId);
    }

    if (status) {
      conditions.push('aa.status = ?');
      params.push(status);
    }

    if (authorId) {
      conditions.push('aa.author_id = ?');
      params.push(authorId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY aa.submission_date DESC';

    const [articles] = await connection.execute(query, params) as [any[], any];

    // Parse authors JSON if present
    const parsedArticles = articles.map(article => ({
      ...article,
      authors: article.authors ? JSON.parse(article.authors) : null
    }));

    return NextResponse.json({
      articles: parsedArticles
    });

  } catch (error) {
    console.error('Get articles error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let connection: mysql.Connection | null = null;
  
  try {
    const body = await request.json();
    const { 
      authorId, 
      title, 
      abstract, 
      keywords, 
      content, 
      authors, 
      affiliation, 
      articleType, 
      manuscriptFileName,
      status = 'submitted'
    } = body;

    // Validate required fields
    if (!authorId || !title || !abstract) {
      return NextResponse.json(
        { error: 'Missing required fields: authorId, title, abstract' },
        { status: 400 }
      );
    }

    connection = await getDatabase();

    // Insert article into authors_articles table
    const [result] = await connection.execute(
      `INSERT INTO authors_articles 
       (author_id, title, abstract, keywords, content, authors, affiliation, article_type, manuscript_file_name, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        authorId,
        title,
        abstract,
        keywords || null,
        content || null,
        authors ? JSON.stringify(authors) : null,
        affiliation || null,
        articleType || null,
        manuscriptFileName || null,
        status
      ]
    ) as [any, any];

    // Get the created article
    const [newArticles] = await connection.execute(
      `SELECT aa.*, u.full_name as author_name, u.email as author_email
       FROM authors_articles aa
       JOIN users u ON aa.author_id = u.id
       WHERE aa.id = ?`,
      [result.insertId]
    ) as [any[], any];

    const newArticle = newArticles[0];
    newArticle.authors = newArticle.authors ? JSON.parse(newArticle.authors) : null;

    return NextResponse.json({
      message: 'Article submitted successfully',
      article: newArticle
    });

  } catch (error) {
    console.error('Article submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  let connection: mysql.Connection | null = null;
  
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: id, status' },
        { status: 400 }
      );
    }

    connection = await getDatabase();

    // Update article status
    const [result] = await connection.execute(
      'UPDATE authors_articles SET status = ?, last_updated = NOW() WHERE id = ?',
      [status, id]
    ) as [any, any];

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Article status updated successfully'
    });

  } catch (error) {
    console.error('Article status update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
