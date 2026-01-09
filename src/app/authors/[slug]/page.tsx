// app/authors/[slug]/page.tsx

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { FileText, ArrowLeft } from 'lucide-react';

interface Props {
  params: { slug: string };
  searchParams?: { articleId?: string };
}

interface Article {
  id: number;
  title: string;
  manuscript_file_path: string | null;
}

export default async function AuthorPage({ params, searchParams }: Props) {
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
    id: Number(a.id),
    title: String(a.title || ''),
    manuscript_file_path: a.manuscript_file_path ?? null,
  }));

  if (authorArticles.length === 0) {
    notFound();
  }

  const authorName = data.author?.name || 'Author';

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

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="font-semibold text-gray-900">Articles</div>
            <div className="text-sm text-gray-600">{authorArticles.length} total</div>
          </div>
          <div className="divide-y divide-gray-200">
            {authorArticles.map((article) => (
              <a
                key={article.id}
                href={article.manuscript_file_path || '#'}
                target="_blank"
                rel="noreferrer"
                className="block p-4 hover:bg-gray-50"
              >
                <div className="flex gap-3">
                  <div className="w-12 h-16 bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                    <img
                      src={'/images/icon.png'}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 line-clamp-2">{article.title}</div>
                    <div className="mt-2">
                      <span className="inline-flex items-center text-xs font-medium text-green-700">
                        Open PDF →
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-gray-400">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
              </a>
            ))}
          </div>
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