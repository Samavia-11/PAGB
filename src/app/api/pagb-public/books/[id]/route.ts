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

function hashSlugToId(slug: string) {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) || 1;
}

function extractAllAuthorNames(raw: unknown) {
  const text = typeof raw === 'string' ? raw : raw == null ? '' : String(raw);
  if (!text.trim()) return [] as string[];
  try {
    const parsed = JSON.parse(text);
    const out: string[] = [];
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (typeof item === 'string') {
          const n = item.trim();
          if (n) out.push(n);
          continue;
        }
        if (typeof item === 'object' && item) {
          const n = typeof (item as any).name === 'string' ? String((item as any).name).trim() : '';
          if (n) out.push(n);
        }
      }
    }
    return out;
  } catch {
    return [] as string[];
  }
}

function extractFirstAuthorName(raw: unknown) {
  const text = typeof raw === 'string' ? raw : raw == null ? '' : String(raw);
  if (!text.trim()) return null;
  try {
    const parsed = JSON.parse(text);
    const first = Array.isArray(parsed) ? parsed[0] : null;
    if (!first) return null;
    if (typeof first === 'string') return first.trim() || null;
    if (typeof first === 'object' && first) {
      const name = (first as any).name;
      return typeof name === 'string' && name.trim() ? name.trim() : null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const bookId = toInt(id);
    if (!bookId) return NextResponse.json({ error: 'Invalid book id' }, { status: 400 });

    const books = (await query(
      `SELECT *
       FROM books
       WHERE id = ? AND status IN ('published', 'archived')
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

    for (const a of articles || []) {
      const override = extractFirstAuthorName(a.article_authors);
      if (override) {
        a.author_name = override;
        a.author_id = null;
      }
    }

    const authorMap = new Map<string, { id: number; name: string; slug: string; article_count: number }>();
    for (const a of articles || []) {
      const names = extractAllAuthorNames(a.article_authors);
      const fallback = String(a.author_name || '').trim();
      if (names.length === 0 && fallback) names.push(fallback);

      for (const name of names) {
        const n = String(name || '').trim();
        if (!n) continue;
        const s = slugify(n);
        if (!s) continue;
        const existing = authorMap.get(s);
        if (existing) {
          existing.article_count += 1;
        } else {
          authorMap.set(s, {
            id: hashSlugToId(s),
            name: n,
            slug: s,
            article_count: 1,
          });
        }
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
