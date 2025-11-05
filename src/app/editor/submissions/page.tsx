'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Eye, MessageSquare, Clock, User, Calendar, UserPlus, Send } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  content: string;
  status: string;
  author_name: string;
  reviewer_name: string;
  created_at: string;
  updated_at: string;
  submitted_at: string;
}

interface Reviewer {
  id: number;
  username: string;
  full_name: string;
  email: string;
}

export default function NewSubmissionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedReviewer, setSelectedReviewer] = useState<number | null>(null);
  const [assigning, setAssigning] = useState(false);

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
    fetchNewSubmissions(parsedUser.id);
    fetchReviewers();
  }, [router]);

  const fetchNewSubmissions = async (userId: number) => {
    try {
      const response = await fetch('/api/articles', {
        headers: {
          'x-user-id': userId.toString(),
          'x-user-role': 'editor'
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Filter for new submissions (submitted and under_review status)
        const newSubmissions = (data.articles || []).filter((article: Article) => 
          article.status === 'submitted' || article.status === 'under_review'
        );
        setArticles(newSubmissions);
      }
    } catch (error) {
      console.error('Error fetching new submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'x-user-role': 'reviewer'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setReviewers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching reviewers:', error);
    }
  };

  const handleAssignReviewer = (article: Article) => {
    setSelectedArticle(article);
    setSelectedReviewer(null);
    setShowAssignModal(true);
  };

  const handleConfirmAssignment = async () => {
    if (!selectedArticle || !selectedReviewer || !user) return;
    
    setAssigning(true);
    try {
      // Send review request instead of direct assignment
      const response = await fetch('/api/review-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          editor_id: user.id,
          reviewer_id: selectedReviewer,
          status: 'pending'
        })
      });

      if (response.ok) {
        setShowAssignModal(false);
        alert('📧 Review Request Sent Successfully!\n\nThe reviewer has been notified and will receive your request. They need to accept before they can start reviewing the article.');
      } else {
        const errorData = await response.json();
        console.error('Request error:', errorData);
        alert(`❌ Request Failed\n\n${errorData.error || 'Unable to send review request. Please try again later.'}`);
      }
    } catch (error) {
      console.error('Error sending review request:', error);
      alert('⚠️ Connection Error\n\nUnable to connect to the server. Please check your internet connection and try again.');
    } finally {
      setAssigning(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: 'bg-blue-500',
      under_review: 'bg-yellow-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'submitted') return <FileText className="w-4 h-4" />;
    if (status === 'under_review') return <Clock className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading submissions...</p>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">New Submissions</h1>
              <p className="text-gray-600 mt-1">Articles awaiting editorial review</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Total Submissions</div>
            <div className="text-3xl font-bold text-blue-600">{articles.length}</div>
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Articles for Editing ({articles.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {articles.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No new submissions</h3>
              <p className="mt-1 text-sm text-gray-500">New article submissions will appear here.</p>
            </div>
          ) : (
            articles.map(article => (
              <div key={article.id} className="px-6 py-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{article.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            by {article.author_name}
                          </div>
                          {article.reviewer_name && (
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              Reviewed by: {article.reviewer_name}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Updated: {new Date(article.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                          {formatArticlePreview(article.content)}
                        </p>
                      </div>
                      <div className="ml-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(article.status)}`}>
                          {getStatusIcon(article.status)}
                          <span className="ml-1">{article.status.replace('_', ' ').toUpperCase()}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Link
                        href={`/editor/articles/${article.id}/view`}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Article
                      </Link>
                      <button
                        onClick={() => handleAssignReviewer(article)}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Request Reviewer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Request Reviewer</h3>
            
            {selectedArticle && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Article:</p>
                <p className="font-medium">{selectedArticle.title}</p>
                <p className="text-sm text-gray-500">by {selectedArticle.author_name}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Reviewer:
              </label>
              <select
                value={selectedReviewer || ''}
                onChange={(e) => setSelectedReviewer(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Choose a reviewer...</option>
                {reviewers.map(reviewer => (
                  <option key={reviewer.id} value={reviewer.id}>
                    {reviewer.full_name || reviewer.username} ({reviewer.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={assigning}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssignment}
                disabled={!selectedReviewer || assigning}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assigning ? 'Sending Request...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
