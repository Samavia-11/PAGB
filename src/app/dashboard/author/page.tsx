'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { getAuthToken, redirectToLogin } from '@/lib/client-auth';
import { 
  PlusCircle, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Edit,
} from 'lucide-react';

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
}

interface Article {
  id: number;
  title: string;
  abstract: string;
  status: 'submitted' | 'under_review' | 'reviewed' | 'editor_review' | 'accepted' | 'published' | 'rejected' | 'draft';
  submission_date: string;
  last_updated: string;
  // Store additional form data for editing
  keywords?: string;
  content?: string;
  authors?: any[];
  affiliation?: string;
  articleType?: string;
}

const storageKeyForUser = (userId: number) => `articles:${userId}`;

const readArticlesFromStorage = (userId: number): Article[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKeyForUser(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Article[];
    // Filter out drafts - they should only appear in the drafts page
    return Array.isArray(parsed) ? parsed.filter(article => article.status !== 'draft') : [];
  } catch {
    return [];
  }
};

const AuthorDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [publishedCount, setPublishedCount] = useState(0);
  const [publishedLoading, setPublishedLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const router = useRouter();

  // Check if article can be edited (within 2-3 hours of submission or if it's a draft)
  const canEditArticle = (article: Article): boolean => {
    if (article.status === 'draft') return true;
    const submissionTime = new Date(article.submission_date);
    const now = new Date();
    const hoursDiff = (now.getTime() - submissionTime.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 3 && ['submitted', 'under_review'].includes(article.status);
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Check if we have a token in localStorage
        const token = getAuthToken();
        if (!token) {
          redirectToLogin();
          return;
        }

        // Try to fetch user data
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log('Author dashboard - User data:', userData); // Debug log
          if (userData.user.role !== 'author') {
            console.log('User is not an author, redirecting...'); // Debug log
            router.push('/');
            return;
          }
          setUser(userData.user);
          // Load persisted articles for this author
          const initial = readArticlesFromStorage(userData.user.id);
          setArticles(initial);
        } else {
          redirectToLogin();
          return;
        }
      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        redirectToLogin();
        return;
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [router]);

  const loadPublishedCount = async (authorId: number) => {
    setPublishedLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/articles?authorId=${encodeURIComponent(String(authorId))}&status=published`, {
        headers: {
          'x-user-id': String(authorId),
          'x-user-role': 'author',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        setPublishedCount(0);
        return;
      }

      const data = await response.json();
      const list = Array.isArray(data.articles) ? data.articles : [];
      setPublishedCount(list.length);
    } catch (error) {
      console.error('Failed to load published count:', error);
      setPublishedCount(0);
    } finally {
      setPublishedLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    loadPublishedCount(user.id);

    const onFocus = () => loadPublishedCount(user.id);
    window.addEventListener('focus', onFocus);
    const intervalId = window.setInterval(() => loadPublishedCount(user.id), 15000);

    return () => {
      window.removeEventListener('focus', onFocus);
      window.clearInterval(intervalId);
    };
  }, [user?.id]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.user.role !== 'author') {
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

  // Subscribe to real-time updates via BroadcastChannel and storage events
  useEffect(() => {
    if (!user) return;
    const userId = user.id;

    // Initial refresh in case of direct navigation
    setArticles(readArticlesFromStorage(userId));

    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('articles');
      channel.onmessage = (ev: MessageEvent) => {
        const msg = ev.data as { type?: string; userId?: number };
        if (msg && msg.userId === userId) {
          setArticles(readArticlesFromStorage(userId));
        }
      };
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKeyForUser(userId)) {
        setArticles(readArticlesFromStorage(userId));
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
      if (channel) channel.close();
    };
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'under_review':
        return <Eye className="w-4 h-4 text-yellow-500" />;
      case 'reviewed':
        return <Edit className="w-4 h-4 text-purple-500" />;
      case 'editor_review':
        return <FileText className="w-4 h-4 text-orange-500" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'published':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'draft':
        return <FileText className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "badge";
    switch (status) {
      case 'submitted':
        return `${baseClasses} badge-submitted`;
      case 'under_review':
        return `${baseClasses} badge-under-review`;
      case 'reviewed':
        return `${baseClasses} badge-reviewed`;
      case 'editor_review':
        return `${baseClasses} badge-under-review`;
      case 'accepted':
        return `${baseClasses} badge-accepted`;
      case 'published':
        return `${baseClasses} badge-published`;
      case 'rejected':
        return `${baseClasses} badge-rejected`;
      case 'draft':
        return `${baseClasses} bg-gray-100 text-gray-600`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'under_review':
        return 'Under Review';
      case 'reviewed':
        return 'Reviewed';
      case 'editor_review':
        return 'Editor Review';
      case 'accepted':
        return 'Accepted';
      case 'published':
        return 'Published';
      case 'rejected':
        return 'Rejected';
      case 'draft':
        return 'Draft';
      default:
        return 'Unknown';
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
        <h1 className="text-3xl font-bold text-academic-900 font-serif">Author Dashboard</h1>
        <p className="text-academic-600 mt-2">
          Welcome back, {user?.full_name || user?.username}. Manage your manuscripts and track their progress.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-academic-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-academic-900">{articles.length}</p>
              <p className="text-academic-600">Total Articles</p>
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
                {publishedLoading ? '...' : publishedCount}
              </p>
              <p className="text-academic-600">Published</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-academic-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => router.push('/submit-article')}
            className="btn-primary flex items-center"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Submit New Article
          </button>
          <button 
            onClick={() => router.push('/submit-article')}
            className="btn-secondary flex items-center"
          >
            <FileText className="w-4 h-4 mr-2" />
            View Submission Guidelines
          </button>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-lg shadow-sm border border-academic-200">
        <div className="p-6 border-b border-academic-200">
          <h2 className="text-xl font-semibold text-academic-900">My Articles</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-academic-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Last Updated
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
                      <div className="text-sm text-academic-500 mt-1 line-clamp-2">
                        {article.abstract}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {getStatusIcon(article.status)}
                      <span className={`ml-2 ${getStatusBadge(article.status)}`}>
                        {getStatusText(article.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-academic-500">
                    {new Date(article.submission_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-academic-500">
                    {new Date(article.last_updated).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setSelectedArticle(article)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {articles.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-academic-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-academic-900 mb-2">No articles yet</h3>
            <p className="text-academic-500 mb-6">
              Get started by submitting your first article to the journal.
            </p>
            <button
              onClick={() => router.push('/submit-article')}
              className="btn-primary"
            >
              Submit Your First Article
            </button>
          </div>
        )}
      </div>

      {/* Article View Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-academic-900">Article Details</h3>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-academic-900 mb-2">Title</h4>
                <p className="text-academic-700">{selectedArticle.title}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-academic-900 mb-2">Abstract</h4>
                <p className="text-academic-700">{selectedArticle.abstract}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-academic-900 mb-2">Status</h4>
                  <div className="flex items-center">
                    {getStatusIcon(selectedArticle.status)}
                    <span className={`ml-2 ${getStatusBadge(selectedArticle.status)}`}>
                      {getStatusText(selectedArticle.status)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-academic-900 mb-2">Article ID</h4>
                  <p className="text-academic-700">#{selectedArticle.id}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-academic-900 mb-2">Submitted</h4>
                  <p className="text-academic-700">{new Date(selectedArticle.submission_date).toLocaleDateString()}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-academic-900 mb-2">Last Updated</h4>
                  <p className="text-academic-700">{new Date(selectedArticle.last_updated).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedArticle(null)}
                className="btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
};

export default AuthorDashboard;
