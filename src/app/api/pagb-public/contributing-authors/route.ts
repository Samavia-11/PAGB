import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

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

export async function GET() {
  try {
    const rows = (await query(
      `SELECT aa.authors, u.full_name as author_name
       FROM authors_articles aa
       LEFT JOIN users u ON u.id = aa.author_id
       WHERE aa.status = 'published'`
    )) as any[];

    const map = new Map<string, { id: number; name: string; slug: string; article_count: number }>();

    for (const r of rows || []) {
      const names = extractAllAuthorNames(r?.authors);
      if (names.length === 0 && typeof r?.author_name === 'string' && String(r.author_name).trim()) {
        names.push(String(r.author_name).trim());
      }
      for (const name of names) {
        const n = String(name || '').trim();
        if (!n) continue;
        const s = slugify(n);
        if (!s) continue;
        const existing = map.get(s);
        if (existing) {
          existing.article_count += 1;
        } else {
          map.set(s, {
            id: hashSlugToId(s),
            name: n,
            slug: s,
            article_count: 1,
          });
        }
      }
    }

    const authors = Array.from(map.values()).sort((a, b) => {
      if (b.article_count !== a.article_count) return b.article_count - a.article_count;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({ authors });
  } catch (e: any) {
    return NextResponse.json({ authors: [], error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
