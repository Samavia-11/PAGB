"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { useParams } from "next/navigation";

interface Article {
  title: string;
  author: string;
  date: string;
  description: string;
  published: string;
  pdfUrl: string;
  thumbnail: string;
}

export default function AuthorPage() {
  const { slug: slugParam } = useParams<{ slug: string }>();
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!slug) return;
    (async () => {
      try {
        const authorName = decodeURIComponent(slug);
        const res = await fetch(`/api/list-author-pdfs?author=${encodeURIComponent(authorName)}`);
        const data = await res.json();
        if (!cancelled && data.files) setArticles(data.files);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const displayName = slug ? decodeURIComponent(slug) : "";

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-green">{displayName}</h1>
          <p className="text-gray-600">Articles by {displayName}</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-5xl font-black mb-6">ARTICLES</h2>
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : articles.length === 0 ? (
          <p className="text-gray-600">No articles found for this author.</p>
        ) : (
          <div className="space-y-8">
            {articles.map((article, index) => (
              <article key={index} className="flex items-start space-x-6 pb-8 border-b border-gray-200 last:border-b-0">
                {/* Thumbnail */}
                <Link href={article.pdfUrl} target="_blank" className="flex-shrink-0 group">
                  <div className="w-32 h-44 rounded shadow-lg overflow-hidden hover:shadow-xl transition-all hover:scale-105 relative bg-green-800">
                    <img src="/images/shanahan-1.webp" alt={article.title} className="w-full h-full object-cover opacity-30 absolute inset-0" />
                    <div className="absolute inset-0 flex flex-col justify-between p-3">
                      <div className="text-center">
                        <div className="text-yellow-400 font-black text-xl mb-1" style={{fontFamily: 'Impact, sans-serif', textShadow: '2px 2px 4px rgba(0,0,0,0.9)'}}>
                          PAGB
                        </div>
                        <div className="h-0.5 w-16 bg-orange mx-auto mb-1"></div>
                        <div className="text-white text-xs font-bold" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.9)'}}>
                          {new Date().getFullYear()}
                        </div>
                      </div>
                      <div className="flex-1 flex items-center justify-center px-1">
                        <h4 className="text-white text-xs font-bold text-center leading-tight" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.9)'}}>
                          {article.title.split(':')[0].substring(0, 50)}
                          {article.title.length > 50 ? '...' : ''}
                        </h4>
                      </div>
                      <div className="text-center">
                        <div className="bg-orange text-white text-xs font-bold px-2 py-0.5 rounded inline-block">PDF</div>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Content */}
                <div className="flex-1">
                  <Link href={article.pdfUrl} target="_blank">
                    <h3 className="text-2xl font-bold mb-2 text-gray-900 hover:text-orange transition-colors" style={{fontFamily: 'Georgia, serif', lineHeight: '1.3', fontWeight: '700'}}>
                      {article.title}
                    </h3>
                  </Link>
                  <div className="mb-2">
                    <p className="font-bold text-sm text-gray-700" style={{fontFamily: 'Arial, sans-serif', letterSpacing: '0.02em', fontWeight: '700'}}>
                      {displayName}
                    </p>
                  </div>
                  <Link href={article.pdfUrl} target="_blank" className="inline-flex items-center text-sm font-semibold text-orange hover:text-green transition-colors">
                    <FileText className="w-4 h-4 mr-1" />
                    Read Full Article (PDF)
                  </Link>
                </div>
              </article>) )}
          </div>
        )}
      </main>
    </div>
  );
}
