'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, FileText, Users, Download } from 'lucide-react';

type TabKey = 'articles' | 'authors';

type ContributingAuthor = {
  id: number;
  name: string;
  slug: string;
  article_count: number;
};

type Book = {
  id: number;
  title: string;
  edition_year: number;
  cover_image_path: string | null;
};

type BookArticle = {
  book_article_id: number;
  book_id: number;
  article_id: number;
  sort_order: number;
  book_article_title: string | null;
  cover_page_path: string | null;
  article_title: string | null;
  article_abstract: string | null;
  article_keywords: string | null;
  article_content: string | null;
  article_authors: any;
  article_affiliation: string | null;
  article_type: string | null;
  manuscript_file_path: string | null;
  author_id: number | null;
  author_name: string | null;
};

function parseContent(raw: string | null) {
  const text = raw || '';
  try {
    return JSON.parse(text);
  } catch {
    return { manuscript: { content: text } };
  }
}

export default function BookDetailPage() {
  const params = useParams<{ id: string }>();
  const bookId = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [book, setBook] = useState<Book | null>(null);
  const [articles, setArticles] = useState<BookArticle[]>([]);
  const [authors, setAuthors] = useState<ContributingAuthor[]>([]);

  const [activeTab, setActiveTab] = useState<TabKey>('articles');
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!bookId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/pagb-public/books/${encodeURIComponent(bookId)}`, { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || 'Failed to load book');
        }

        const b = data.book as Book;
        const list = (data.articles || []) as BookArticle[];
        const au = (data.contributing_authors || []) as ContributingAuthor[];

        if (!cancelled) {
          setBook(b);
          setArticles(list);
          setAuthors(au);
          const first = list?.[0]?.article_id;
          setSelectedArticleId(first ? Number(first) : null);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load');
          setBook(null);
          setArticles([]);
          setAuthors([]);
          setSelectedArticleId(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bookId]);

  const selectedArticle = useMemo(() => {
    if (!selectedArticleId) return null;
    return articles.find((a) => Number(a.article_id) === Number(selectedArticleId)) || null;
  }, [articles, selectedArticleId]);

  const parsed = useMemo(() => {
    return parseContent(selectedArticle?.article_content || null);
  }, [selectedArticle?.article_content]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link href="/" className="inline-flex items-center text-green-700 hover:text-green-900 font-medium mb-8">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900">Book not available</h1>
            <p className="text-gray-600 mt-2">{error || 'This book could not be found.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <Link href="/" className="inline-flex items-center text-green-700 hover:text-green-900 font-medium mb-3">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
            <p className="text-gray-600 mt-1">{book.edition_year} Edition</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('articles')}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${activeTab === 'articles' ? 'bg-white border-gray-300 text-gray-900' : 'bg-transparent border-transparent text-gray-600 hover:text-gray-900'}`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Articles
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('authors')}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${activeTab === 'authors' ? 'bg-white border-gray-300 text-gray-900' : 'bg-transparent border-transparent text-gray-600 hover:text-gray-900'}`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Contributing Authors
            </button>
          </div>
        </div>

        {activeTab === 'authors' ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {authors.length === 0 ? (
              <div className="text-gray-600">No authors available.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {authors.map((a) => (
                  <Link
                    key={a.id}
                    href={`/authors/${a.slug}`}
                    className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="text-lg font-semibold text-gray-900">{a.name}</div>
                    <div className="text-sm text-gray-600 mt-1">{a.article_count} Article{a.article_count !== 1 ? 's' : ''}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-4 border-b border-gray-200">
                  <div className="text-2xl font-black tracking-wide text-gray-900">ARTICLES</div>
                  <div className="text-sm text-gray-600 mt-1">{articles.length} total</div>
                </div>
                <div className="divide-y divide-gray-200 max-h-[70vh] overflow-y-auto">
                  {articles.map((a) => {
                    const isSelected = Number(a.article_id) === Number(selectedArticleId);
                    return (
                      <button
                        key={a.book_article_id}
                        type="button"
                        onClick={() => setSelectedArticleId(Number(a.article_id))}
                        className={`w-full text-left p-6 hover:bg-gray-50 ${isSelected ? 'bg-gray-50' : ''}`}
                      >
                        <div className="flex gap-6 items-start">
                          <div className="w-28 h-36 bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                            <img
                              src={a.cover_page_path || book.cover_image_path || '/images/icon.png'}
                              alt={a.article_title || a.book_article_title || 'Article'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xl font-bold text-gray-900 leading-snug tracking-wide line-clamp-3" style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }}>
                              {(a.article_title || a.book_article_title || `Article #${a.article_id}`)}
                            </div>
                            <div className="text-sm text-gray-800 mt-2" style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }}>
                              {a.author_name || 'Unknown Author'}
                            </div>
                            {a.manuscript_file_path ? (
                              <div className="mt-3">
                                <a
                                  href={a.manuscript_file_path}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center text-sm font-semibold text-orange-600 hover:text-orange-700"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span className="mr-2">📄</span>
                                  Read Full Article (PDF)
                                </a>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-lg p-6 min-h-[70vh]">
                {!selectedArticle ? (
                  <div className="text-gray-600">Select an article to read.</div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedArticle.article_title || selectedArticle.book_article_title || `Article #${selectedArticle.article_id}`}
                      </h2>
                      <div className="text-sm text-gray-600 mt-1">
                        By{' '}
                        {selectedArticle.author_name ? (
                          selectedArticle.author_id ? (
                            <Link
                              href={`/authors/${String(selectedArticle.author_name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`}
                              className="text-green-700 hover:text-green-900"
                            >
                              {selectedArticle.author_name}
                            </Link>
                          ) : (
                            selectedArticle.author_name
                          )
                        ) : (
                          'Unknown Author'
                        )}
                      </div>
                      {selectedArticle.manuscript_file_path ? (
                        <div className="mt-3 flex items-center gap-3">
                          <a
                            href={selectedArticle.manuscript_file_path}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-green-700 hover:text-green-900"
                          >
                            Open Manuscript
                          </a>
                          <a
                            href={selectedArticle.manuscript_file_path}
                            download
                            className="inline-flex items-center text-sm font-medium text-green-700 hover:text-green-900"
                          >
                            <Download className="w-4 h-4 mr-1" /> Download
                          </a>
                        </div>
                      ) : null}
                    </div>

                    {selectedArticle.article_abstract ? (
                      <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Abstract</h3>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
                          {selectedArticle.article_abstract}
                        </div>
                      </div>
                    ) : null}

                    {selectedArticle.article_keywords ? (
                      <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                          {String(selectedArticle.article_keywords)
                            .split(',')
                            .map((k) => k.trim())
                            .filter(Boolean)
                            .map((k) => (
                              <span key={k} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                                {k}
                              </span>
                            ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="mb-2">
                      <h3 className="font-semibold text-gray-900 mb-2">Content</h3>
                      <div className="prose max-w-none">
                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {parsed?.manuscript?.content || selectedArticle.article_content || 'No content available.'}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
