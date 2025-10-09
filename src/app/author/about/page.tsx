'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AboutPage() {
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
      {/* Top Header - Fixed Modern Glass Effect */}
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
            <button className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
              </svg>
            </button>
            <span className="text-sm font-medium">author</span>
            <button className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300">
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
        <div className={`w-64 ${currentTheme.sidebar} ${currentTheme.text} flex flex-col h-screen border-r border-white/10 fixed left-0 top-16 z-40`}>
          {/* Navigation Menu */}
          <nav className="flex-1 py-6 overflow-y-auto">
            <ul className="space-y-3 px-4">
              <li>
                <Link href="/author" className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 ${theme === 'professional' ? 'bg-blue-500/10 text-blue-700 border border-blue-300 hover:bg-blue-500/20 hover:border-blue-400' : theme === 'dark' ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30 hover:from-cyan-500/30 hover:to-blue-500/30 hover:border-cyan-400/50 border shadow-lg backdrop-blur-sm' : 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30 hover:from-emerald-500/30 hover:to-teal-500/30 hover:border-emerald-400/50 border shadow-lg backdrop-blur-sm'}`}>
                  <div className={`w-8 h-8 bg-gradient-to-br ${currentTheme.accent} rounded-lg flex items-center justify-center shadow-lg`}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <span className="font-medium">Home</span>
                </Link>
              </li>
              <li>
                <Link href="/author/articles" className="group flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 text-slate-300 hover:text-purple-300 border border-transparent hover:border-purple-500/30 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105">
                  <div className="w-8 h-8 bg-slate-700/50 group-hover:bg-gradient-to-br group-hover:from-purple-400 group-hover:to-pink-500 rounded-lg flex items-center justify-center shadow-lg transition-all duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <Link href="/author/about" className={`group flex items-center space-x-3 px-4 py-3 rounded-xl border shadow-xl ${theme === 'professional' ? 'bg-blue-600 text-white border-blue-700' : theme === 'dark' ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 text-emerald-300 border-emerald-500/50 backdrop-blur-sm' : 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-blue-300 border-blue-500/50 backdrop-blur-sm'}`}>
                  <div className={`w-8 h-8 bg-gradient-to-br ${theme === 'professional' ? 'from-blue-400 to-blue-500' : theme === 'dark' ? 'from-emerald-400 to-teal-500' : 'from-blue-400 to-cyan-500'} rounded-lg flex items-center justify-center shadow-lg`}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-medium">About</span>
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
        <div className="flex-1 bg-transparent ml-64">
          {/* About Header */}
          <div className={`${currentTheme.header} text-white p-8 m-6 rounded-2xl shadow-2xl border border-white/20`}>
            <h1 className={`text-5xl font-bold mb-4 ${theme === 'professional' ? 'text-white' : `bg-gradient-to-r ${theme === 'dark' ? 'from-white via-cyan-200 to-white' : 'from-white via-emerald-200 to-white'} bg-clip-text text-transparent`}`}>About PAGB</h1>
            <p className="text-white/90 text-xl leading-relaxed">
              Pakistan Army General Branch - Advancing Military Knowledge Through Academic Excellence and Professional Development
            </p>
          </div>

          <div className="px-6 pb-6">
            {/* Our Mission */}
            <div className={`${currentTheme.card} rounded-2xl shadow-2xl border mb-6 hover:bg-white/15 transition-all duration-300`}>
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className={`w-12 h-12 bg-gradient-to-br ${currentTheme.accent} rounded-xl flex items-center justify-center mr-4 shadow-lg`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className={`text-2xl font-bold ${currentTheme.text}`}>Our Mission</h2>
                </div>
                <p className={`${currentTheme.text}/90 leading-relaxed text-lg`}>
                  PAGB (Pakistan Army General Branch) serves as a premier platform for scholarly discourse and professional development within the military community. We are committed to 
                  publishing high-quality research that advances military science, strategy, and professional excellence. Our mission is to foster intellectual exchange 
                  among military professionals, academics, and policy experts to enhance defense capabilities and strategic thinking.
                </p>
              </div>
            </div>

            {/* Three Column Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Rigorous Peer Review */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Rigorous Peer Review</h3>
                <p className="text-gray-600 text-sm">
                  Our editorial board employs a double-blind peer review process to ensure the highest academic standards and scholarly integrity.
                </p>
              </div>

              {/* Global Reach */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Global Reach</h3>
                <p className="text-gray-600 text-sm">
                  Our publication reaches worldwide readership, connecting military professionals and researchers across international boundaries.
                </p>
              </div>

              {/* Expert Community */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Expert Community</h3>
                <p className="text-gray-600 text-sm">
                  Our network brings together leading military leaders, academic researchers, and policy experts from around the world.
                </p>
              </div>
            </div>

            {/* Editorial Board */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Editorial Board</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Editor-in-Chief */}
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-2xl">WT</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">Gen. William Thompson</h3>
                    <p className="text-blue-600 text-sm mb-2">Editor-in-Chief</p>
                    <p className="text-gray-600 text-xs">Strategic Studies Expert</p>
                  </div>

                  {/* Managing Editor */}
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-2xl">MD</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">Dr. Margaret Davis</h3>
                    <p className="text-green-600 text-sm mb-2">Managing Editor</p>
                    <p className="text-gray-600 text-xs">Defense Policy</p>
                  </div>

                  {/* Associate Editor */}
                  <div className="text-center">
                    <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-2xl">JW</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">Col. James Wilson</h3>
                    <p className="text-purple-600 text-sm mb-2">Associate Editor</p>
                    <p className="text-gray-600 text-xs">Military Ethics</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Publication Details */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Publication Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">ISSN (Print):</span>
                      <span className="text-gray-600">1234-5678</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">ISSN (Online):</span>
                      <span className="text-gray-600">9876-5432</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Publisher:</span>
                      <span className="text-gray-600">PAGB Publications</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Frequency:</span>
                      <span className="text-gray-600">Quarterly</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Language:</span>
                      <span className="text-gray-600">English</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Founded:</span>
                      <span className="text-gray-600">2010</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scope & Focus Areas */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Scope & Focus Areas</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">Military Strategy & Doctrine</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">Leadership & Professional Development</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">Defense Technology & Innovation</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">International Security</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">Logistics & Operations Research</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">Cybersecurity & Information Warfare</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Editorial Office</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start">
                        <svg className="w-4 h-4 text-gray-400 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          <p className="text-gray-700">PAGB Publications</p>
                          <p className="text-gray-600">General Headquarters, Rawalpindi</p>
                          <p className="text-gray-600">Pakistan</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-gray-700">+1 (555) 123-4567</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-700">editor@pagb.org</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Submission Guidelines</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• Manuscripts should be 5,000-8,000 words</p>
                      <p>• Submit via our online submission system</p>
                      <p>• Include abstract (150-250 words)</p>
                      <p>• Follow APA citation style</p>
                      <p>• Peer review process: 8-12 weeks</p>
                      <p>• Submit original research only</p>
                    </div>
                    <div className="mt-4">
                      <Link
                        href="/author/articles/new"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Submit Article
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}