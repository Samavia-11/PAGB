'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
    // Check authentication
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
    fetchArticles(parsedUser.id);
  }, [router]);

  const fetchArticles = async (userId: number) => {
    try {
      const response = await fetch(`/api/articles/author/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const publishedArticles = articles.filter(a => a.status === 'published');
  const activeAuthors = 1; // Current user
  const issuesPublished = Math.ceil(publishedArticles.length / 10); // Assuming 10 articles per issue
  const monthlyReaders = publishedArticles.length * 150; // Estimated readers per article

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
                className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-300 ${theme === 'professional' ? 'bg-white border-blue-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:border-blue-400' : 'bg-white/10 backdrop-blur-sm text-white placeholder-white/70 border border-white/20 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400'}`}
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={theme === 'dark' ? 'Dark Purple' : theme === 'ocean' ? 'Ocean Blue' : 'Professional Blue'}
              onChange={(e) => {
                if (e.target.value === 'Dark Purple') setTheme('dark');
                else if (e.target.value === 'Ocean Blue') setTheme('ocean');
                else setTheme('professional');
              }}
              className={`px-3 py-2 rounded-lg text-sm focus:ring-2 ${theme === 'professional' ? 'bg-white border-blue-300 text-gray-900 focus:ring-blue-400' : 'bg-white/10 backdrop-blur-sm text-white border-white/20 focus:ring-cyan-400'}`}
            >
              <option className="text-gray-900" value="Dark Purple">Dark Purple</option>
              <option className="text-gray-900" value="Ocean Blue">Ocean Blue</option>
              <option className="text-gray-900" value="Professional Blue">Professional Blue</option>
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
        {/* Fixed Sidebar */}
        <div className={`w-64 ${currentTheme.sidebar} ${currentTheme.text} flex flex-col h-screen fixed left-0 top-16 z-40 border-r border-white/10`}>
        {/* Navigation Menu */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-2 px-4">
            <li>
              <Link href="/author" className={`group flex items-center space-x-3 px-4 py-3 rounded-xl border shadow-xl ${theme === 'professional' ? 'bg-blue-600 text-white border-blue-700' : theme === 'dark' ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 text-emerald-300 border-emerald-500/50 backdrop-blur-sm' : 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-blue-300 border-blue-500/50 backdrop-blur-sm'}`}>
                <div className={`w-8 h-8 bg-gradient-to-br ${theme === 'professional' ? 'from-blue-400 to-blue-500' : theme === 'dark' ? 'from-emerald-400 to-teal-500' : 'from-blue-400 to-cyan-500'} rounded-lg flex items-center justify-center shadow-lg`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="font-medium">Home</span>
              </Link>
            </li>
            <li>
              <Link href="/author/articles" className={`group flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${theme === 'professional' ? 'text-blue-100 hover:bg-blue-500/20 hover:text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
                <div className={`w-6 h-6 bg-slate-700/50 group-hover:bg-gradient-to-br ${currentTheme.accent} rounded-lg flex items-center justify-center transition-all duration-300`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="font-medium">Current Issue</span>
              </Link>
            </li>
            <li>
              <Link href="/author/archives" className={`group flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${theme === 'professional' ? 'text-blue-100 hover:bg-blue-500/20 hover:text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
                <div className={`w-6 h-6 bg-slate-700/50 group-hover:bg-gradient-to-br ${currentTheme.accent} rounded-lg flex items-center justify-center transition-all duration-300`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <span className="font-medium">Archives</span>
              </Link>
            </li>
            <li>
              <Link href="/author/about" className={`group flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${theme === 'professional' ? 'text-blue-100 hover:bg-blue-500/20 hover:text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
                <div className={`w-6 h-6 bg-slate-700/50 group-hover:bg-gradient-to-br ${currentTheme.accent} rounded-lg flex items-center justify-center transition-all duration-300`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-medium">About</span>
              </Link>
            </li>
            <li>
              <Link href="/author/articles/new" className={`group flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${theme === 'professional' ? 'text-blue-100 hover:bg-blue-500/20 hover:text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
                <div className={`w-6 h-6 bg-slate-700/50 group-hover:bg-gradient-to-br ${currentTheme.accent} rounded-lg flex items-center justify-center transition-all duration-300`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="font-medium">Submit Article</span>
              </Link>
            </li>
            <li>
              <Link href="/author/dashboard" className={`group flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${theme === 'professional' ? 'text-blue-100 hover:bg-blue-500/20 hover:text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
                <div className={`w-6 h-6 bg-slate-700/50 group-hover:bg-gradient-to-br ${currentTheme.accent} rounded-lg flex items-center justify-center transition-all duration-300`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="font-medium">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link href="/author/drafts" className={`group flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${theme === 'professional' ? 'text-blue-100 hover:bg-blue-500/20 hover:text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
                <div className={`w-6 h-6 bg-slate-700/50 group-hover:bg-gradient-to-br ${currentTheme.accent} rounded-lg flex items-center justify-center transition-all duration-300`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <span className="font-medium">View Drafts</span>
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

        {/* Hero Section with left margin for fixed sidebar */}
        <div className={`${currentTheme.header} text-white ml-64 rounded-2xl m-6 shadow-2xl border border-white/20`}>
          <div className="px-8 py-12">
            <h1 className="text-4xl font-bold mb-4">PAGB Publications</h1>
            <p className="text-xl mb-6 text-blue-100">Pakistan Army General Branch - Advancing Military Knowledge Through Academic Excellence</p>
            <p className="text-lg mb-8 text-blue-200 max-w-2xl">
              A premier platform for military research, strategic analysis, and professional development. 
              Connecting scholars, practitioners, and leaders in the defense community.
            </p>
            <div className="flex space-x-4">
              <Link
                href="/author/articles"
                className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Browse Current Issue
              </Link>
              <Link
                href="/author/articles/new"
                className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Submit Article
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Cards with left margin for fixed sidebar */}
        <div className="px-8 py-8 ml-64">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Published Articles */}
            <div className={`${currentTheme.card} rounded-2xl shadow-2xl border p-6 text-center hover:bg-white/15 transition-all duration-300`}>
              <div className={`w-12 h-12 bg-gradient-to-br ${currentTheme.accent} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className={`text-3xl font-bold ${currentTheme.text} mb-2`}>{publishedArticles.length}</h3>
              <p className={`text-sm ${currentTheme.text}/70`}>Published Articles</p>
            </div>

            {/* Active Authors */}
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{activeAuthors}</h3>
              <p className="text-sm text-gray-600">Active Authors</p>
            </div>

            {/* Issues Published */}
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{issuesPublished}</h3>
              <p className="text-sm text-gray-600">Issues Published</p>
            </div>

            {/* Monthly Readers */}
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{monthlyReaders.toLocaleString()}</h3>
              <p className="text-sm text-gray-600">Monthly Readers</p>
            </div>
          </div>

          {/* Current Issue Section */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Current Issue</h2>
                <p className="text-sm text-gray-600">Volume 15, Issue 1 • January 2024</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Activate Windows</p>
                <p className="text-xs text-gray-400">Go to Settings to activate Windows.</p>
              </div>
            </div>
            <div className="p-6">
              {articles.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No articles yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Start by creating your first article for the current issue.</p>
                  <div className="mt-6">
                    <Link
                      href="/author/articles/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Create Article
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.slice(0, 6).map((article) => (
                    <div key={article.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                        {article.content.substring(0, 120)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          article.status === 'published' ? 'bg-green-100 text-green-800' :
                          article.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {article.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <Link
                          href={`/author/articles/${article.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Read More →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
