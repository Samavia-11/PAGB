import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function isPdf(name: string) {
  return /\.pdf$/i.test(name);
}

function parseTitle(filename: string): string {
  // Remove .pdf extension
  const nameNoExt = filename.replace(/\.pdf$/i, '');
  
  // Extract title from format: "PAGB 2024 (X)___Title"
  const parts = nameNoExt.split('___');
  if (parts.length > 1) {
    return parts[1].trim();
  }
  
  // Fallback to filename without extension
  return nameNoExt;
}

function parseAuthor(filename: string): string {
  // Extract author from format: "PAGB 2024 (X)___Author Name"
  const nameNoExt = filename.replace(/\.pdf$/i, '');
  const parts = nameNoExt.split('___');
  
  if (parts.length > 1) {
    return parts[1].trim();
  }
  
  return 'Various Contributors';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countParam = parseInt(searchParams.get('count') || '6', 10);
    const count = Number.isFinite(countParam) && countParam > 0 ? Math.min(countParam, 20) : 6;

    const baseDir = path.join(process.cwd(), 'public', 'authors');
    if (!fs.existsSync(baseDir)) {
      return NextResponse.json({ files: [] });
    }

    // Get all author subdirectories
    const authorFolders = fs.readdirSync(baseDir, { withFileTypes: true })
      .filter((ent) => ent.isDirectory());

    const all: { filename: string; title: string; author: string; url: string; description: string }[] = [];

    // Scan each author folder for PDFs
    for (const folder of authorFolders) {
      const authorSlug = folder.name;
      const authorPath = path.join(baseDir, authorSlug);
      const pdfFiles = fs.readdirSync(authorPath).filter((f) => isPdf(f));

      // Convert slug to readable author name
      const authorName = authorSlug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      for (const filename of pdfFiles) {
        const title = parseTitle(filename);
        const url = `/authors/${authorSlug}/${encodeURIComponent(filename)}`;

        // Generate description based on title
        let description = '';
        if (title.toLowerCase().includes('security')) {
          description = 'An analysis of security challenges and strategic implications for Pakistan and the region.';
        } else if (title.toLowerCase().includes('afghanistan') || title.toLowerCase().includes('afghan')) {
          description = 'Examining Pakistan-Afghanistan relations and regional dynamics in South Asia.';
        } else if (title.toLowerCase().includes('military') || title.toLowerCase().includes('conflict')) {
          description = 'A comprehensive study of military strategy and conflict dynamics in the modern era.';
        } else if (title.toLowerCase().includes('policy') || title.toLowerCase().includes('diplomatic')) {
          description = 'Strategic policy analysis and diplomatic perspectives on regional and international affairs.';
        } else {
          description = 'A scholarly analysis contributing to military and strategic studies discourse.';
        }

        all.push({ filename, title, author: authorName, url, description });
      }
    }

    // Shuffle for random selection
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }

    const picked = all.slice(0, count).map((item) => ({
      title: item.title,
      author: item.author,
      date: '2024',
      description: item.description,
      published: '2024',
      pdfUrl: item.url,
      thumbnail: '/images/icon.png',
    }));

    return NextResponse.json({ files: picked });
  } catch (e: any) {
    return NextResponse.json({ files: [], error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
