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
}

function toInt(value: unknown) {
  const n = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : NaN;
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const bookId = toInt(id);
  if (!bookId) return NextResponse.json({ error: 'Invalid book id' }, { status: 400 });

  let connection: mysql.Connection | null = null;
  try {
    connection = await getDatabase();
    await ensureBooksTables(connection);

    const [books] = (await connection.execute('SELECT * FROM books WHERE id = ? LIMIT 1', [bookId])) as [any[], any];
    const book = books?.[0] || null;
    if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 });

    const [articles] = (await connection.execute(
      `SELECT ba.id as book_article_id,
              ba.book_id,
              ba.article_id,
              ba.sort_order,
              ba.title as book_article_title,
              ba.author_id as book_article_author_id,
              ba.cover_page_path,
              aa.title as article_title,
              aa.abstract as article_abstract,
              aa.status as article_status,
              aa.manuscript_file_name,
              aa.manuscript_file_path,
              u.full_name as author_name,
              u.email as author_email,
              u.phone as author_phone
       FROM book_articles ba
       LEFT JOIN authors_articles aa ON aa.id = ba.article_id
       LEFT JOIN users u ON u.id = aa.author_id
       WHERE ba.book_id = ?
       ORDER BY ba.sort_order ASC, ba.id ASC`,
      [bookId]
    )) as [any[], any];

    return NextResponse.json({ book, articles: articles || [] });
  } catch (e: any) {
    console.error('Get book error:', e);
    return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const forbidden = requireRole(request, ['administrator']);
  if (forbidden) return forbidden;

  const { id } = await context.params;
  const bookId = toInt(id);
  if (!bookId) return NextResponse.json({ error: 'Invalid book id' }, { status: 400 });

  let connection: mysql.Connection | null = null;
  try {
    connection = await getDatabase();
    await ensureBooksTables(connection);

    const [res] = (await connection.execute('DELETE FROM books WHERE id = ?', [bookId])) as [any, any];
    if (Number(res?.affectedRows || 0) === 0) return NextResponse.json({ error: 'Book not found' }, { status: 404 });

    return NextResponse.json({ message: 'Book deleted' });
  } catch (e: any) {
    console.error('Delete book error:', e);
    return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 });
  }
}
