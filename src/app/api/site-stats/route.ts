import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const authorsDir = path.join(process.cwd(), 'public', 'authorsname');
    const issuesDir = path.join(process.cwd(), 'public', 'pdfs');

    let publishedArticles = 0;
    let activeAuthors = 0;
    let issuesPublished = 0;

    // Authors and articles
    if (fs.existsSync(authorsDir)) {
      const entries = fs.readdirSync(authorsDir, { withFileTypes: true });
      const counts: Record<string, number> = {};
      const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
      for (const ent of entries) {
        if (ent.isFile() && /\.pdf$/i.test(ent.name)) {
          publishedArticles += 1;
          const nameNoExt = ent.name.replace(/\.pdf$/i, '');
          const parts = nameNoExt.split('___');
          const authorRaw = (parts.length > 1 ? parts[1] : nameNoExt).trim();
          if (authorRaw) {
            const key = normalize(authorRaw);
            counts[key] = (counts[key] || 0) + 1;
          }
        }
      }
      activeAuthors = Object.keys(counts).length;
    }

    // Issues
    if (fs.existsSync(issuesDir)) {
      const issueFolders = fs.readdirSync(issuesDir, { withFileTypes: true }).filter((d) => d.isDirectory());
      // Count folders that contain at least one PDF
      issuesPublished = issueFolders.reduce((acc, dirent) => {
        try {
          const folderPath = path.join(issuesDir, dirent.name);
          const hasPdf = fs
            .readdirSync(folderPath, { withFileTypes: true })
            .some((f) => f.isFile() && /\.pdf$/i.test(f.name));
          return acc + (hasPdf ? 1 : 0);
        } catch {
          return acc;
        }
      }, 0);
    }

    return NextResponse.json({ publishedArticles, activeAuthors, issuesPublished });
  } catch (e: any) {
    return NextResponse.json({ publishedArticles: 0, activeAuthors: 0, issuesPublished: 0, error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
