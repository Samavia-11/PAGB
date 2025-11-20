// app/api/list-authors/route.ts   ← make sure the file is exactly at this path

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // CORRECT folder: public/authors (not authorsname)
    const authorsDir = path.join(process.cwd(), 'public', 'authors');

    if (!fs.existsSync(authorsDir)) {
      return NextResponse.json({ authors: [] });
    }

    const folders = fs
      .readdirSync(authorsDir)
      .filter(name => fs.statSync(path.join(authorsDir, name)).isDirectory());

    const authors = folders.map(folder => {
      const folderPath = path.join(authorsDir, folder);
      const pdfs = fs.readdirSync(folderPath).filter(f => f.toLowerCase().endsWith('.pdf'));

      // Convert "adnan-ali" → "Adnan Ali"
      const name = folder
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        slug: folder,           // ← kebab-case (used in URL)
        name: name,             // ← pretty name for display
        count: pdfs.length,     // ← number of PDFs
      };
    });

    // Sort by most articles first
    authors.sort((a, b) => b.count - a.count);

    return NextResponse.json({ authors });
  } catch (error: any) {
    console.error('list-authors API error:', error);
    return NextResponse.json(
      { authors: [], error: error.message },
      { status: 500 }
    );
  }
}