// app/archives/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Download, Search, Filter } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Types
interface Article {
  title: string;
  author: string;
  authorSlug: string;
  pdfUrl: string;
  fileName: string;
}

export default function Archives() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadAllArticles() {
      try {
        const res = await fetch('/api/archives-all');
        const data = await res.json();
        setArticles(data.articles || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
    loadAllArticles();
  }, []);

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#002300] to-[#002300] text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Archives</h1>
            <p className="text-xl opacity-90">Complete Collection of All Published Articles</p>
            <p className="text-3xl font-bold mt-4">{articles.length} Articles</p>
          </div>
        </section>

        {/* Search Bar */}
        <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or author..."
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
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-gray-600">No articles found</p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredArticles.map((article, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 overflow-hidden group"
                  >
                    <div className="p-8">
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
                          Article {i + 1}
                        </span>
                        <FileText className="w-5 h-5 text-gray-400" />
                      </div>

                      <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-green-700 transition">
                        {article.title}
                      </h3>

                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Author</p>
                        <Link
                          href={`/authors/${article.authorSlug}`}
                          className="text-lg font-semibold text-[#002300] hover:underline"
                        >
                          {article.author}
                        </Link>
                      </div>

                      <Link
                        href={article.pdfUrl}
                        target="_blank"
                        className="inline-flex items-center gap-3 bg-[#002300] hover:bg-green-800 text-white px-6 py-3 rounded-lg font-medium transition mt-4"
                      >
                        <Download className="w-5 h-5" />
                        Open PDF
                      </Link>
                    </div>
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