import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
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
    if (!matched) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }

    const author = {
      id: Number(matched.id),
      name: String(matched.full_name),
      slug,
    };

    const articles = (await query(
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

    return NextResponse.json({ author, articles: articles || [] });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}
