import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function isPdf(name: string) {
  return /\.pdf$/i.test(name);
}

function extractAuthor(filename: string): string {
  // Remove .pdf extension
  const nameNoExt = filename.replace(/\.pdf$/i, '');
  
  // Extract author from format: "PAGB 2024 (X)___Author Name"
  const parts = nameNoExt.split('___');
  if (parts.length > 1) {
    return parts[1].trim().toLowerCase();
  }
  
  return nameNoExt.toLowerCase();
}

export async function GET() {
  try {
    let publishedArticles = 0;
    let activeAuthors = 0;
    let issuesPublished = 0;

    // Count articles in authors directory
    const authorsDir = path.join(process.cwd(), 'public', 'authors');
    if (fs.existsSync(authorsDir)) {
      const entries = fs.readdirSync(authorsDir, { withFileTypes: true });
      const pdfFiles = entries.filter((ent) => ent.isFile() && isPdf(ent.name));
      
      publishedArticles = pdfFiles.length;
      
      // Count unique authors
      const authorSet = new Set<string>();
      pdfFiles.forEach((file) => {
        const author = extractAuthor(file.name);
        if (author && author !== 'various contributors') {
          authorSet.add(author);
        }
      });
      activeAuthors = authorSet.size;
    }

    // Count issues in pdfs directory
    const pdfsDir = path.join(process.cwd(), 'public', 'pdfs');
    if (fs.existsSync(pdfsDir)) {
      const issueFolders = fs.readdirSync(pdfsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory());
      
      // Count folders that contain at least one PDF
      issuesPublished = issueFolders.reduce((acc, dirent) => {
        try {
          const folderPath = path.join(pdfsDir, dirent.name);
          const hasPdf = fs
            .readdirSync(folderPath, { withFileTypes: true })
            .some((f) => f.isFile() && isPdf(f.name));
          return acc + (hasPdf ? 1 : 0);
        } catch {
          return acc;
        }
      }, 0);
    }

    return NextResponse.json({ 
      publishedArticles, 
      activeAuthors, 
      issuesPublished 
    });
  } catch (e: any) {
    return NextResponse.json({ 
      publishedArticles: 0, 
      activeAuthors: 0, 
      issuesPublished: 0, 
      error: e?.message || 'Unexpected error' 
    }, { status: 500 });
  }
}
