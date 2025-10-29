'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Article {
  id: number;
  title: string;
  content: string;
  status: string;
  author_name: string;
  reviewer_name: string;
  created_at: string;
  updated_at: string;
}

export default function EditorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to parse and format article content for display
  const formatArticlePreview = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      
      // Extract meaningful information from the manuscript
      let preview = '';
      
      if (parsed.manuscript) {
        const manuscript = parsed.manuscript;
        
        // Add article type
        if (manuscript.articleType) {
          preview += `Type: ${manuscript.articleType.replace('_', ' ').toUpperCase()}`;
        }
        
        // Add abstract if available and not placeholder
        if (manuscript.abstract && manuscript.abstract !== 'nnn') {
          preview += preview ? ' | ' : '';
          preview += `Abstract: ${manuscript.abstract.substring(0, 100)}${manuscript.abstract.length > 100 ? '...' : ''}`;
        }
        
        // Add keywords if available
        if (manuscript.keywords && manuscript.keywords.length > 0) {
          preview += preview ? ' | ' : '';
          preview += `Keywords: ${manuscript.keywords.join(', ')}`;
        }
        
        // Add file name if available
        if (manuscript.fileName) {
          preview += preview ? ' | ' : '';
          preview += `File: ${manuscript.fileName}`;
        }
        
        // If no meaningful content found, show a default message
        if (!preview) {
          preview = 'Research manuscript submitted for review';
        }
      } else {
        // Handle other JSON structures
        preview = 'Manuscript data available for review';
      }
      
      return preview;
    } catch (error) {
      // If it's not JSON, return the content as is (truncated)
      return content.substring(0, 150);
    }
  };

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'editor') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
    fetchArticles(parsedUser.id);
  }, [router]);

  const fetchArticles = async (userId: number) => {
    try {
      const response = await fetch('/api/articles', {
        headers: {
          'x-user-id': userId.toString(),
          'x-user-role': 'editor'
        }
      });
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


  const handlePublish = async (articleId: number) => {
    if (!confirm('Publish this article?')) return;
    try {
      const response = await fetch(`/api/articles/${articleId}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish',
          from_user_id: user.id,
          from_role: user.role
        })
      });
      if (response.ok) {
        alert('Article published successfully!');
        fetchArticles(user.id);
      } else {
        alert('Failed to publish article');
      }
    } catch (error) {
      alert('Error publishing article');
    }
  };

  const handleReject = async (articleId: number) => {
    if (!confirm('Reject this article?')) return;
    try {
      const response = await fetch(`/api/articles/${articleId}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          from_user_id: user.id,
          from_role: user.role
        })
      });
      if (response.ok) {
        alert('Article rejected');
        fetchArticles(user.id);
      } else {
        alert('Failed to reject article');
      }
    } catch (error) {
      alert('Error rejecting article');
    }
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
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editor Dashboard</h1>
        <p className="text-sm text-gray-600">Welcome back, {user?.fullName}</p>
      </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Editing</p>
                <p className="text-2xl font-bold text-gray-900">
                  {articles.filter(a => a.status === 'with_editor').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">With Administrator</p>
                <p className="text-2xl font-bold text-gray-900">
                  {articles.filter(a => a.status === 'with_admin').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Edited</p>
                <p className="text-2xl font-bold text-gray-900">{articles.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New Submissions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {articles.filter(a => a.status === 'submitted' || a.status === 'pending_review').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reviews</p>
                <p className="text-2xl font-bold text-gray-900">
                  {articles.filter(a => a.status === 'under_review' || a.status === 'reviewed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-teal-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reply from Author</p>
                <p className="text-2xl font-bold text-gray-900">
                  {articles.filter(a => a.status === 'author_revision' || a.status === 'resubmitted').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Articles List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Articles for Editing</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {articles.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No articles to edit</h3>
                <p className="mt-1 text-sm text-gray-500">Articles forwarded by reviewers will appear here.</p>
              </div>
            ) : (
              articles.map((article) => (
                <div key={article.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Link href={`/editor/articles/${article.id}`} className="block">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600">
                            {article.title}
                          </h3>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                            {article.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {formatArticlePreview(article.content)}
                        </p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>Author: {article.author_name}</span>
                          <span>Reviewed by: {article.reviewer_name}</span>
                          <span>Updated: {new Date(article.updated_at).toLocaleDateString()}</span>
                        </div>
                      </Link>
                    </div>
                    <div className="ml-4 flex space-x-2">
                      <Link
                        href={`/editor/articles/${article.id}`}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        Edit
                      </Link>
                      {article.status === 'with_editor' && (
                        <>
                          <button
                            onClick={() => handlePublish(article.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            Publish
                          </button>
                          <button
                            onClick={() => handleReject(article.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
    </>
  );
}
