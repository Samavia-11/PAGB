'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, FileText, CheckCircle, XCircle, Clock, Eye, Edit, Send, Users, BookOpen, Award, MessageSquare } from 'lucide-react';

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
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [publications, setPublications] = useState<any[]>([]);
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
    fetchReviewers();
    fetchPublications();
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

  const fetchReviewers = async () => {
    try {
      const response = await fetch('/api/users?role=reviewer');
      if (response.ok) {
        const data = await response.json();
        setReviewers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching reviewers:', error);
    }
  };

  const fetchPublications = async () => {
    try {
      const response = await fetch('/api/articles?status=published');
      if (response.ok) {
        const data = await response.json();
        setPublications(data.articles || []);
      }
    } catch (error) {
      console.error('Error fetching publications:', error);
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500',
      submitted: 'bg-blue-500',
      under_review: 'bg-yellow-500',
      with_editor: 'bg-purple-500',
      with_admin: 'bg-orange-500',
      published: 'bg-green-500',
      rejected: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Login</h2>
          <a href="/login" className="text-blue-600 hover:underline">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">PAGB Editor Dashboard</h1>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-gray-500 text-sm">New Submissions</div>
              <div className="text-2xl font-bold">{articles.filter(a => a.status === 'submitted' || a.status === 'under_review').length}</div>
            </div>
          </div>
          <Link href="/editor/reviewers" className="bg-white rounded-lg shadow p-4 flex items-center gap-3 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="w-9 h-9 rounded bg-orange-100 text-orange-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-gray-500 text-sm">Reviewers</div>
              <div className="text-2xl font-bold">{reviewers.length}</div>
            </div>
          </Link>
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-green-100 text-green-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-gray-500 text-sm">Publications</div>
              <div className="text-2xl font-bold">{publications.length}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Articles */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Articles for Editing
              </h2>
              <div className="space-y-4">
                {articles.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium mb-2">No articles to edit</p>
                    <p className="text-sm">Articles forwarded by reviewers will appear here.</p>
                  </div>
                ) : (
                  articles.map(article => (
                    <div key={article.id} className="border-b pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold">{article.title}</h3>
                          <p className="text-sm text-gray-600">by {article.author_name}</p>
                          <p className="text-sm text-gray-600">Reviewed by: {article.reviewer_name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Updated: {new Date(article.updated_at).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {formatArticlePreview(article.content)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(article.status)}`}>
                            {article.status === 'submitted' ? 'VIEW' : article.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <Link
                          href={`/editor/articles/${article.id}/view`}
                          className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                        <Link
                          href={`/editor/articles/${article.id}/chat`}
                          className="flex items-center px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Comments
                        </Link>
                        {article.status === 'with_editor' && (
                          <>
                            <button
                              onClick={() => handlePublish(article.id)}
                              className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Publish
                            </button>
                            <button
                              onClick={() => handleReject(article.id)}
                              className="flex items-center px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Dashboard Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Dashboard Overview
                </h2>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded border bg-blue-50">
                  <div className="flex items-start space-x-2">
                    <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">New Submissions</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {articles.filter(a => a.status === 'submitted' || a.status === 'under_review').length} articles awaiting review
                      </p>
                    </div>
                  </div>
                </div>
                
                <Link href="/editor/reviewers" className="p-3 rounded border bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer block">
                  <div className="flex items-start space-x-2">
                    <Users className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">Active Reviewers</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {reviewers.length} reviewers available
                      </p>
                    </div>
                  </div>
                </Link>

                <div className="p-3 rounded border bg-green-50">
                  <div className="flex items-start space-x-2">
                    <Award className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">Publications</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {publications.length} articles published
                      </p>
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
