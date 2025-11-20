// app/api/archives-all/route.ts

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const authorsDir = path.join(process.cwd(), 'public', 'authors');

    if (!fs.existsSync(authorsDir)) {
      return NextResponse.json({ articles: [] });
    }

    const authorFolders = fs.readdirSync(authorsDir).filter(folder => {
      return fs.statSync(path.join(authorsDir, folder)).isDirectory();
    });

    const allArticles: any[] = [];

    for (const folder of authorFolders) {
      const authorPath = path.join(authorsDir, folder);
      const pdfFiles = fs.readdirSync(authorPath).filter(f => f.toLowerCase().endsWith('.pdf'));

      const authorName = folder
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      for (const file of pdfFiles) {
        const cleanTitle = file
          .replace('.pdf', '')
          .replace(/_/g, ' ')
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());

        allArticles.push({
          title: cleanTitle,
          author: authorName,
          authorSlug: folder,
          pdfUrl: `/authors/${folder}/${file}`,
          fileName: file,
        });
      }
    }

    // Sort by title
    allArticles.sort((a, b) => a.title.localeCompare(b.title));

    return NextResponse.json({ articles: allArticles });
  } catch (error) {
    console.error('Archives API error:', error);
    return NextResponse.json({ articles: [] });
  }
}