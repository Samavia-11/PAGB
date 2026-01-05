// app/authors/[slug]/page.tsx

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { FileText, ArrowLeft } from 'lucide-react';

interface Props {
  params: { slug: string };
}

interface Article {
  title: string;
  author: string;
  authorSlug: string;
  pdfUrl: string;
  fileName: string;
  year: string;
  monthYear: string;
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = params;

  // Build absolute URL for the API (server components require absolute URLs)
  const hdrs = await headers();
  const host = hdrs.get('host') || 'localhost:3000';
  const protocol = host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  // Fetch author + their articles from the new DB-backed API
  const res = await fetch(`${baseUrl}/api/pagb-public/authors/${encodeURIComponent(slug)}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    notFound();
  }

  const data = await res.json();
  const authorArticles: Article[] = (data.articles || []).map((a: any) => ({
    title: a.title,
    author: a.authors || data.author?.name || 'Various Contributors',
    authorSlug: data.author?.slug || slug,
    pdfUrl: a.pdf_path || '#',
    fileName: String(a.id),
    year: String(a.year || ''),
    monthYear: a.published_at ? new Date(a.published_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '',
  }));

  if (authorArticles.length === 0) {
    notFound();
  }

  const authorName = data.author?.name || authorArticles[0].author;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-32 h-32 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-5xl font-bold shadow-2xl">
            {authorArticles.length}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-green-800">{authorName}</h1>
          <p className="text-xl text-gray-600 mt-4">
            {authorArticles.length} Published Article{authorArticles.length !== 1 ? 's' : ''}
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
          {authorArticles.map((article) => (
            <Link
              key={article.fileName}
              href={article.pdfUrl}
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
                    {article.title}
                  </h3>
                  {article.monthYear && <p className="text-sm text-gray-500 text-xs mt-1">{article.monthYear}</p>}
                  <p className="text-sm text-gray-500 text-xs mt-1">Open PDF →</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {authorArticles.length === 0 && (
          <p className="text-center text-gray-500 text-lg mt-12">
            No articles published yet.
          </p>
        )}
      </div>
    </div>
  );
}