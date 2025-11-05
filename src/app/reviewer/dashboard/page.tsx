'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Clock, CheckCircle, Mail, Check, X, Download, Eye } from 'lucide-react';
import { showNotification } from '@/utils/notifications';

interface Article {
  id: number;
  title: string;
  content: string;
  status: string;
  author_name: string;
  created_at: string;
  submitted_at: string;
}

interface ReviewRequest {
  id: number;
  editor_id: number;
  reviewer_id: number;
  status: string;
  created_at: string;
  editor_name: string;
  editor_username: string;
  editor_email: string;
}

export default function ReviewerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [reviewRequests, setReviewRequests] = useState<ReviewRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<number | null>(null);

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

  // Function to handle article download
  const handleDownload = async (articleId: number, title: string) => {
    try {
      const response = await fetch(`/api/articles/${articleId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('⚠️ Download Failed\n\nUnable to download the article. Please try again later.');
      }
    } catch (error) {
      console.error('Error downloading article:', error);
      alert('⚠️ Connection Error\n\nUnable to connect to the server. Please check your internet connection and try again.');
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
    if (parsedUser.role !== 'reviewer') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
    fetchArticles(parsedUser.id);
    fetchReviewRequests(parsedUser.id);

    // Set up real-time polling for both articles and review requests
    const articlesInterval = setInterval(() => {
      fetchArticles(parsedUser.id);
    }, 5000); // Check for new articles every 5 seconds

    const requestsInterval = setInterval(() => {
      fetchReviewRequests(parsedUser.id);
    }, 3000); // Check for review requests every 3 seconds

    // Cleanup intervals on component unmount
    return () => {
      clearInterval(articlesInterval);
      clearInterval(requestsInterval);
    };
  }, [router]);

  const fetchArticles = async (userId: number) => {
    try {
      const response = await fetch('/api/articles', {
        headers: {
          'x-user-id': userId.toString(),
          'x-user-role': 'reviewer'
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

  const fetchReviewRequests = async (userId: number) => {
    try {
      const response = await fetch(`/api/review-requests?user_id=${userId}&role=reviewer`);
      
      if (response.ok) {
        const data = await response.json();
        setReviewRequests(data.requests || []);
      } else {
        console.error('Failed to fetch review requests');
      }
    } catch (error) {
      console.error('Error fetching review requests:', error);
    }
  };

  const handleRequestAction = async (requestId: number, action: 'accept' | 'reject') => {
    if (!user) return;
    
    setProcessingRequest(requestId);
    try {
      const response = await fetch(`/api/review-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          reviewer_id: user.id
        })
      });

      if (response.ok) {
        if (action === 'accept') {
          alert('✅ Review Request Accepted Successfully!\n\nYou have accepted the review request. You can now communicate with the editor and start reviewing articles.');
        } else {
          alert('❌ Review Request Rejected\n\nYou have declined the review request. The editor has been notified of your decision.');
        }
        fetchReviewRequests(user.id); // Refresh the requests
      } else {
        const error = await response.json();
        alert(`⚠️ Action Failed\n\n${error.error || `Unable to ${action} review request. Please try again.`}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing review request:`, error);
      alert('⚠️ Connection Error\n\nUnable to connect to the server. Please check your internet connection and try again.');
    } finally {
      setProcessingRequest(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[forestgreen] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Reviewer Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.fullName}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {articles.filter(a => a.status === 'submitted').length}
              </p>
            </div>
          </div>
        </div>


        <button
          onClick={() => {
            if (articles.length > 0) {
              router.push(`/reviewer/forward-article?article=${articles[0].id}`);
            } else {
              showNotification.info('No articles available to forward');
            }
          }}
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer text-left w-full"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Forward to Editor</p>
              <p className="text-2xl font-bold text-gray-900">
                {articles.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">Click to forward article</p>
            </div>
          </div>
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Review Requests</p>
              <p className="text-2xl font-bold text-gray-900">
                {reviewRequests.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Review Requests Section */}
      {reviewRequests.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-purple-600" />
              Review Requests ({reviewRequests.filter(r => r.status === 'pending').length} pending)
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {reviewRequests.filter(r => r.status === 'pending').map((request) => (
              <div key={request.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold">
                        {(request.editor_name || request.editor_username || 'E').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Review Request from {request.editor_name || request.editor_username}
                        </h3>
                        <p className="text-sm text-gray-600">
                          @{request.editor_username} • {request.editor_email}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Received: {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRequestAction(request.id, 'accept')}
                      disabled={processingRequest === request.id}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {processingRequest === request.id ? 'Processing...' : 'Accept'}
                    </button>
                    <button
                      onClick={() => handleRequestAction(request.id, 'reject')}
                      disabled={processingRequest === request.id}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {processingRequest === request.id ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Articles List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Articles for Review</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {articles.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No articles to review</h3>
              <p className="mt-1 text-sm text-gray-500">Articles submitted by authors will appear here.</p>
            </div>
          ) : (
            articles.map((article) => (
              <div key={article.id} className="px-6 py-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{article.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            Author: {article.author_name}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Submitted: {new Date(article.submitted_at).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                          {formatArticlePreview(article.content)}
                        </p>
                      </div>
                      <div className="ml-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white bg-green-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {article.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Link
                        href={`/reviewer/articles/${article.id}/view`}
                        className="flex items-center px-4 py-2 bg-[forestgreen] text-white rounded-lg hover:bg-[#1d7a1d] transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review Article
                      </Link>
                      <button
                        onClick={() => handleDownload(article.id, article.title)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </button>
                      <Link
                        href={`/reviewer/forward-article?article=${article.id}`}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Forward to Editor
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
