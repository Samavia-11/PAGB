import { NextResponse } from 'next/server';
import { pagbQuery } from '@/lib/pagbDb';

export async function GET() {
  try {
    // Best-effort: if tables do not exist yet, return empty.
    try {
      const rows = await pagbQuery<any[]>(
        `SELECT b.*, COALESCE(COUNT(ba.id), 0) AS article_count
         FROM books b
         LEFT JOIN book_articles ba ON ba.book_id = b.id
         WHERE b.status IN ('published', 'archived')
         GROUP BY b.id
         ORDER BY b.edition_year DESC, b.created_at DESC, b.id DESC`
      );
      return NextResponse.json({ books: rows || [] });
    } catch {
      return NextResponse.json({ books: [] });
    }
  } catch (e: any) {
    return NextResponse.json({ books: [], error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
