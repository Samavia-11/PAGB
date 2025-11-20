// app/authors/[slug]/page.tsx

import Link from 'next/link';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import { FileText, ArrowLeft } from 'lucide-react';

interface Props {
  params: { slug: string };
}

export const dynamicParams = true; // This allows new authors without rebuild

export async function generateStaticParams() {
  const authorsDir = path.join(process.cwd(), 'public', 'authors');
  if (!fs.existsSync(authorsDir)) return [];

  const folders = fs.readdirSync(authorsDir).filter((name) => {
    return fs.statSync(path.join(authorsDir, name)).isDirectory();
  });

  return folders.map((folder) => ({ slug: folder }));
}

export default function AuthorPage({ params }: Props) {
  const { slug } = params;

  // Convert slug to readable name: barister-ahmer-bilal → Barister Ahmer Bilal
  const authorName = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const authorFolder = path.join(process.cwd(), 'public', 'authors', slug);

  // 404 if author folder doesn't exist
  if (!fs.existsSync(authorFolder)) {
    notFound();
  }

  const pdfFiles = fs
    .readdirSync(authorFolder)
    .filter((file) => file.toLowerCase().endsWith('.pdf'))
    .sort();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-32 h-32 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-5xl font-bold shadow-2xl">
            {pdfFiles.length}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-green-800">{authorName}</h1>
          <p className="text-xl text-gray-600 mt-4">
            {pdfFiles.length} Published Article{pdfFiles.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center text-green-700 hover:text-green-900 font-medium mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>

        {/* Articles List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pdfFiles.map((file) => {
            const pdfUrl = `/authors/${slug}/${encodeURIComponent(file)}`;

            // Clean title from filename
            const title = file
              .replace('.pdf', '')
              .replace(/_/g, ' ')
              .replace(/-/g, ' ')
              .replace(/\b\w/g, (l) => l.toUpperCase());

            return (
              <Link
                key={file}
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition">
                    <FileText className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 line-clamp-2">
                      {title}
                    </h3>
                    <p className="text-sm text-gray-500 text-xs mt-1">Open PDF →</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {pdfFiles.length === 0 && (
          <p className="text-center text-gray-500 text-lg mt-12">
            No articles published yet.
          </p>
        )}
      </div>
    </div>
  );
}