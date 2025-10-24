import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function isPdf(name: string) {
  return /\.pdf$/i.test(name);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const author = (searchParams.get('author') || '').trim();

    if (!author) {
      return NextResponse.json({ files: [], count: 0, error: 'Missing author' }, { status: 400 });
    }

    const baseDir = path.join(process.cwd(), 'public', 'authorsname');

    if (!fs.existsSync(baseDir)) {
      return NextResponse.json({ files: [], count: 0 });
    }

    const entries = fs.readdirSync(baseDir, { withFileTypes: true });
    const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
    const canon = (s: string) => normalize(s).normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, ' ').replace(/\s+/g, ' ').trim();
    const target = normalize(author);
    const targetCanon = canon(author);
    const pdfs = entries
      .filter((ent) => ent.isFile() && isPdf(ent.name))
      .map((ent) => {
        const filename = ent.name;
        const nameNoExt = filename.replace(/\.pdf$/i, '');
        const parts = nameNoExt.split('___');
        const derivedAuthor = (parts.length > 1 ? parts[1] : nameNoExt).trim();
        const title = nameNoExt; // show entire name without extension
        const url = `/authorsname/${encodeURIComponent(filename)}`;
        return { filename, title, derivedAuthor, url };
      })
      .filter((item) => {
        const a = normalize(item.derivedAuthor);
        const ac = canon(item.derivedAuthor);
        return a === target || ac === targetCanon || a.includes(target) || target.includes(a);
      })
      .map((item) => ({
        title: item.title,
        author,
        date: '',
        description: '',
        published: '',
        pdfUrl: item.url,
        thumbnail: '/images/thumbnails/article-generic.jpg',
      }));

    return NextResponse.json({ files: pdfs, count: pdfs.length });
  } catch (e: any) {
    return NextResponse.json({ files: [], count: 0, error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
