'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, FileText, Users, Settings, Home, ChevronDown, ChevronRight } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  content: string;
  status: string;
  author_name: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [homeDropdown, setHomeDropdown] = useState(false);

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'administrator') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
    fetchArticles();
  }, [router]);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles/administrator');
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

  const handleCreateNewIssue = () => {
    router.push('/administrator/current-issue/form');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">PAGB Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold">{user?.full_name || user?.username}</p>
              <p className="text-sm capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Articles */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                All Articles Management
              </h2>
        {/* Logo Section */}
        <div className="p-6 border-b border-green-600">
          <div className="flex items-center space-x-3">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <span className="text-xl font-bold">PAGB Journal</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {/* Home with Dropdown */}
            <li>
              <div>
                <button 
                  onClick={() => setHomeDropdown(!homeDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />
                    </svg>
                    <span>Home</span>
                  </div>
                  <svg className={`w-4 h-4 transform transition-transform ${homeDropdown ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                  </svg>
                </button>
                {homeDropdown && (
                  <div className="ml-6 mt-2 space-y-1">
                    <Link href="/administrator/journal" className="block px-4 py-2 text-sm text-green-200 hover:text-white hover:bg-green-600 rounded transition-colors">
                      Journal
                    </Link>
                    <Link href="/administrator/featured-authors" className="block px-4 py-2 text-sm text-green-200 hover:text-white hover:bg-green-600 rounded transition-colors">
                      Featured Authors
                    </Link>
                  </div>
                )}
              </div>
            </li>
            
            <li>
              <Link href="/administrator/current-issue/display" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-green-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                <span>Current Issue</span>
              </Link>
            </li>
            
            <li>
              <Link href="/administrator/archives" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-green-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3,3H21V7H3V3M4,8H20V21H4V8M9.5,11A0.5,0.5 0 0,0 9,11.5V13H15V11.5A0.5,0.5 0 0,0 14.5,11H9.5Z" />
                </svg>
                <span>Archives</span>
              </Link>
            </li>
            
            <li>
              <Link href="/administrator/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-green-600 text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z" />
                </svg>
                <span>Dashboard</span>
              </Link>
            </li>
            
            <li>
              <Link href="/administrator/user-requests" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-green-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16,4C18.11,4 19.99,5.89 19.99,8C19.99,10.11 18.11,12 16,12C13.89,12 12,10.11 12,8C12,5.89 13.89,4 16,4M16,14C20.42,14 24,15.79 24,18V20H8V18C8,15.79 11.58,14 16,14M6,6V9H4V6H1V4H4V1H6V4H9V6H6M6,13V16H4V13H1V11H4V8H6V11H9V13H6Z" />
                </svg>
                <span>User Requests</span>
              </Link>
            </li>
            
            <li>
              <Link href="/administrator/Authors" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-green-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                </svg>
                <span>Authors</span>
              </Link>
            </li>

            <li>
              <Link href="/administrator/about" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-green-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" />
                </svg>
                <span>About</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-green-600">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold">A</span>
            </div>
            <div>
              <p className="text-sm font-medium">administrator</p>
              <p className="text-xs text-green-200">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-green-200 hover:text-white transition-colors text-sm ml-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Top Header */}
        <header className="bg-green-600 text-white px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                <span className="text-lg font-medium">PAGB Journal</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles, authors, keywords..."
                  className="w-80 px-4 py-2 pl-10 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-white text-sm border-0"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <select className="bg-white text-gray-700 px-3 py-1.5 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-white appearance-none pr-8">
                  <option>Forest</option>
                </select>
                <svg className="absolute right-2 top-2 w-4 h-4 text-gray-500 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                </svg>
              </div>
              <button className="p-2 hover:bg-green-500 rounded transition-colors">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21" />
                </svg>
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">administrator</span>
                <button className="p-1 hover:bg-green-500 rounded transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 bg-gray-100">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Administrator Dashboard</h2>
            <p className="text-gray-600">Manage publications, oversee the journal operations, and maintain quality standards.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Ready to Publish Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-gray-900 mb-1">
                    {articles.filter(a => a.status === 'with_admin').length}
                  </p>
                  <p className="text-sm text-gray-600">Ready to Publish</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Published Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-gray-900 mb-1">
                    {articles.filter(a => a.status === 'published').length}
                  </p>
                  <p className="text-sm text-gray-600">Published</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Current Volume Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-gray-900 mb-1">15</p>
                  <p className="text-sm text-gray-600">Current Volume</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19,2L14,6.5V17.5L19,13V2M6.5,5C4.55,5 2.45,5.4 1,6.5V21.16C1,21.41 1.25,21.66 1.5,21.66C1.6,21.66 1.65,21.59 1.75,21.59C3.1,20.94 5.05,20.68 6.5,20.68C8.45,20.68 10.55,21.1 12,22C13.35,21.15 15.8,20.68 17.5,20.68C19.15,20.68 20.85,21.1 22.25,21.81C22.35,21.86 22.4,21.93 22.5,21.93C22.75,21.93 23,21.68 23,21.43V7.5C23,7.06 22.81,6.65 22.5,6.5C21.8,6.05 20.85,5.5 19.5,5.5C17.8,5.5 15.35,5.97 14,6.82C12.65,5.97 10.2,5.5 8.5,5.5C7.6,5.5 6.75,5.6 6.05,5.8L6.5,5Z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Users Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-gray-900 mb-1">45</p>
                  <p className="text-sm text-gray-600">Total Users</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16,4C18.11,4 19.99,5.89 19.99,8C19.99,10.11 18.11,12 16,12C13.89,12 12,10.11 12,8C12,5.89 13.89,4 16,4M16,14C20.42,14 24,15.79 24,18V20H8V18C8,15.79 11.58,14 16,14M6,6V9H4V6H1V4H4V1H6V4H9V6H6M6,13V16H4V13H1V11H4V8H6V11H9V13H6Z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Status Distribution Donut Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3,3V21H21V3H3M20,20H4V4H20V20M15.5,17L20.5,12L15.5,7V10.5H9.5V13.5H15.5V17Z" />
                </svg>
                Status Distribution
              </h3>
              <div className="flex items-center justify-center h-64">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Submissions (Blue) - 40% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="30"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="15"
                      strokeDasharray="75.4 188.5"
                      strokeDashoffset="0"
                    />
                    {/* Editor (Orange) - 30% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="30"
                      fill="none"
                      stroke="#F97316"
                      strokeWidth="15"
                      strokeDasharray="56.5 188.5"
                      strokeDashoffset="-75.4"
                    />
                    {/* Reviewer (Purple) - 20% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="30"
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="15"
                      strokeDasharray="37.7 188.5"
                      strokeDashoffset="-131.9"
                    />
                    {/* Publication (Green) - 10% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="30"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="15"
                      strokeDasharray="18.85 188.5"
                      strokeDashoffset="-169.6"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Submissions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Editor</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Reviewer</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Publication</span>
                </div>
              </div>
            </div>

            {/* Yearly Publications Bar Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22,21H2V3H4V19H6V10H10V19H12V6H16V19H18V14H22V21Z" />
                </svg>
                Yearly Publications
              </h3>
              <div className="h-64 flex items-end justify-center space-x-8 px-4">
                <div className="flex flex-col items-center">
                  <div className="w-16 bg-blue-500 rounded-t-sm" style={{height: '60px'}}></div>
                  <span className="text-sm text-gray-600 mt-3">2021</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 bg-blue-500 rounded-t-sm" style={{height: '100px'}}></div>
                  <span className="text-sm text-gray-600 mt-3">2022</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 bg-blue-500 rounded-t-sm" style={{height: '140px'}}></div>
                  <span className="text-sm text-gray-600 mt-3">2023</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 bg-blue-500 rounded-t-sm" style={{height: '90px'}}></div>
                  <span className="text-sm text-gray-600 mt-3">2024</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-4 px-4">
                <span>0</span>
                <span>5</span>
                <span>10</span>
                <span>15</span>
                <span>20</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={handleCreateNewIssue}
                className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <span>📄</span>
                <span>Create New Issue</span>
              </button>
              <Link href="/dashboard/admin/users" className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                <span>👥</span>
                <span>Manage Users</span>
              </Link>
              <button className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                <span>⚙️</span>
                <span>Journal Settings</span>
              </button>
            </div>
          </div>

          {/* Articles for Publication */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Articles for Publication</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acceptance Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publication Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Cybersecurity Frameworks for Military Networks</h4>
                        <p className="text-sm text-gray-600">By Dr. Michael Chen, Maj. Sarah Davis</p>
                        <p className="text-sm text-gray-500 mt-1">An examination of cybersecurity frameworks tailored for military...</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                        Accepted
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">20/01/2024</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Pending publication</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">View</button>
                        <button className="text-green-600 hover:text-green-900 text-sm font-medium">Publish</button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Logistics Optimization in Joint Operations</h4>
                        <p className="text-sm text-gray-600">By Lt. Col. Robert Wilson, Dr. Emily Johnson</p>
                        <p className="text-sm text-gray-500 mt-1">This study presents optimization models for logistics planning in...</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                        Published
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">18/01/2024</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        <div>Vol. 15, Issue 1</div>
                        <div>Pages: 45-62</div>
                        <div className="text-xs text-gray-500">DOI: 10.1234/armyjournal.2024.15.1.003</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">View</button>
                        <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">Edit Details</button>
                      </div>
                    </td>
                  </tr>
                  {articles.length > 0 && articles.map((article) => (
                    <tr key={article.id}>
                      <td className="px-6 py-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{article.title}</h4>
                          <p className="text-sm text-gray-600">By {article.author_name}</p>
                          <p className="text-sm text-gray-500 mt-1">{article.content.substring(0, 80)}...</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          article.status === 'published' 
                            ? 'bg-blue-100 text-blue-800' 
                            : article.status === 'with_admin'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          <span className={`w-2 h-2 rounded-full mr-1 ${
                            article.status === 'published' 
                              ? 'bg-blue-400' 
                              : article.status === 'with_admin'
                              ? 'bg-green-400'
                              : 'bg-yellow-400'
                          }`}></span>
                          {article.status === 'published' ? 'Published' : 
                           article.status === 'with_admin' ? 'Accepted' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(article.updated_at).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {article.published_at ? (
                          <div>
                            <div>Published</div>
                            <div className="text-xs text-gray-500">{new Date(article.published_at).toLocaleDateString('en-GB')}</div>
                          </div>
                        ) : (
                          'Pending publication'
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Link href={`/administrator/articles/${article.id}`} className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            View
                          </Link>
                          {article.status === 'with_admin' && (
                            <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                              Publish
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {articles.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No articles for publication</h3>
                  <p className="mt-1 text-sm text-gray-500">Articles ready for publication will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
