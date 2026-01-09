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

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const forbidden = requireRole(request, ['administrator']);
  if (forbidden) return forbidden;

  const { id } = await context.params;
  const bookId = toInt(id);
  if (!bookId) return NextResponse.json({ error: 'Invalid book id' }, { status: 400 });

  let connection: mysql.Connection | null = null;
  try {
    connection = await getDatabase();
    await ensureBooksTables(connection);

    await connection.beginTransaction();

    const [rows] = (await connection.execute(
      'SELECT id, status, is_current, featured_rank FROM books WHERE id = ? LIMIT 1',
      [bookId]
    )) as [any[], any];

    const book = rows?.[0];
    if (!book) {
      await connection.rollback();
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Rotate featured order: keep only top 2 on the landing page.
    // New current book becomes rank 0; previous rank 0 -> rank 1; previous rank 1 -> archived (rank 2, is_current=0)

    await connection.execute('UPDATE books SET is_current = 0 WHERE is_current = 1');

    await connection.execute(
      `UPDATE books
       SET featured_rank = featured_rank + 1,
           is_current = 0,
           status = status
       WHERE status IN ('published', 'archived')
         AND id <> ?`,
      [bookId]
    );

    await connection.execute(
      `UPDATE books
       SET status = 'published',
           is_current = 1,
           featured_rank = 0,
           published_at = COALESCE(published_at, NOW())
       WHERE id = ?`,
      [bookId]
    );

    // Ensure all included articles become publicly visible.
    // Public endpoints filter on aa.status = 'published'.
    await connection.execute(
      `UPDATE authors_articles aa
       JOIN book_articles ba ON ba.article_id = aa.id
       SET aa.status = 'published',
           aa.last_updated = NOW()
       WHERE ba.book_id = ?`,
      [bookId]
    );

    await connection.commit();

    const [outRows] = (await connection.execute(
      'SELECT * FROM books WHERE id = ? LIMIT 1',
      [bookId]
    )) as [any[], any];

    return NextResponse.json({ book: outRows?.[0] || null });
  } catch (e: any) {
    try {
      await connection?.rollback();
    } catch {
      // ignore
    }
    console.error('Publish book error:', e);
    return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 });
  }
}
