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

const ReviewerDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<ArticleForReview[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<ArticleForReview | null>(null);
  const [reviewContent, setReviewContent] = useState('');
  const [recommendation, setRecommendation] = useState<'accept' | 'minor_revision' | 'major_revision' | 'reject'>('minor_revision');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadAssignedArticles();
  }, []);

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
    </Layout>
  );
};

export default ReviewerDashboard;
