import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function isPdf(name: string) {
  return /\.pdf$/i.test(name);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countParam = parseInt(searchParams.get('count') || '5', 10);
    const count = Number.isFinite(countParam) && countParam > 0 ? Math.min(countParam, 20) : 5;

    const baseDir = path.join(process.cwd(), 'public', 'authorsname');
    if (!fs.existsSync(baseDir)) {
      return NextResponse.json({ files: [] });
    }

    const entries = fs.readdirSync(baseDir, { withFileTypes: true });
    const all = entries
      .filter((ent) => ent.isFile() && isPdf(ent.name))
      .map((ent) => {
        const filename = ent.name;
        const nameNoExt = filename.replace(/\.pdf$/i, '');
        const parts = nameNoExt.split('___');
        const derivedAuthor = (parts.length > 1 ? parts[1] : nameNoExt).trim();
        const title = nameNoExt;
        const url = `/authorsname/${encodeURIComponent(filename)}`;
        return { filename, title, author: derivedAuthor, url };
      });

    // shuffle
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }

    const picked = all.slice(0, count).map((item) => ({
      title: item.title,
      author: item.author,
      date: '',
      description: '',
      published: '',
      pdfUrl: item.url,
      thumbnail: '/images/thumbnails/article-generic.jpg',
    }));

    return NextResponse.json({ files: picked });
  } catch (e: any) {
    return NextResponse.json({ files: [], error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
