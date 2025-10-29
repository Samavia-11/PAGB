'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Issue {
  id: string;
  volume: string;
  issue: string;
  issueDate: string;
  abstract: string;
  editorInChief: string;
  associateEditor: string;
  managingEditor: string;
  issnPrint: string;
  issnOnline: string;
  publisher: string;
  frequency: string;
  language: string;
  status: string;
  publishedAt: string;
  createdAt: string;
}

export default function CurrentIssueList() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<Issue[]>([]);

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
    loadIssues();
  }, [router]);

  const loadIssues = () => {
    try {
      const publishedIssues = JSON.parse(localStorage.getItem('publishedIssues') || '[]');
      setIssues(publishedIssues);
    } catch (error) {
      console.error('Error loading issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-green-700 text-white flex flex-col fixed h-full overflow-y-auto">
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
            <li>
              <Link href="/administrator/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-green-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />
                </svg>
                <span>Home</span>
              </Link>
            </li>
            
            <li>
              <Link href="/administrator/current-issue" className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-green-600 text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                <span>Current Issue</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-green-600">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">{user?.name?.charAt(0) || 'A'}</span>
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name || 'Administrator'}</p>
              <p className="text-xs text-green-200">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-green-200 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Current Issues</h1>
          <p className="text-gray-600">View all published journal issues</p>
        </div>

        {/* Issues List */}
        {issues.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Issues Published</h2>
            <p className="text-gray-600 mb-6">There are no published issues yet. Create a new issue to get started.</p>
            <button
              onClick={() => router.push('/administrator/current-issue/form')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Create New Issue
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {issues.map((issue, index) => (
              <div key={issue.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Issue Header */}
                <div className="bg-green-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        Volume {issue.volume}, Issue {issue.issue}
                      </h2>
                      <div className="flex items-center space-x-4 text-green-100">
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z" />
                          </svg>
                          <span>{formatDate(issue.issueDate)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
                          </svg>
                          <span>Published</span>
                        </span>
                      </div>
                    </div>
                    {index === 0 && (
                      <div className="bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium">
                        Latest Issue
                      </div>
                    )}
                  </div>
                  <p className="mt-4 text-green-100 leading-relaxed">
                    {issue.abstract}
                  </p>
                </div>

                {/* Issue Information */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Editorial Board */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Editorial Board</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium text-green-700">Editor-in-Chief:</span>
                          <span className="ml-2 text-gray-700">{issue.editorInChief}</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-700">Associate Editor:</span>
                          <span className="ml-2 text-gray-700">{issue.associateEditor}</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-700">Managing Editor:</span>
                          <span className="ml-2 text-gray-700">{issue.managingEditor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Publication Details */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Publication Details</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium text-green-700">ISSN:</span>
                          <span className="ml-2 text-gray-700">{issue.issnPrint} (Print), {issue.issnOnline} (Online)</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-700">Publisher:</span>
                          <span className="ml-2 text-gray-700">{issue.publisher}</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-700">Frequency:</span>
                          <span className="ml-2 text-gray-700">{issue.frequency}</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-700">Language:</span>
                          <span className="ml-2 text-gray-700">{issue.language}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
