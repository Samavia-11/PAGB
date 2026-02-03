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
  Users,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { sanitizeMultilineText, getValidationError } from '@/utils/validation';

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
}

interface ArticleForEditor {
  id: number;
  title: string;
  abstract: string;
  authors: string;
  submission_date: string;
  status: 'reviewed' | 'editor_review' | 'accepted' | 'rejected';
  reviewer_recommendation: 'accept' | 'minor_revision' | 'major_revision' | 'reject';
  reviewer_comments: string;
  reviewer_name: string;
  priority: 'high' | 'medium' | 'low';
}

const EditorDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<ArticleForEditor[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<ArticleForEditor | null>(null);
  const [editorDecision, setEditorDecision] = useState<'accept' | 'minor_revision' | 'major_revision' | 'reject'>('accept');
  const [editorComments, setEditorComments] = useState('');
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [realTimeStats, setRealTimeStats] = useState({
    publishedArticles: 156,
    activeAuthors: 89,
    issuesPublished: 12,
    monthlyReaders: 2300
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setIsUpdating(true);
      setRealTimeStats(prev => {
        const newStats = {
          publishedArticles: prev.publishedArticles + Math.floor(Math.random() * 3), // More frequent updates
          activeAuthors: Math.max(85, prev.activeAuthors + Math.floor(Math.random() * 5) - 2), // More variation
          issuesPublished: prev.issuesPublished + (Math.random() > 0.95 ? 1 : 0), // Rare updates
          monthlyReaders: Math.max(2000, prev.monthlyReaders + Math.floor(Math.random() * 200) - 100) // More variation
        };
        console.log('Updating stats:', newStats); // Debug log
        return newStats;
      });
      
      // Reset update indicator after animation
      setTimeout(() => setIsUpdating(false), 500);
    }, 2000); // Update every 2 seconds for faster visibility

    return () => clearInterval(interval);
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.user.role !== 'editor') {
          router.push('/');
          return;
        }
        setUser(data.user);
        router.replace('/dashboard/editor/article-management');
        return;
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

  const loadReviewedArticles = async () => {
    // Mock data for articles forwarded by reviewers
    const mockArticles: ArticleForEditor[] = [
      {
        id: 1,
        title: "Advanced Combat Tactics in Urban Environments",
        abstract: "This paper explores innovative combat tactics specifically designed for urban warfare scenarios, analyzing effectiveness through simulation studies and historical case analysis...",
        authors: "Col. James Miller, Dr. Lisa Thompson",
        submission_date: "2024-01-10",
        status: "reviewed",
        reviewer_recommendation: "minor_revision",
        reviewer_comments: "The paper presents valuable insights into urban warfare tactics. However, the methodology section needs clarification on simulation parameters. The historical analysis is comprehensive but could benefit from more recent case studies. Overall, this is a solid contribution that requires minor revisions before publication.",
        reviewer_name: "Dr. Sarah Johnson",
        priority: "high"
      },
      {
        id: 2,
        title: "Cybersecurity Frameworks for Military Networks",
        abstract: "An examination of cybersecurity frameworks tailored for military network infrastructure, focusing on threat detection and response mechanisms...",
        authors: "Dr. Michael Chen, Maj. Sarah Davis",
        submission_date: "2024-01-08",
        status: "editor_review",
        reviewer_recommendation: "accept",
        reviewer_comments: "Excellent paper with strong theoretical foundation and practical applications. The proposed framework is innovative and addresses current gaps in military cybersecurity. The experimental validation is thorough and convincing. I recommend acceptance with no revisions required.",
        reviewer_name: "Prof. Robert Wilson",
        priority: "medium"
      },
      {
        id: 3,
        title: "Logistics Optimization in Joint Operations",
        abstract: "This study presents optimization models for logistics planning in joint military operations, with emphasis on resource allocation and supply chain efficiency...",
        authors: "Lt. Col. Robert Wilson, Dr. Emily Johnson",
        submission_date: "2024-01-05",
        status: "accepted",
        reviewer_recommendation: "accept",
        reviewer_comments: "Well-structured paper with clear methodology and significant findings. The optimization models are mathematically sound and the case study demonstrates practical applicability. This work will be valuable for military logistics professionals.",
        reviewer_name: "Dr. Maria Rodriguez",
        priority: "low"
      }
    ];
    setArticles(mockArticles);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reviewed':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'editor_review':
        return <Edit className="w-4 h-4 text-purple-500" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "badge";
    switch (status) {
      case 'reviewed':
        return `${baseClasses} badge-reviewed`;
      case 'editor_review':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'accepted':
        return `${baseClasses} badge-accepted`;
      case 'rejected':
        return `${baseClasses} badge-rejected`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getRecommendationBadge = (recommendation: string) => {
    const baseClasses = "badge";
    switch (recommendation) {
      case 'accept':
        return `${baseClasses} badge-accepted`;
      case 'minor_revision':
        return `${baseClasses} badge-under-review`;
      case 'major_revision':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'reject':
        return `${baseClasses} badge-rejected`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const makeDecision = (article: ArticleForEditor) => {
    setSelectedArticle(article);
    setEditorDecision(article.reviewer_recommendation);
    setEditorComments('');
    setShowDecisionModal(true);
  };

  const submitDecision = async () => {
    if (!selectedArticle) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update article status
      const newStatus = editorDecision === 'accept' ? 'accepted' : 'rejected';
      setArticles(prev => prev.map(article => 
        article.id === selectedArticle.id 
          ? { ...article, status: newStatus as any }
          : article
      ));
      
      setShowDecisionModal(false);
      
      if (editorDecision === 'accept') {
        alert('Article accepted and forwarded to Administrator for publication!');
      } else {
        alert('Decision submitted and communicated to the author.');
      }
    } catch (error) {
      console.error('Submit decision error:', error);
      alert('Failed to submit decision. Please try again.');
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
        <h1 className="text-3xl font-bold text-academic-900 font-serif">Editor Dashboard</h1>
        <p className="text-academic-600 mt-2">
          Review articles forwarded by reviewers and make final publication decisions.
        </p>
      </div>

      {/* Real-Time Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`bg-white rounded-lg p-6 shadow-sm border border-academic-200 transition-all duration-300 hover:shadow-md ${isUpdating ? 'ring-2 ring-blue-300 shadow-lg' : ''}`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className={`text-3xl font-bold text-academic-900 transition-all duration-500 ${isUpdating ? 'scale-110' : ''}`}>
                {realTimeStats.publishedArticles}
              </p>
              <p className="text-sm font-medium text-academic-600">Published Articles</p>
            </div>
          </div>
        </div>

        <div className={`bg-white rounded-lg p-6 shadow-sm border border-academic-200 transition-all duration-300 hover:shadow-md ${isUpdating ? 'ring-2 ring-green-300 shadow-lg' : ''}`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className={`text-3xl font-bold text-academic-900 transition-all duration-500 ${isUpdating ? 'scale-110' : ''}`}>
                {realTimeStats.activeAuthors}
              </p>
              <p className="text-sm font-medium text-academic-600">Active Authors</p>
            </div>
          </div>
        </div>

        <div className={`bg-white rounded-lg p-6 shadow-sm border border-academic-200 transition-all duration-300 hover:shadow-md ${isUpdating ? 'ring-2 ring-purple-300 shadow-lg' : ''}`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className={`text-3xl font-bold text-academic-900 transition-all duration-500 ${isUpdating ? 'scale-110' : ''}`}>
                {realTimeStats.issuesPublished}
              </p>
              <p className="text-sm font-medium text-academic-600">Issues Published</p>
            </div>
          </div>
        </div>

        <div className={`bg-white rounded-lg p-6 shadow-sm border border-academic-200 transition-all duration-300 hover:shadow-md ${isUpdating ? 'ring-2 ring-orange-300 shadow-lg' : ''}`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className={`text-3xl font-bold text-academic-900 transition-all duration-500 ${isUpdating ? 'scale-110' : ''}`}>
                {realTimeStats.monthlyReaders.toLocaleString()}
              </p>
              <p className="text-sm font-medium text-academic-600">Monthly Readers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-lg shadow-sm border border-academic-200">
        <div className="p-6 border-b border-academic-200">
          <h2 className="text-xl font-semibold text-academic-900">Articles for Editorial Decision</h2>
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
                  Reviewer Recommendation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Reviewer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-academic-200">
              {articles.map((article) => (
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
                    <span className={getRecommendationBadge(article.reviewer_recommendation)}>
                      {article.reviewer_recommendation.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-academic-900">{article.reviewer_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        View Article
                      </button>
                      <button 
                        onClick={() => {
                          alert(`Reviewer Comments:\n\n${article.reviewer_comments}`);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Review
                      </button>
                      {article.status === 'reviewed' && (
                        <button 
                          onClick={() => makeDecision(article)}
                          className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
                        >
                          <ArrowRight className="w-3 h-3 mr-1" />
                          Decide
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Modal */}
      {showDecisionModal && selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-academic-200">
              <h3 className="text-xl font-semibold text-academic-900">Editorial Decision</h3>
              <p className="text-academic-600 mt-1">{selectedArticle.title}</p>
            </div>
            
            <div className="p-6">
              {/* Article Details */}
              <div className="mb-6">
                <h4 className="font-medium text-academic-900 mb-2">Article Information</h4>
                <div className="bg-academic-50 rounded-lg p-4">
                  <p className="text-sm text-academic-700"><strong>Authors:</strong> {selectedArticle.authors}</p>
                  <p className="text-sm text-academic-700 mt-2"><strong>Reviewer:</strong> {selectedArticle.reviewer_name}</p>
                  <p className="text-sm text-academic-700 mt-2">
                    <strong>Reviewer Recommendation:</strong> 
                    <span className={`ml-2 ${getRecommendationBadge(selectedArticle.reviewer_recommendation)}`}>
                      {selectedArticle.reviewer_recommendation.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </p>
                </div>
              </div>

              {/* Reviewer Comments */}
              <div className="mb-6">
                <h4 className="font-medium text-academic-900 mb-2">Reviewer Comments</h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-academic-700">{selectedArticle.reviewer_comments}</p>
                </div>
              </div>

              {/* Editor Decision Form */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-academic-700 mb-2">
                  Editorial Decision
                </label>
                <select
                  value={editorDecision}
                  onChange={(e) => setEditorDecision(e.target.value as any)}
                  className="form-input"
                >
                  <option value="accept">Accept for Publication</option>
                  <option value="minor_revision">Request Minor Revision</option>
                  <option value="major_revision">Request Major Revision</option>
                  <option value="reject">Reject</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-academic-700 mb-2">
                  Editorial Comments
                </label>
                <textarea
                  rows={6}
                  value={editorComments}
                  onChange={(e) => setEditorComments(sanitizeMultilineText(e.target.value))}
                  className="form-textarea"
                  placeholder="Provide additional comments for the author and/or administrator..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-academic-200 flex justify-end space-x-4">
              <button
                onClick={() => setShowDecisionModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={submitDecision}
                className="btn-primary flex items-center"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default EditorDashboard;
