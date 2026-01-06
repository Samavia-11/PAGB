// app/current-issue/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Users, BookOpen, ScrollText, Download } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Issue {
  id: number;
  volume_number: number;
  issue_number: number;
  issue_year: number;
  issue_date: string;
}

interface Article {
  title: string;
  author: string;
  monthYear: string;
  pdfUrl: string;
  thumbnail: string;
}

export default function CurrentIssue() {
  const [activeTab, setActiveTab] = useState('volume');
  const [issue, setIssue] = useState<Issue | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticles() {
      try {
        const res = await fetch('/api/pagb-public/current-issue');
        if (!res.ok) throw new Error(`Failed to load current issue: ${res.status} ${res.statusText}`);
        const data = await res.json();
        const currentIssue = (data?.issue || null) as Issue | null;
        setIssue(currentIssue);
        const mapped: Article[] = (data.articles || []).map((a: any) => ({
          title: a.title,
          author: a.authors || a.primary_author_name || 'Various Contributors',
          monthYear: a.published_at ? new Date(a.published_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '',
          pdfUrl: a.pdf_path || '#',
          thumbnail: '/images/icon.png',
        }));
        setArticles(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadArticles();
  }, []);

  const tabs = [
    { id: 'volume', label: 'Volume', icon: BookOpen },
    { id: 'issue', label: 'Issue', icon: ScrollText },
    { id: 'articles', label: 'Articles', icon: FileText },
    { id: 'editorial', label: 'Editorial Board', icon: Users },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">

        {/* Hero */}
        <section className="bg-gradient-to-r from-[#002300] to-[#002300] text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Current Issue</h1>
            <p className="text-xl opacity-90">Pakistan Army Green Book</p>
          </div>
        </section>

        {/* Tabs */}
        <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex overflow-x-auto -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-8 py-6 text-sm font-medium tracking-wider whitespace-nowrap transition-all border-b-4 ${
                      activeTab === tab.id
                        ? 'border-[#002300] text-[#002300] bg-green-50'
                        : 'border-transparent text-gray-600 hover:text-[#002300] hover:border-green-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            {!loading && !issue && (
              <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
                <h2 className="text-2xl font-bold text-gray-800">No current issue published</h2>
                <p className="text-gray-600 mt-2">Please check back later.</p>
              </div>
            )}

            {/* Volume Tab */}
            {activeTab === 'volume' && (
              <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
                <h2 className="text-6xl font-black text-green-700 mb-4">Volume {issue?.volume_number ?? '--'}</h2>
                <p className="text-2xl text-gray-700">{issue?.issue_year ?? '--'}</p>
                <div className="mt-8 text-gray-600">
                  <p className="text-lg">Pakistan Army Green Book</p>
                  <p className="text-sm mt-2">Annual Publication • ISSN:  2303-9973</p>
                </div>
              </div>
            )}

            {/* Issue Tab */}
            {activeTab === 'issue' && (
              <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
                <h2 className="text-6xl font-black text-[#002300] mb-4">Issue {issue?.issue_number ?? '--'}</h2>
                <p className="text-2xl text-gray-700">{issue?.issue_year ?? '--'}</p>
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-gray-600">
                  <div>
                    <p className="text-sm font-semibold uppercase text-gray-500">Published</p>
                    <p className="text-xl font-bold">{issue?.issue_year ? String(issue.issue_year) : '--'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase text-gray-500">Articles</p>
                    <p className="text-xl font-bold">{articles.length}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase text-gray-500">Pages</p>
                    <p className="text-xl font-bold">245</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase text-gray-500">Downloads</p>
                    <p className="text-xl font-bold">12.4k</p>
                  </div>
                </div>
              </div>
            )}

            {/* Articles Tab */}
            {activeTab === 'articles' && (
              <div className="space-y-6">
                <div className="text-center mb-10">
                  <h2 className="text-4xl font-bold text-gray-800">Featured Articles</h2>
                  <p className="text-gray-600 mt-3">Volume {issue?.volume_number ?? '--'} • Issue {issue?.issue_number ?? '--'} • {issue?.issue_year ?? '--'}</p>
                  <p className="text-2xl font-bold text-green-700 mt-2">{articles.length} Articles</p>
                </div>

                {loading ? (
                  <div className="text-center py-10">
                    <p className="text-xl text-gray-600">Loading articles...</p>
                  </div>
                ) : (
                  articles.map((article, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-all border">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-orange-600">Article {i + 1}</span>
                          <h3 className="text-xl font-bold text-gray-800 mt-2">{article.title}</h3>
                          <p className="text-gray-600 mt-2">{article.author}</p>
                          {article.monthYear && <p className="text-gray-600 mt-1">{article.monthYear}</p>}
                        </div>

                        <Link 
                          href={article.pdfUrl} 
                          target="_blank"
                          className="bg-[#002300] hover:bg-green-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition flex-shrink-0"
                        >
                          <Download className="w-5 h-5" />
                          View PDF
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Editorial Board Tab */}
            {activeTab === 'editorial' && (
              <div className="bg-white rounded-2xl shadow-lg p-10">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Editorial Board</h2>
                <p className="text-center text-gray-600 mb-10">Volume {issue?.volume_number ?? '--'} • Issue {issue?.issue_number ?? '--'}</p>

                <div className="grid md:grid-cols-2 gap-12 mb-12">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-orange-600 uppercase">Editor-in-Chief</p>
                    <h3 className="text-2xl font-bold mt-2">Maj Gen Malik Amir Muhammad khan</h3>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-orange-600 uppercase">Managing Editor</p>
                    <h3 className="text-2xl font-bold mt-2">Brigadier Kamran Ahmed</h3>
                  </div>
                </div>
                <div className="mt-12">
                  <p className="text-sm font-semibold text-orange-600 uppercase text-center mb-6">Sub-Editors</p>
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-6 text-center">
                    {["Col M.Waqas Razaq", "Lt Col Zillay Hussain Dar",].map((name) => (
                      <div key={name} className="bg-gray-50 rounded-lg p-4">
                        <p className="font-medium">{name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}