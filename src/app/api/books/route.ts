import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import mysql from 'mysql2/promise';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { isAllowedFileType, isFileSizeValid, sanitizeFileName } from '@/lib/security';

function requireRole(request: NextRequest, roles: string[]) {
  const role = request.headers.get('x-user-role');
  const userId = request.headers.get('x-user-id');
  if (!userId || !role || !roles.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

async function ensureBooksTables(connection: mysql.Connection) {
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS books (
      id INT PRIMARY KEY AUTO_INCREMENT,
      editor_id INT NULL,
      title VARCHAR(255) NOT NULL,
      edition_year INT NOT NULL,
      cover_image_name VARCHAR(255) NULL,
      cover_image_path VARCHAR(255) NULL,
      author_list TEXT NULL,
      status ENUM('submitted','published','archived') NOT NULL DEFAULT 'submitted',
      featured_rank INT NOT NULL DEFAULT 0,
      is_current TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      published_at DATETIME NULL,
      INDEX idx_books_edition_year (edition_year),
      INDEX idx_books_status (status),
      INDEX idx_books_featured_rank (featured_rank),
      INDEX idx_books_is_current (is_current)
    )
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS book_articles (
      id INT PRIMARY KEY AUTO_INCREMENT,
      book_id INT NOT NULL,
      article_id INT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      title VARCHAR(255) NULL,
      author_id INT NULL,
      cover_page_path VARCHAR(255) NULL,
      content LONGTEXT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_book_articles_book_id (book_id),
      INDEX idx_book_articles_article_id (article_id),
      INDEX idx_book_articles_sort_order (sort_order),
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    )
  `);

  try {
    await connection.execute(
      'ALTER TABLE book_articles ADD CONSTRAINT fk_book_articles_article_id FOREIGN KEY (article_id) REFERENCES authors_articles(id) ON DELETE CASCADE'
    );
  } catch (e: any) {
    if (e?.code !== 'ER_CANT_CREATE_TABLE' && e?.code !== 'ER_DUP_KEYNAME' && e?.code !== 'ER_DUP_FIELDNAME' && e?.code !== 'ER_DUP_KEY') {
      // best-effort; ignore if already exists or cannot be created
    }
  }
}

type BookListRow = {
  id: number;
  editor_id: number | null;
  title: string;
  edition_year: number;
  cover_image_name: string | null;
  cover_image_path: string | null;
  author_list: string | null;
  status: 'submitted' | 'published' | 'archived';
  featured_rank: number;
  is_current: number;
  created_at: string;
  published_at: string | null;
  article_count: number;
};

export async function GET(request: NextRequest) {
  const forbidden = requireRole(request, ['editor', 'administrator']);
  if (forbidden) return forbidden;

  let connection: mysql.Connection | null = null;
  try {
    const role = request.headers.get('x-user-role');
    const userId = request.headers.get('x-user-id');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    connection = await getDatabase();
    await ensureBooksTables(connection);

    const params: any[] = [];
    const conditions: string[] = [];

    if (status && ['submitted', 'published', 'archived'].includes(status)) {
      conditions.push('b.status = ?');
      params.push(status);
    }

    if (role === 'editor' && userId) {
      conditions.push('b.editor_id = ?');
      params.push(Number(userId));
    }

    let sql = `
      SELECT b.*, COALESCE(COUNT(ba.id), 0) as article_count
      FROM books b
      LEFT JOIN book_articles ba ON ba.book_id = b.id
    `;

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += `
      GROUP BY b.id
      ORDER BY b.featured_rank ASC,
               b.is_current DESC,
               b.edition_year DESC,
               b.created_at DESC,
               b.id DESC
    `;

    const [rows] = (await connection.execute(sql, params)) as [BookListRow[], any];
    return NextResponse.json({ books: rows || [] });
  } catch (error: any) {
    console.error('Get books error:', error);
    return NextResponse.json({ books: [], error: error?.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const forbidden = requireRole(request, ['editor', 'administrator']);
  if (forbidden) return forbidden;

  let connection: mysql.Connection | null = null;

  try {
    const role = request.headers.get('x-user-role');
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Content-Type must be multipart/form-data' }, { status: 400 });
    }

    const formData = await request.formData();

    const title = String(formData.get('title') || '').trim();
    const editionYearRaw = String(formData.get('editionYear') || '').trim();
    const articleIdsRaw = String(formData.get('articleIds') || '').trim();
    const articleMetaRaw = String(formData.get('articleMeta') || '').trim();

    if (!title) {
      return NextResponse.json({ error: 'Missing required fields: title' }, { status: 400 });
    }

    const editionYear = Number(editionYearRaw);
    if (!Number.isFinite(editionYear) || editionYear < 1900 || editionYear > 3000) {
      return NextResponse.json({ error: 'editionYear is invalid' }, { status: 400 });
    }

    let articleIds: number[] = [];
    if (articleIdsRaw) {
      try {
        const parsed = JSON.parse(articleIdsRaw);
        if (Array.isArray(parsed)) {
          articleIds = parsed.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0);
        }
      } catch {
        return NextResponse.json({ error: 'articleIds must be a JSON array of numbers' }, { status: 400 });
      }
    }

    const articleMetaById = new Map<number, { title?: string | null }>();
    if (articleMetaRaw) {
      try {
        const parsed = JSON.parse(articleMetaRaw);
        if (Array.isArray(parsed)) {
          for (const x of parsed) {
            const id = Number(x?.articleId);
            if (!Number.isFinite(id) || id <= 0) continue;
            const t = typeof x?.title === 'string' ? x.title.trim() : null;
            articleMetaById.set(id, { title: t || null });
          }
        }
      } catch {
        return NextResponse.json({ error: 'articleMeta must be a JSON array' }, { status: 400 });
      }
    }

    if (articleIds.length === 0) {
      return NextResponse.json({ error: 'Please provide at least one articleId' }, { status: 400 });
    }

    const cover = formData.get('cover');
    const coverFile = cover instanceof File ? cover : null;

    if (coverFile && coverFile.size > 0) {
      const typeCheck = isAllowedFileType(coverFile);
      if (!typeCheck.valid) return NextResponse.json({ error: typeCheck.error }, { status: 400 });

      const sizeCheck = isFileSizeValid(coverFile);
      if (!sizeCheck.valid) return NextResponse.json({ error: sizeCheck.error }, { status: 400 });
    }

    connection = await getDatabase();
    await ensureBooksTables(connection);

    await connection.beginTransaction();

    const editorId = role === 'editor' ? Number(userId) : null;

    const [insertRes] = (await connection.execute(
      `INSERT INTO books (editor_id, title, edition_year, cover_image_name, cover_image_path, author_list, status, featured_rank, is_current)
       VALUES (?, ?, ?, NULL, NULL, NULL, 'submitted', 0, 0)`,
      [editorId, title, editionYear]
    )) as [any, any];

    const bookId = Number(insertRes.insertId);

    let coverImageName: string | null = null;
    let coverImagePath: string | null = null;

    if (coverFile && coverFile.size > 0) {
      const bytes = await coverFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'books', bookId.toString());
      await mkdir(uploadsDir, { recursive: true });

      const ts = Date.now();
      const sanitized = sanitizeFileName(coverFile.name);
      const uniqueFileName = `${ts}-cover-${sanitized}`;
      const filePath = join(uploadsDir, uniqueFileName);
      await writeFile(filePath, buffer);

      coverImageName = coverFile.name;
      coverImagePath = `/uploads/books/${bookId}/${uniqueFileName}`;

      await connection.execute(
        'UPDATE books SET cover_image_name = ?, cover_image_path = ? WHERE id = ?',
        [coverImageName, coverImagePath, bookId]
      );
    }

    const placeholders = articleIds.map(() => '?').join(',');
    const [articleRows] = (await connection.execute(
      `SELECT id, author_id, title, content
       FROM authors_articles
       WHERE id IN (${placeholders})`,
      [...articleIds]
    )) as [any[], any];

    const byId = new Map<number, any>();
    for (const r of articleRows || []) byId.set(Number(r.id), r);

    for (let i = 0; i < articleIds.length; i++) {
      const aid = articleIds[i];
      const row = byId.get(aid);
      if (!row) {
        await connection.rollback();
        return NextResponse.json({ error: `Article not found: ${aid}` }, { status: 400 });
      }

      let coverPagePath: string | null = null;
      const coverKey = `articleCover_${aid}`;
      const coverValue = formData.get(coverKey);
      const coverPageFile = coverValue instanceof File ? coverValue : null;

      if (coverPageFile && coverPageFile.size > 0) {
        const typeCheck = isAllowedFileType(coverPageFile);
        if (!typeCheck.valid) {
          await connection.rollback();
          return NextResponse.json({ error: typeCheck.error }, { status: 400 });
        }

        const sizeCheck = isFileSizeValid(coverPageFile);
        if (!sizeCheck.valid) {
          await connection.rollback();
          return NextResponse.json({ error: sizeCheck.error }, { status: 400 });
        }

        const bytes = await coverPageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'books', bookId.toString(), 'articles');
        await mkdir(uploadsDir, { recursive: true });

        const ts = Date.now();
        const sanitized = sanitizeFileName(coverPageFile.name);
        const uniqueFileName = `${ts}-article-${aid}-${sanitized}`;
        const filePath = join(uploadsDir, uniqueFileName);
        await writeFile(filePath, buffer);
        coverPagePath = `/uploads/books/${bookId}/articles/${uniqueFileName}`;
      }

      const customTitle = articleMetaById.get(aid)?.title || null;
      const bookArticleTitle = customTitle || row.title || null;

      await connection.execute(
        `INSERT INTO book_articles (book_id, article_id, sort_order, title, author_id, cover_page_path, content)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [bookId, aid, i, bookArticleTitle, row.author_id || null, coverPagePath, row.content || null]
      );
    }

    // Populate author_list as a JSON string of author IDs (best-effort)
    const authorIds = Array.from(new Set((articleRows || []).map((r) => Number(r.author_id)).filter((n) => Number.isFinite(n) && n > 0)));
    await connection.execute('UPDATE books SET author_list = ? WHERE id = ?', [JSON.stringify(authorIds), bookId]);

    await connection.commit();

    return NextResponse.json({
      book: {
        id: bookId,
        editor_id: editorId,
        title,
        edition_year: editionYear,
        cover_image_name: coverImageName,
        cover_image_path: coverImagePath,
        status: 'submitted',
      },
    });
  } catch (error: any) {
    try {
      await connection?.rollback();
    } catch {
      // ignore
    }

    console.error('Create book error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
