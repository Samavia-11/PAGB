import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

function toInt(value: unknown) {
  const n = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : NaN;
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const bookId = toInt(id);
    if (!bookId) return NextResponse.json({ error: 'Invalid book id' }, { status: 400 });

    const books = (await query(
      `SELECT *
       FROM books
       WHERE id = ? AND status = 'published'
       LIMIT 1`,
      [bookId]
    )) as any[];

    const book = books?.[0] || null;
    if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 });

    const articles = (await query(
      `SELECT ba.id as book_article_id,
              ba.book_id,
              ba.article_id,
              ba.sort_order,
              ba.title as book_article_title,
              ba.cover_page_path,
              aa.title as article_title,
              aa.abstract as article_abstract,
              aa.keywords as article_keywords,
              aa.content as article_content,
              aa.authors as article_authors,
              aa.affiliation as article_affiliation,
              aa.article_type as article_type,
              aa.manuscript_file_path as manuscript_file_path,
              u.id as author_id,
              u.full_name as author_name
       FROM book_articles ba
       JOIN authors_articles aa ON aa.id = ba.article_id
       LEFT JOIN users u ON u.id = aa.author_id
       WHERE ba.book_id = ? AND aa.status = 'published'
       ORDER BY ba.sort_order ASC, ba.id ASC`,
      [bookId]
    )) as any[];

    const authorMap = new Map<number, { id: number; name: string; slug: string; article_count: number }>();
    for (const a of articles || []) {
      const authorId = Number(a.author_id || 0);
      const authorName = String(a.author_name || '').trim();
      if (!authorId || !authorName) continue;
      const existing = authorMap.get(authorId);
      if (existing) {
        existing.article_count += 1;
      } else {
        authorMap.set(authorId, {
          id: authorId,
          name: authorName,
          slug: slugify(authorName),
          article_count: 1,
        });
      }
    }

    const contributing_authors = Array.from(authorMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ book, articles: articles || [], contributing_authors });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}
