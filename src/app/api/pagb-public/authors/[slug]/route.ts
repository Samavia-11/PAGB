import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
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

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const users = (await query(
      `SELECT id, full_name
       FROM users
       WHERE role = 'author' AND full_name IS NOT NULL AND full_name <> ''`
    )) as any[];

    const matched = (users || []).find((u) => slugify(String(u.full_name || '')) === slug);

    if (matched) {
      const author = {
        id: Number(matched.id),
        name: String(matched.full_name),
        slug,
      };

      // Get articles linked to user ID
      const userArticles = (await query(
        `SELECT aa.id,
                aa.title,
                aa.abstract,
                aa.keywords,
                aa.content,
                aa.authors,
                aa.affiliation,
                aa.article_type,
                aa.manuscript_file_name,
                aa.manuscript_file_path,
                aa.status,
                aa.submission_date,
                aa.last_updated
         FROM authors_articles aa
         WHERE aa.author_id = ? AND aa.status = 'published'
         ORDER BY aa.submission_date DESC, aa.id DESC`,
        [author.id]
      )) as any[];

      // Also get articles where author name appears in the authors JSON
      const allRows = (await query(
        `SELECT aa.id,
                aa.title,
                aa.abstract,
                aa.keywords,
                aa.content,
                aa.authors,
                aa.affiliation,
                aa.article_type,
                aa.manuscript_file_name,
                aa.manuscript_file_path,
                aa.status,
                aa.submission_date,
                aa.last_updated
         FROM authors_articles aa
         WHERE aa.status = 'published'
         ORDER BY aa.submission_date DESC, aa.id DESC`
      )) as any[];

      const jsonArticles = (allRows || []).filter((r) => {
        const names = extractAllAuthorNames(r?.authors);
        return names.some((n) => slugify(String(n || '')) === slug);
      });

      // Combine both sets of articles, avoiding duplicates
      const allArticles = [...userArticles || []];
      const existingIds = new Set(allArticles.map(a => a.id));
      
      for (const article of jsonArticles || []) {
        if (!existingIds.has(article.id)) {
          allArticles.push(article);
        }
      }

      return NextResponse.json({ author, articles: allArticles });
    }

    // Fallback: author name not present in users table. Match against authors_articles.authors JSON.
    const rows = (await query(
      `SELECT aa.id,
              aa.title,
              aa.abstract,
              aa.keywords,
              aa.content,
              aa.authors,
              aa.affiliation,
              aa.article_type,
              aa.manuscript_file_name,
              aa.manuscript_file_path,
              aa.status,
              aa.submission_date,
              aa.last_updated
       FROM authors_articles aa
       WHERE aa.status = 'published'
       ORDER BY aa.submission_date DESC, aa.id DESC`
    )) as any[];

    const matchedArticles = (rows || []).filter((r) => {
      const names = extractAllAuthorNames(r?.authors);
      return names.some((n) => slugify(String(n || '')) === slug);
    });

    if (matchedArticles.length === 0) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }

    const displayName =
      extractAllAuthorNames(matchedArticles?.[0]?.authors).find((n) => slugify(String(n || '')) === slug) || slug;

    const author = {
      id: null,
      name: String(displayName),
      slug,
    };

    return NextResponse.json({ author, articles: matchedArticles });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}
