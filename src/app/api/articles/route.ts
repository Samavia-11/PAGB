import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import mysql from 'mysql2/promise';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { isAllowedFileType, isFileSizeValid, sanitizeFileName } from '@/lib/security';

export const runtime = 'nodejs';

// Valid article statuses
const VALID_STATUSES = ['draft', 'submitted', 'under_review', 'reviewed', 'editor_review', 'accepted', 'published', 'rejected'];

type FileLike = {
  name: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

const isFileLike = (value: unknown): value is FileLike => {
  if (!value || typeof value !== 'object') return false;
  const v = value as any;
  return typeof v.name === 'string' && typeof v.size === 'number' && typeof v.arrayBuffer === 'function';
};

export async function GET(request: NextRequest) {
  let connection: mysql.Connection | null = null;
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const status = searchParams.get('status');
    const authorId = searchParams.get('authorId');
    const role = request.headers.get('x-user-role');
    const userId = request.headers.get('x-user-id');

    if (id && (Number.isNaN(parseInt(id)) || parseInt(id) <= 0)) {
      return NextResponse.json({ error: 'Invalid id parameter' }, { status: 400 });
    }

    // Validate status parameter if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status parameter' }, { status: 400 });
    }

    connection = await getDatabase();

    let query = `
      SELECT aa.*, u.full_name as author_name, u.email as author_email, u.phone as author_phone
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

    if (id) {
      conditions.push('aa.id = ?');
      params.push(parseInt(id));
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
    const err = error as any;
    return NextResponse.json(
      {
        error: 'Internal server error',
        details:
          process.env.NODE_ENV !== 'production'
            ? {
                message: err?.message ?? String(err),
                code: err?.code,
                stack: err?.stack,
              }
            : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let connection: mysql.Connection | null = null;
  
  try {
    const contentType = request.headers.get('content-type') || '';
    console.log('POST /api/articles content-type:', contentType);

    let authorId: number | null = null;
    let title: string | null = null;
    let abstract: string | null = null;
    let keywords: string | null = null;
    let content: string | null = null;
    let authors: any[] | null = null;
    let affiliation: string | null = null;
    let articleType: string | null = null;
    let status: string = 'submitted';
    let manuscriptFile: File | null = null;
    let coverLetterFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      console.log('FormData keys received:', Array.from(formData.keys()));
      authorId = parseInt((formData.get('authorId') as string) || '');
      title = (formData.get('title') as string) || null;
      abstract = (formData.get('abstract') as string) || null;
      keywords = (formData.get('keywords') as string) || null;
      content = (formData.get('content') as string) || null;
      affiliation = (formData.get('affiliation') as string) || null;
      articleType = (formData.get('articleType') as string) || null;
      status = ((formData.get('status') as string) || 'submitted').toString();

      const authorsRaw = formData.get('authors');
      console.log('authorsRaw from FormData:', authorsRaw);
      if (typeof authorsRaw === 'string' && authorsRaw.trim()) {
        try {
          authors = JSON.parse(authorsRaw);
          console.log('Parsed authors:', authors);
        } catch (e) {
          console.error('Failed to parse authors JSON:', e);
          authors = null;
        }
      }

      const fileValue = formData.get('manuscript');
      manuscriptFile = isFileLike(fileValue) ? (fileValue as unknown as File) : null;
      console.log('manuscriptFile:', manuscriptFile ? manuscriptFile.name : 'null');

      const coverLetterValue = formData.get('coverLetterFile');
      coverLetterFile = isFileLike(coverLetterValue) ? (coverLetterValue as unknown as File) : null;
      console.log('coverLetterFile:', coverLetterFile ? coverLetterFile.name : 'null');
    } else {
      const body = await request.json();
      authorId = Number(body.authorId);
      title = body.title;
      abstract = body.abstract;
      keywords = body.keywords || null;
      content = body.content || null;
      authors = body.authors || null;
      affiliation = body.affiliation || null;
      articleType = body.articleType || null;
      status = body.status || 'submitted';
      manuscriptFile = null;
      coverLetterFile = null;
    }

    // Validate required fields
    if (!authorId || !title || !abstract) {
      return NextResponse.json(
        { error: 'Missing required fields: authorId, title, abstract' },
        { status: 400 }
      );
    }

    if (manuscriptFile && manuscriptFile.size > 0) {
      const typeCheck = isAllowedFileType(manuscriptFile);
      if (!typeCheck.valid) {
        return NextResponse.json({ error: typeCheck.error }, { status: 400 });
      }

      const sizeCheck = isFileSizeValid(manuscriptFile);
      if (!sizeCheck.valid) {
        return NextResponse.json({ error: sizeCheck.error }, { status: 400 });
      }
    }

    if (coverLetterFile && coverLetterFile.size > 0) {
      const typeCheck = isAllowedFileType(coverLetterFile);
      if (!typeCheck.valid) {
        return NextResponse.json({ error: typeCheck.error }, { status: 400 });
      }

      const sizeCheck = isFileSizeValid(coverLetterFile);
      if (!sizeCheck.valid) {
        return NextResponse.json({ error: sizeCheck.error }, { status: 400 });
      }
    }

    connection = await getDatabase();

    // Insert article into authors_articles table
    const insertValues = [
      authorId,
      title,
      abstract,
      keywords || null,
      content || null,
      JSON.stringify(authors || []), // always a valid JSON string
      affiliation || null,
      articleType || null,
      manuscriptFile ? manuscriptFile.name : null,
      null,
      status
    ];
    console.log('Insert values:', insertValues);

    const [result] = await connection.execute(
      `INSERT INTO authors_articles 
       (author_id, title, abstract, keywords, content, authors, affiliation, article_type, manuscript_file_name, manuscript_file_path, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      insertValues
    ) as [any, any];

    const insertedId = result.insertId as number;
    console.log('Inserted article ID:', insertedId);

    if (manuscriptFile && manuscriptFile.size > 0) {
      const bytes = await manuscriptFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'articles', insertedId.toString());
      await mkdir(uploadsDir, { recursive: true });

      const ts = Date.now();
      const sanitized = sanitizeFileName(manuscriptFile.name);
      const uniqueFileName = `${ts}-manuscript-${sanitized}`;
      const filePath = join(uploadsDir, uniqueFileName);
      await writeFile(filePath, buffer);

      const fileUrl = `/uploads/articles/${insertedId}/${uniqueFileName}`;

      await connection.execute(
        'UPDATE authors_articles SET manuscript_file_name = ?, manuscript_file_path = ? WHERE id = ?',
        [manuscriptFile.name, fileUrl, insertedId]
      );
      console.log('Manuscript file saved to:', fileUrl);
    }

    if (coverLetterFile && coverLetterFile.size > 0) {
      const bytes = await coverLetterFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'articles', insertedId.toString());
      await mkdir(uploadsDir, { recursive: true });

      const ts = Date.now();
      const sanitized = sanitizeFileName(coverLetterFile.name);
      const uniqueFileName = `${ts}-cover-letter-${sanitized}`;
      const filePath = join(uploadsDir, uniqueFileName);
      await writeFile(filePath, buffer);

      const fileUrl = `/uploads/articles/${insertedId}/${uniqueFileName}`;

      let nextContent: any = null;
      try {
        nextContent = content && typeof content === 'string' && content.trim() ? JSON.parse(content) : {};
      } catch {
        nextContent = {};
      }
      if (!nextContent || typeof nextContent !== 'object') nextContent = {};
      if (!nextContent.declarations || typeof nextContent.declarations !== 'object') nextContent.declarations = {};
      nextContent.declarations.coverLetterFileName = coverLetterFile.name;
      nextContent.declarations.coverLetterFileUrl = fileUrl;

      await connection.execute(
        'UPDATE authors_articles SET content = ? WHERE id = ?',
        [JSON.stringify(nextContent), insertedId]
      );

      console.log('Cover letter file saved to:', fileUrl);
    }

    // Get the created article
    const [newArticles] = await connection.execute(
      `SELECT aa.*, u.full_name as author_name, u.email as author_email, u.phone as author_phone
       FROM authors_articles aa
       JOIN users u ON aa.author_id = u.id
       WHERE aa.id = ?`,
      [insertedId]
    ) as [any[], any];

    const newArticle = newArticles[0];
    newArticle.authors = newArticle.authors ? JSON.parse(newArticle.authors) : null;

    return NextResponse.json({
      message: 'Article submitted successfully',
      article: newArticle
    });

  } catch (error) {
    console.error('Article submission error:', error);
    const err = error as any;
    return NextResponse.json(
      {
        error: 'Internal server error',
        details:
          process.env.NODE_ENV !== 'production'
            ? {
                message: err?.message ?? String(err),
                code: err?.code,
                stack: err?.stack,
              }
            : undefined,
      },
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
