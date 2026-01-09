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
  abstract: string | null;
  content: string | null;
  manuscript_file_path: string | null;
  submission_date: string | null;
}

function toInt(value: unknown) {
  const n = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : NaN;
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function parseContent(raw: string | null) {
  const text = raw || '';
  try {
    return JSON.parse(text);
  } catch {
    return { manuscript: { content: text } };
  }
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
    abstract: a.abstract ?? null,
    content: a.content ?? null,
    manuscript_file_path: a.manuscript_file_path ?? null,
    submission_date: a.submission_date ? String(a.submission_date) : null,
  }));

  if (authorArticles.length === 0) {
    notFound();
  }

  const authorName = data.author?.name || 'Author';

  const selectedArticleId = toInt(searchParams?.articleId) ?? Number(authorArticles[0].id);
  const selected = authorArticles.find((a) => a.id === selectedArticleId) || authorArticles[0];
  const parsed = parseContent(selected?.content || null);

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="font-semibold text-gray-900">Articles</div>
                <div className="text-sm text-gray-600">{authorArticles.length} total</div>
              </div>
              <div className="divide-y divide-gray-200 max-h-[70vh] overflow-y-auto">
                {authorArticles.map((article) => {
                  const isSelected = Number(article.id) === Number(selected.id);
                  return (
                    <Link
                      key={article.id}
                      href={`/authors/${encodeURIComponent(slug)}?articleId=${article.id}`}
                      className={`block p-4 hover:bg-gray-50 ${isSelected ? 'bg-gray-50' : ''}`}
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
                              Read Article →
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg p-6 min-h-[70vh]">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selected.title}</h2>
              </div>

              {selected.abstract ? (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Abstract</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
                    {selected.abstract}
                  </div>
                </div>
              ) : null}

              <div className="mb-2">
                <h3 className="font-semibold text-gray-900 mb-2">Content</h3>
                <div className="prose max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {parsed?.manuscript?.content || selected.content || 'No content available.'}
                  </div>
                </div>
              </div>

              {selected.manuscript_file_path ? (
                <div className="mt-6">
                  <a
                    href={selected.manuscript_file_path}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-sm font-semibold text-orange hover:text-green transition-colors"
                  >
                    <FileText className="w-4 h-4 mr-1" /> Open Manuscript
                  </a>
                </div>
              ) : null}
            </div>
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