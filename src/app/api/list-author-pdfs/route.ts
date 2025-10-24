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

    const baseDir = path.join(process.cwd(), 'public', 'authors', author);

    if (!fs.existsSync(baseDir)) {
      return NextResponse.json({ files: [], count: 0 });
    }

    const entries = fs.readdirSync(baseDir, { withFileTypes: true });
    const pdfs = entries
      .filter((ent) => ent.isFile() && isPdf(ent.name))
      .map((ent) => {
        const filename = ent.name;
        const title = filename.replace(/\.pdf$/i, '');
        const url = `/authors/${encodeURIComponent(author)}/${encodeURIComponent(filename)}`;
        return {
          title,
          author,
          date: '',
          description: '',
          published: '',
          pdfUrl: url,
          thumbnail: '/images/thumbnails/article-generic.jpg',
        };
      });

    return NextResponse.json({ files: pdfs, count: pdfs.length });
  } catch (e: any) {
    return NextResponse.json({ files: [], count: 0, error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
