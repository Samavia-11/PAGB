import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const baseDir = path.join(process.cwd(), 'public', 'authorsname');
    if (!fs.existsSync(baseDir)) {
      return NextResponse.json({ authors: [] });
    }
    const entries = fs.readdirSync(baseDir, { withFileTypes: true });
    const counts: Record<string, number> = {};
    for (const ent of entries) {
      if (ent.isFile() && /\.pdf$/i.test(ent.name)) {
        const match = ent.name.split('___')[1];
        const author = (match || '').replace(/\.pdf$/i, '').trim();
        if (author) counts[author] = (counts[author] || 0) + 1;
      }
    }
    const authors = Object.keys(counts)
      .map((name) => ({ slug: name, name, count: counts[name] }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ authors });
  } catch (e: any) {
    return NextResponse.json({ authors: [], error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
