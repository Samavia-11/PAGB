import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || '2024';

    const baseDir = path.join(process.cwd(), 'public', 'pdfs', folder);

    if (!fs.existsSync(baseDir)) {
      return NextResponse.json({ files: [], error: 'Folder not found' }, { status: 404 });
    }

    const entries = fs.readdirSync(baseDir, { withFileTypes: true });
    const pdfs = entries
      .filter((ent) => ent.isFile() && /\.pdf$/i.test(ent.name))
      .map((ent) => {
        const filename = ent.name;
        const title = filename.replace(/\.pdf$/i, '');
        const url = `/pdfs/${encodeURIComponent(folder)}/${encodeURIComponent(filename)}`;
        return {
          title,
          author: 'Various Contributors',
          date: folder,
          description: '',
          published: folder,
          pdfUrl: url,
          thumbnail: '/images/thumbnails/article-generic.jpg',
        };
      });

    return NextResponse.json({ files: pdfs });
  } catch (e: any) {
    return NextResponse.json({ files: [], error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
