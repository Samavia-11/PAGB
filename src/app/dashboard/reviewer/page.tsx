'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Eye,
  Edit,
  Send,
  Calendar,
  User,
  AlertTriangle
} from 'lucide-react';

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
}

interface ArticleForReview {
  id: number;
  title: string;
  abstract: string;
  authors: string;
  submission_date: string;
  status: 'pending' | 'in_review' | 'completed';
  deadline: string;
  priority: 'high' | 'medium' | 'low';
}

interface ReviewerAssignment {
  id: number;
  articleId: number;
  articleTitle: string;
  articleAbstract: string;
  articleContent?: string;
  reviewerId: number;
  reviewerName: string;
  comment: string;
  status: 'pending' | 'accepted' | 'rejected';
  assignedDate: string;
}

interface EditorForwardedArticle {
  id: number;
  article_id: number;
  editor_id: number;
  reviewer_id: number;
  title: string;
  abstract: string;
  content?: string;
  editor_instructions?: string;
  attachment_name?: string | null;
  attachment_path?: string | null;
  attachment_type?: string | null;
  attachment_size?: number | null;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  assigned_date: string;
  response_date?: string;
  editor_name?: string;
  reviewer_name?: string;
  author_name?: string;
  author_username?: string;
}

const ReviewerDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'forwarded' | 'reviewed'>('forwarded');
  const [articles, setArticles] = useState<ArticleForReview[]>([]);
  const [assignments, setAssignments] = useState<ReviewerAssignment[]>([]);
  const [forwardedArticles, setForwardedArticles] = useState<EditorForwardedArticle[]>([]);
  const [processingForwardedId, setProcessingForwardedId] = useState<number | null>(null);
  const [selectedForwarded, setSelectedForwarded] = useState<EditorForwardedArticle | null>(null);
  const [selectedForwardedDetails, setSelectedForwardedDetails] = useState<EditorForwardedArticle | null>(null);
  const [forwardedModalOpen, setForwardedModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ArticleForReview | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<ReviewerAssignment | null>(null);
  const [reviewContent, setReviewContent] = useState('');
  const [recommendation, setRecommendation] = useState<'accept' | 'minor_revision' | 'major_revision' | 'reject'>('minor_revision');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadAssignedArticles();
    loadAssignments();
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchForwardedArticles(user.id);
    const interval = setInterval(() => fetchForwardedArticles(user.id), 5000);
    return () => clearInterval(interval);
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.user.role !== 'reviewer') {
          router.push('/');
          return;
        }
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchForwardedArticles = async (userId: number) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
      const response = await fetch(`/api/editor-articles?reviewerId=${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (response.ok) {
        const data = await response.json();
        setForwardedArticles(data.editorArticles || []);
      }
    } catch (error) {
      console.error('Failed to fetch forwarded articles:', error);
    }
  };

  const handleForwardedAction = async (editorArticleId: number, action: 'accept' | 'reject') => {
    try {
      setProcessingForwardedId(editorArticleId);
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
      const response = await fetch(`/api/editor-articles/${editorArticleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        alert(err.error || 'Failed to update status');
        return;
      }

      if (user) {
        await fetchForwardedArticles(user.id);
      }
    } catch (error) {
      console.error('Failed to update forwarded article:', error);
      alert('Failed to update status');
    } finally {
      setProcessingForwardedId(null);
    }
  };

  const openForwarded = async (item: EditorForwardedArticle) => {
    try {
      setSelectedForwarded(item);
      setSelectedForwardedDetails(null);
      setForwardedModalOpen(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
      const response = await fetch(`/api/editor-articles/${item.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedForwardedDetails(data.editorArticle);
      }
    } catch (error) {
      console.error('Failed to open forwarded article:', error);
    }
  };

  const loadAssignedArticles = async () => {
    // Mock data for assigned articles
    const mockArticles: ArticleForReview[] = [
      {
        id: 1,
        title: "Advanced Combat Tactics in Urban Environments",
        abstract: "This paper explores innovative combat tactics specifically designed for urban warfare scenarios, analyzing effectiveness through simulation studies and historical case analysis...",
        authors: "Col. James Miller, Dr. Lisa Thompson",
        submission_date: "2024-01-10",
        status: "pending",
        deadline: "2024-02-10",
        priority: "high"
      },
      {
        id: 2,
        title: "Cybersecurity Frameworks for Military Networks",
        abstract: "An examination of cybersecurity frameworks tailored for military network infrastructure, focusing on threat detection and response mechanisms...",
        authors: "Dr. Michael Chen, Maj. Sarah Davis",
        submission_date: "2024-01-08",
        status: "in_review",
        deadline: "2024-02-08",
        priority: "medium"
      },
      {
        id: 3,
        title: "Logistics Optimization in Joint Operations",
        abstract: "This study presents optimization models for logistics planning in joint military operations, with emphasis on resource allocation and supply chain efficiency...",
        authors: "Lt. Col. Robert Wilson, Dr. Emily Johnson",
        submission_date: "2024-01-05",
        status: "completed",
        deadline: "2024-02-05",
        priority: "low"
      }
    ];
    setArticles(mockArticles);
  };

  const loadAssignments = () => {
    const allAssignments = JSON.parse(localStorage.getItem('reviewerAssignments') || '[]') as ReviewerAssignment[];
    // Filter assignments for current reviewer (in real app, would filter by reviewerId)
    const reviewerAssignments = allAssignments.filter(a => a.reviewerId === 1); // Mock reviewer ID
    setAssignments(reviewerAssignments);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'in_review':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "badge";
    switch (status) {
      case 'pending':
        return `${baseClasses} badge-under-review`;
      case 'in_review':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'completed':
        return `${baseClasses} badge-accepted`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const baseClasses = "badge";
    switch (priority) {
      case 'high':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'medium':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'low':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const startReview = (article: ArticleForReview) => {
    setSelectedArticle(article);
    setShowReviewModal(true);
    setReviewContent('');
    setRecommendation('minor_revision');
  };

  const submitReview = async () => {
    if (!selectedArticle || !reviewContent.trim()) {
      alert('Please provide review comments before submitting.');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update article status
      setArticles(prev => prev.map(article => 
        article.id === selectedArticle.id 
          ? { ...article, status: 'completed' as const }
          : article
      ));
      
      setShowReviewModal(false);
      alert('Review submitted successfully and forwarded to editor!');
    } catch (error) {
      console.error('Submit review error:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-academic-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-academic-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-academic-900 font-serif">Reviewer Dashboard</h1>
        <p className="text-academic-600 mt-2">
          Review assigned articles and provide feedback to help maintain publication quality.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('forwarded')}
          style={{ color: activeTab === 'forwarded' ? '#ffffff' : '#111827' }}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold border shadow-sm transition-colors ${
            activeTab === 'forwarded'
              ? 'bg-primary-600 !text-white border-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40'
              : 'bg-white !text-gray-900 border-academic-200 hover:bg-academic-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30'
          }`}
        >
          Forwarded From Editor
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reviewed')}
          style={{ color: activeTab === 'reviewed' ? '#ffffff' : '#111827' }}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold border shadow-sm transition-colors ${
            activeTab === 'reviewed'
              ? 'bg-primary-600 !text-white border-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40'
              : 'bg-white !text-gray-900 border-academic-200 hover:bg-academic-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30'
          }`}
        >
          Reviewed Articles
        </button>
      </div>

      {/* Forwarded From Editor */}
      {activeTab === 'forwarded' ? (
        <div className="bg-white rounded-lg shadow-sm border border-academic-200 mb-8">
          <div className="p-6 border-b border-academic-200">
            <h2 className="text-xl font-semibold text-academic-900">Forwarded From Editor</h2>
          </div>

          {forwardedArticles.length === 0 ? (
            <div className="p-6 text-academic-600">No forwarded articles.</div>
          ) : (
            <div className="divide-y divide-academic-200">
              {forwardedArticles.map((item) => (
                <div key={item.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-academic-900 truncate">{item.title}</div>
                      <div className="text-sm text-academic-600 mt-1 line-clamp-2">{item.abstract}</div>
                      <div className="text-xs text-academic-500 mt-2">
                        From: {item.editor_name || 'Editor'}
                        {item.assigned_date ? ` • ${new Date(item.assigned_date).toLocaleString()}` : ''}
                      </div>
                      {item.editor_instructions && (
                        <div className="text-xs text-academic-600 mt-2">Instructions: {item.editor_instructions}</div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                      <span
                        className={`badge ${
                          item.status === 'pending'
                            ? 'badge-under-review'
                            : item.status === 'accepted'
                              ? 'badge-accepted'
                              : 'badge-rejected'
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openForwarded(item)}
                          className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Open
                        </button>
                        <button
                          onClick={() => handleForwardedAction(item.id, 'accept')}
                          disabled={item.status !== 'pending' || processingForwardedId === item.id}
                          className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {processingForwardedId === item.id ? '...' : 'Accept'}
                        </button>
                        <button
                          onClick={() => handleForwardedAction(item.id, 'reject')}
                          disabled={item.status !== 'pending' || processingForwardedId === item.id}
                          className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {processingForwardedId === item.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Reviewed Articles */}
      {activeTab === 'reviewed' ? (
        <div className="bg-white rounded-lg shadow-sm border border-academic-200 mb-8">
          <div className="p-6 border-b border-academic-200">
            <h2 className="text-xl font-semibold text-academic-900">Reviewed Articles</h2>
            <p className="text-sm text-academic-600 mt-1">Articles you accepted from editor can be forwarded back with your document and comments.</p>
          </div>

          {forwardedArticles.filter((a) => a.status === 'accepted').length === 0 ? (
            <div className="p-6 text-academic-600">No accepted articles yet.</div>
          ) : (
            <div className="divide-y divide-academic-200">
              {forwardedArticles
                .filter((a) => a.status === 'accepted')
                .map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-academic-900 truncate">{item.title}</div>
                        <div className="text-sm text-academic-600 mt-1 line-clamp-2">{item.abstract}</div>
                        <div className="text-xs text-academic-500 mt-2">
                          From: {item.editor_name || 'Editor'}
                          {item.assigned_date ? ` • ${new Date(item.assigned_date).toLocaleString()}` : ''}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 items-end">
                        <span className="badge badge-accepted">ACCEPTED</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/dashboard/reviewer/forward-to-editor?editorArticleId=${item.id}`)}
                            className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Forward
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-academic-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-academic-900">
                {articles.filter(a => a.status === 'pending').length}
              </p>
              <p className="text-academic-600">Pending Reviews</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-academic-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-academic-900">
                {articles.filter(a => a.status === 'in_review').length}
              </p>
              <p className="text-academic-600">In Progress</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-academic-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-academic-900">
                {articles.filter(a => a.status === 'completed').length}
              </p>
              <p className="text-academic-600">Completed</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-academic-200">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-academic-900">
                {articles.filter(a => getDaysUntilDeadline(a.deadline) <= 7).length}
              </p>
              <p className="text-academic-600">Due Soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-lg shadow-sm border border-academic-200">
        <div className="p-6 border-b border-academic-200">
          <h2 className="text-xl font-semibold text-academic-900">Assigned Articles</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-academic-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-academic-200">
              {articles.map((article) => {
                const daysLeft = getDaysUntilDeadline(article.deadline);
                return (
                  <tr key={article.id} className="hover:bg-academic-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-academic-900">
                          {article.title}
                        </div>
                        <div className="text-sm text-academic-500 mt-1">
                          By {article.authors}
                        </div>
                        <div className="text-sm text-academic-500 mt-1 line-clamp-2">
                          {article.abstract}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getStatusIcon(article.status)}
                        <span className={`ml-2 ${getStatusBadge(article.status)}`}>
                          {article.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getPriorityBadge(article.priority)}>
                        {article.priority.charAt(0).toUpperCase() + article.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-academic-900">
                        {new Date(article.deadline).toLocaleDateString()}
                      </div>
                      <div className={`text-xs ${daysLeft <= 7 ? 'text-red-600' : 'text-academic-500'}`}>
                        {daysLeft > 0 ? `${daysLeft} days left` : `${Math.abs(daysLeft)} days overdue`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                          View
                        </button>
                        {article.status !== 'completed' && (
                          <button 
                            onClick={() => startReview(article)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            {article.status === 'pending' ? 'Start Review' : 'Continue Review'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-academic-200">
              <h3 className="text-xl font-semibold text-academic-900">Review Article</h3>
              <p className="text-academic-600 mt-1">{selectedArticle.title}</p>
            </div>
            
            <div className="p-6">
              {/* Article Details */}
              <div className="mb-6">
                <h4 className="font-medium text-academic-900 mb-2">Article Information</h4>
                <div className="bg-academic-50 rounded-lg p-4">
                  <p className="text-sm text-academic-700"><strong>Authors:</strong> {selectedArticle.authors}</p>
                  <p className="text-sm text-academic-700 mt-2"><strong>Abstract:</strong></p>
                  <p className="text-sm text-academic-600 mt-1">{selectedArticle.abstract}</p>
                </div>
              </div>

              {/* Review Form */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-academic-700 mb-2">
                  Recommendation
                </label>
                <select
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value as any)}
                  className="form-input"
                >
                  <option value="accept">Accept</option>
                  <option value="minor_revision">Minor Revision</option>
                  <option value="major_revision">Major Revision</option>
                  <option value="reject">Reject</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-academic-700 mb-2">
                  Review Comments *
                </label>
                <textarea
                  rows={10}
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  className="form-textarea"
                  placeholder="Provide detailed feedback on the article's methodology, findings, writing quality, and suggestions for improvement..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-academic-200 flex justify-end space-x-4">
              <button
                onClick={() => setShowReviewModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                className="btn-primary flex items-center"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forwarded Article Modal */}
      {forwardedModalOpen && selectedForwarded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-academic-200 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-xl font-semibold text-academic-900 truncate">{selectedForwarded.title}</h3>
                <p className="text-academic-600 mt-1">{selectedForwarded.editor_name || 'Editor'}</p>
              </div>
              <button
                onClick={() => {
                  setForwardedModalOpen(false);
                  setSelectedForwarded(null);
                  setSelectedForwardedDetails(null);
                }}
                className="btn-secondary"
              >
                Close
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-medium text-academic-900 mb-2">Abstract</h4>
                <div className="bg-academic-50 rounded-lg p-4 text-academic-700 whitespace-pre-wrap">
                  {selectedForwardedDetails?.abstract || selectedForwarded.abstract}
                </div>
              </div>

              {(selectedForwardedDetails?.attachment_path || selectedForwarded.attachment_path) ? (
                <div>
                  <h4 className="font-medium text-academic-900 mb-2">Attachment</h4>
                  <div className="bg-academic-50 rounded-lg p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-academic-900 truncate">
                          {selectedForwardedDetails?.attachment_name || selectedForwarded.attachment_name || 'Attachment'}
                        </div>
                        {typeof (selectedForwardedDetails?.attachment_size ?? selectedForwarded.attachment_size) === 'number' ? (
                          <div className="text-xs text-academic-600">
                            {Math.round(((selectedForwardedDetails?.attachment_size ?? selectedForwarded.attachment_size) as number) / 1024)} KB
                          </div>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={(selectedForwardedDetails?.attachment_path || selectedForwarded.attachment_path) as string}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-secondary"
                        >
                          Open
                        </a>
                        <a
                          href={(selectedForwardedDetails?.attachment_path || selectedForwarded.attachment_path) as string}
                          download
                          className="btn-primary"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div>
                <h4 className="font-medium text-academic-900 mb-2">Document</h4>
                <div className="bg-academic-50 rounded-lg p-4 text-academic-700 whitespace-pre-wrap">
                  {selectedForwardedDetails?.content || selectedForwarded.content || 'No content provided.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ReviewerDashboard;
