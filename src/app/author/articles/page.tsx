'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Article {
  id: number;
  title: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
  author: string;
  doi: string;
  pages: string;
  keywords: string[];
}

export default function CurrentIssue() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark'); // 'dark', 'ocean', or 'professional'

  // Theme configurations
  const themes = {
    dark: {
      background: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
      header: 'bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-pink-600/90 backdrop-blur-xl',
      sidebar: 'bg-gradient-to-b from-slate-800/90 via-slate-900/90 to-slate-800/90 backdrop-blur-xl',
      card: 'bg-white/10 backdrop-blur-xl border-white/20',
      text: 'text-white',
      accent: 'from-cyan-400 to-blue-500'
    },
    ocean: {
      background: 'bg-gradient-to-br from-blue-900 via-teal-900 to-emerald-900',
      header: 'bg-gradient-to-r from-blue-600/90 via-teal-600/90 to-emerald-600/90 backdrop-blur-xl',
      sidebar: 'bg-gradient-to-b from-teal-800/90 via-blue-900/90 to-teal-800/90 backdrop-blur-xl',
      card: 'bg-teal-500/10 backdrop-blur-xl border-teal-300/20',
      text: 'text-teal-50',
      accent: 'from-emerald-400 to-teal-500'
    },
    professional: {
      background: 'bg-gradient-to-br from-gray-100 to-blue-50',
      header: 'bg-gradient-to-r from-blue-600 to-blue-700',
      sidebar: 'bg-gradient-to-b from-blue-600 to-blue-700',
      card: 'bg-white border-blue-200 shadow-lg',
      text: 'text-gray-800',
      accent: 'from-blue-500 to-blue-600'
    }
  };

  const currentTheme = themes[theme];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'author') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Sample articles data
  const articles = [
    {
      id: 1,
      title: "Modern Military Strategy in Digital Warfare",
      content: "This paper examines the evolution of military strategy in the context of digital warfare and cyber operations. The research analyzes how traditional military doctrines are being adapted to address emerging threats in cyberspace, including state-sponsored attacks, information warfare, and the protection of critical infrastructure. Through case studies and expert interviews, we identify key challenges and propose strategic frameworks for military organizations to effectively operate within digital threats.",
      author: "Col. John Smith, Dr. Sarah Johnson",
      doi: "10.1234/armyjournal.2024.15.1.001",
      pages: "1-20",
      keywords: ["digital warfare", "military strategy", "cybersecurity", "information warfare"],
      status: "published",
      created_at: "2024-01-15",
      updated_at: "2024-01-15"
    },
    {
      id: 2,
      title: "Leadership Development in Contemporary Armed Forces",
      content: "An analysis of modern leadership development programs in military organizations worldwide, examining best practices and innovative approaches to building effective military leaders.",
      author: "Maj. Gen. Patricia Davis, Lt. Col. Michael Brown",
      doi: "10.1234/armyjournal.2024.15.1.002",
      pages: "21-45",
      keywords: ["leadership", "military education", "professional development"],
      status: "published",
      created_at: "2024-01-15",
      updated_at: "2024-01-15"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.background}`}>
      {/* Top Header - Fixed Full Width */}
      <div className={`${currentTheme.header} text-white px-6 py-4 shadow-2xl border-b border-white/10 fixed top-0 left-0 right-0 z-50`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">📚</span>
              </div>
              <span className="font-bold text-xl tracking-wide">PAGB</span>
            </div>
          </div>
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search articles, authors, keywords..."
                className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-900 focus:ring-2 focus:ring-purple-300"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select className="px-3 py-1 rounded text-gray-900 text-sm">
              <option>Blue</option>
              <option>Green</option>
              <option>Red</option>
            </select>
            <button className="p-1 hover:bg-purple-700 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
              </svg>
            </button>
            <span className="text-sm">author</span>
            <button className="p-1 hover:bg-purple-700 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container with top padding for fixed header */}
      <div className="flex pt-16">
        {/* Fixed Sidebar Navigation */}
        <div className={`w-64 ${currentTheme.sidebar} ${currentTheme.text} flex flex-col h-screen fixed left-0 top-16 z-40 border-r border-white/10`}>
        {/* Navigation Menu */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-2 px-4">
            <li>
              <Link href="/author" className={`group flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${theme === 'professional' ? 'text-blue-100 hover:bg-blue-500/20 hover:text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
                <div className={`w-6 h-6 bg-slate-700/50 group-hover:bg-gradient-to-br ${currentTheme.accent} rounded-lg flex items-center justify-center transition-all duration-300`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="font-medium">Home</span>
              </Link>
            </li>
            <li>
              <Link href="/author/articles" className={`group flex items-center space-x-3 px-4 py-3 rounded-xl border shadow-xl ${theme === 'professional' ? 'bg-blue-600 text-white border-blue-700' : theme === 'dark' ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 text-emerald-300 border-emerald-500/50 backdrop-blur-sm' : 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-blue-300 border-blue-500/50 backdrop-blur-sm'}`}>
                <div className={`w-8 h-8 bg-gradient-to-br ${theme === 'professional' ? 'from-blue-400 to-blue-500' : theme === 'dark' ? 'from-emerald-400 to-teal-500' : 'from-blue-400 to-cyan-500'} rounded-lg flex items-center justify-center shadow-lg`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="font-medium">Current Issue</span>
              </Link>
            </li>
            <li>
              <Link href="/author/archives" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-blue-600 text-blue-100 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span>Archives</span>
              </Link>
            </li>
            <li>
              <Link href="/author/about" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-blue-600 text-blue-100 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>About</span>
              </Link>
            </li>
            <li>
              <Link href="/author/articles/new" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-blue-600 text-blue-100 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Submit Article</span>
              </Link>
            </li>
            <li>
              <Link href="/author/dashboard" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-blue-600 text-blue-100 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link href="/author/drafts" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-blue-600 text-blue-100 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>View Drafts</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-blue-600">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.fullName?.charAt(0) || 'A'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.fullName || 'Author'}</p>
              <p className="text-xs text-blue-200">Author</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-blue-200 hover:text-white hover:bg-blue-600 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>

        {/* Main Content with left margin for fixed sidebar */}
        <div className="flex-1 bg-white ml-64">
          {/* Current Issue Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 m-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h1 className="text-3xl font-bold">Current Issue</h1>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-blue-100 mb-4">
              <div className="flex items-center bg-blue-700 bg-opacity-50 px-3 py-1 rounded-lg">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="font-medium">Volume 15, Issue 1</span>
              </div>
              <div className="flex items-center bg-blue-700 bg-opacity-50 px-3 py-1 rounded-lg">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">January 2024</span>
              </div>
              <div className="flex items-center bg-blue-700 bg-opacity-50 px-3 py-1 rounded-lg">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium">4 Articles</span>
              </div>
            </div>
            <p className="text-blue-100 max-w-4xl leading-relaxed">
              This issue features cutting-edge research in military strategy, leadership development, logistics optimization, 
              and psychological resilience. Our contributors present innovative solutions to contemporary challenges 
              facing modern armed forces.
            </p>
          </div>

          <div className="p-6">
            {/* Issue Information */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Issue Information</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Editorial Board */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Editorial Board</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Editor-in-Chief:</span>
                        <span className="text-blue-600 ml-2">Gen. William Thompson</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Associate Editor:</span>
                        <span className="text-blue-600 ml-2">Dr. Margaret Davis</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Managing Editor:</span>
                        <span className="text-blue-600 ml-2">Col. James Wilson</span>
                      </div>
                    </div>
                  </div>

                  {/* Publication Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Publication Details</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">ISSN:</span>
                        <span className="text-blue-600 ml-2">1234-5678 (Print), 9876-5432 (Online)</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Publisher:</span>
                        <span className="text-gray-600 ml-2">Army Journal Publications</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Frequency:</span>
                        <span className="text-gray-600 ml-2">Quarterly</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Language:</span>
                        <span className="text-gray-600 ml-2">English</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Issue Actions */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Issue Actions</h4>
                      <p className="text-sm text-gray-600">Download or read this issue</p>
                    </div>
                    <div className="flex space-x-3">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m-6 4V4" />
                        </svg>
                        Download Full Issue (PDF)
                      </button>
                      <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Online
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Articles */}
            <div className="space-y-6">
              {articles.map((article, index) => (
                <div key={article.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{article.title}</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                        Article {index + 1}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Published: 1/15/2024</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Pages: {article.pages}</span>
                      </div>
                      <div className="flex items-center">
                        <span>DOI: {article.doi}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Abstract</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">{article.content}</p>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Keywords:</h4>
                      <div className="flex flex-wrap gap-2">
                        {article.keywords.map((keyword, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex space-x-3">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          Read Article
                        </button>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m-6 4V4" />
                          </svg>
                          Download PDF
                        </button>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View Full Article →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
