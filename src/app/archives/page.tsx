// app/archives/page.tsx

'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FileText, Download, Search, Filter } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Types
interface PublicBook {
  id: number;
  title: string;
  edition_year: number;
  cover_image_path: string | null;
}

interface PublicBookArticle {
  book_article_id: number;
  book_id: number;
  article_id: number;
  sort_order: number;
  book_article_title: string | null;
  cover_page_path: string | null;
  article_title: string | null;
  manuscript_file_path: string | null;
  author_id: number | null;
  author_name: string | null;
}

interface BookWithArticles {
  book: PublicBook;
  articles: PublicBookArticle[];
}

function ArchivesContent() {
  const [items, setItems] = useState<BookWithArticles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearchTerm(q);
  }, [searchParams]);

  useEffect(() => {
    async function loadAllIssuesAndArticles() {
      try {
        const res = await fetch('/api/pagb-public/books', { cache: 'no-store' });
        const data = await res.json();
        const books: PublicBook[] = (data?.books || []) as PublicBook[];

        const details = await Promise.all(
          (books || []).map(async (b) => {
            try {
              const r = await fetch(`/api/pagb-public/books/${encodeURIComponent(String(b.id))}`, { cache: 'no-store' });
              const d = await r.json().catch(() => ({}));
              if (!r.ok) {
                return { book: b, articles: [] as PublicBookArticle[] };
              }
              const list = (d?.articles || []) as PublicBookArticle[];
              return { book: b, articles: list };
            } catch {
              return { book: b, articles: [] as PublicBookArticle[] };
            }
          })
        );

        setItems(details);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
    loadAllIssuesAndArticles();
  }, []);

  const q = searchTerm.trim().toLowerCase();
  const filteredItems = !q
    ? items
    : items
        .map((x) => {
          const bookMatches = String(x.book.title || '').toLowerCase().includes(q);
          const filteredArticles = (x.articles || []).filter((a) => {
            const t = String(a.article_title || a.book_article_title || '').toLowerCase();
            const au = String(a.author_name || '').toLowerCase();
            return t.includes(q) || au.includes(q);
          });
          if (bookMatches) return x;
          if (filteredArticles.length === 0) return null;
          return { book: x.book, articles: filteredArticles };
        })
        .filter(Boolean) as BookWithArticles[];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#002300] to-[#002300] text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Archives</h1>
            <p className="text-xl opacity-90">Complete Collection of All Published Articles</p>
            <p className="text-3xl font-bold mt-4">{items.length} Issues</p>
          </div>
        </section>

        {/* Search Bar */}
        <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 text-lg"
              />
              <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-7xl">
            {loading ? (
              <div className="text-center py-20">
                <p className="text-xl text-gray-600">Loading all articles...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-gray-600">No articles found</p>
              </div>
            ) : (
              <div className="space-y-10">
                {filteredItems.map((x) => (
                  <div key={x.book.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">{x.book.title}</h2>
                          <div className="text-sm text-gray-600 mt-1">{x.book.edition_year} Edition</div>
                        </div>
                        <Link
                          href={`/books/${x.book.id}`}
                          className="text-sm font-semibold text-[#002300] hover:underline"
                        >
                          View Issue
                        </Link>
                      </div>
                    </div>

                    {x.articles.length === 0 ? (
                      <div className="p-6 text-gray-600">No articles available.</div>
                    ) : (
                      <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {x.articles.map((a) => {
                          const title = a.article_title || a.book_article_title || `Article #${a.article_id}`;
                          const authorName = a.author_name || 'Various Contributors';
                          const authorSlug = authorName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                          const pdfUrl = a.manuscript_file_path || '#';
                          return (
                            <div
                              key={a.book_article_id}
                              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 overflow-hidden group"
                            >
                              <div className="p-6">
                                <div className="flex items-start justify-between mb-3">
                                  <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Article</span>
                                  <FileText className="w-5 h-5 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-green-700 transition">
                                  {title}
                                </h3>
                                <div className="mb-4">
                                  <p className="text-sm text-gray-500">Author</p>
                                  <Link
                                    href={`/authors/${authorSlug || 'unknown'}`}
                                    className="text-base font-semibold text-[#002300] hover:underline"
                                  >
                                    {authorName}
                                  </Link>
                                </div>
                                <Link
                                  href={pdfUrl}
                                  target="_blank"
                                  className="inline-flex items-center gap-3 bg-[#002300] hover:bg-green-800 text-white px-5 py-2.5 rounded-lg font-medium transition"
                                >
                                  <Download className="w-5 h-5" />
                                  Open PDF
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

export default function Archives() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>}>
      <ArchivesContent />
    </Suspense>
  );
}