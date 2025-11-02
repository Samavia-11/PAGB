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
    const displayByKey: Record<string, string> = {};
    const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
    for (const ent of entries) {
      if (ent.isFile() && /\.pdf$/i.test(ent.name)) {
        const nameNoExt = ent.name.replace(/\.pdf$/i, '');
        const parts = nameNoExt.split('___');
        const authorRaw = (parts.length > 1 ? parts[1] : nameNoExt).trim();
        if (authorRaw) {
          const key = normalize(authorRaw);
          counts[key] = (counts[key] || 0) + 1;
          if (!displayByKey[key]) displayByKey[key] = authorRaw.replace(/\s+/g, ' ').trim();
        }
      }
    }
    // Also find the PDF URL for each author
    const authorPdfs: Record<string, string> = {};
    for (const ent of entries) {
      if (ent.isFile() && /\.pdf$/i.test(ent.name)) {
        const nameNoExt = ent.name.replace(/\.pdf$/i, '');
        const parts = nameNoExt.split('___');
        const authorRaw = (parts.length > 1 ? parts[1] : nameNoExt).trim();
        if (authorRaw) {
          const key = normalize(authorRaw);
          if (!authorPdfs[key]) {
            authorPdfs[key] = `/Authorsname/${encodeURIComponent(ent.name)}`;
          }
        }
      }
    }

    const authors = Object.keys(counts)
      .map((key) => ({ 
        slug: displayByKey[key], 
        name: displayByKey[key], 
        count: counts[key],
        pdfUrl: authorPdfs[key] || ''
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ authors });
  } catch (e: any) {
    return NextResponse.json({ authors: [], error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
