'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { 
  FileText, 
  CheckCircle, 
  Eye,
  Send,
  Users,
  BarChart3,
  Calendar,
  Globe,
  Settings,
  BookOpen,
  PieChart as PieChartIcon,
  TrendingUp
} from 'lucide-react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
}

interface ArticleForPublication {
  id: number;
  title: string;
  abstract: string;
  authors: string;
  submission_date: string;
  acceptance_date: string;
  status: 'accepted' | 'published';
  editor_comments: string;
  volume?: number;
  issue?: number;
  pages?: string;
  doi?: string;
}

interface AdminStats {
  readyToPublish: number;
  published: number;
  currentVolume: number;
  totalUsers: number;
}

interface AnalyticsData {
  statusDistribution: Record<string, number>;
  yearlyPublications: { year: number; count: number }[];
}

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<ArticleForPublication[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<ArticleForPublication | null>(null);
  const [publicationDetails, setPublicationDetails] = useState({
    volume: '',
    issue: '',
    pages: '',
    doi: ''
  });
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    readyToPublish: 0,
    published: 0,
    currentVolume: 15,
    totalUsers: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    statusDistribution: {
      submitted: 5,
      editor_review: 3,
      under_review: 7,
      accepted: 2,
      published: 8
    },
    yearlyPublications: [
      { year: 2021, count: 12 },
      { year: 2022, count: 15 },
      { year: 2023, count: 18 },
      { year: 2024, count: 10 }
    ]
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadAcceptedArticles();
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    loadStats();

    const onFocus = () => {
      loadStats();
    };

    window.addEventListener('focus', onFocus);
    const intervalId = window.setInterval(() => {
      loadStats();
    }, 15000);

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
        if (data.user.role !== 'administrator') {
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

  const loadStats = async () => {
    if (!user?.id) return;
    setStatsLoading(true);
    try {
      const adminHeaders = {
        'x-user-id': String(user.id),
        'x-user-role': 'administrator',
      };

      // 1st card: same source as /dashboard/admin/publications
      const publicationsRes = await fetch(
        `/api/editor-admin-documents?adminId=${encodeURIComponent(String(user.id))}`,
        { headers: adminHeaders }
      );
      let readyToPublishCount = 0;
      if (publicationsRes.ok) {
        const publications = await publicationsRes.json();
        readyToPublishCount = Array.isArray(publications.items) ? publications.items.length : 0;
      }

      // 2nd card: same source as /dashboard/admin/publish
      const publishRes = await fetch('/api/books?status=published', { headers: adminHeaders });
      let publishedCount = 0;
      if (publishRes.ok) {
        const published = await publishRes.json();
        publishedCount = Array.isArray(published.books) ? published.books.length : 0;
      }

      // Fetch Total Users from user-requests
      const usersRes = await fetch('/api/users');
      let totalUsersCount = 0;
      if (usersRes.ok) {
        const users = await usersRes.json();
        // Count only authors and reviewers
        totalUsersCount = Array.isArray(users.users) 
          ? users.users.filter((user: any) => user.role === 'author' || user.role === 'reviewer').length
          : 0;
      }

      setStats({
        readyToPublish: readyToPublishCount,
        published: publishedCount,
        currentVolume: 15, // Keep current volume as static
        totalUsers: totalUsersCount
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics');
      if (response.ok) {
        const data = await response.json();
        // Check if we have any data, if not use dummy data
        const hasData = Object.values(data.statusDistribution).some((val: any) => val > 0) || 
                        data.yearlyPublications.length > 0;
        
        if (!hasData) {
          // Use dummy data for demonstration
          setAnalytics({
            statusDistribution: {
              submitted: 5,
              editor_review: 3,
              under_review: 7,
              accepted: 2,
              published: 8
            },
            yearlyPublications: [
              { year: 2021, count: 12 },
              { year: 2022, count: 15 },
              { year: 2023, count: 18 },
              { year: 2024, count: 10 }
            ]
          });
        } else {
          setAnalytics(data);
        }
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Use dummy data on error
      setAnalytics({
        statusDistribution: {
          submitted: 5,
          editor_review: 3,
          under_review: 7,
          accepted: 2,
          published: 8
        },
        yearlyPublications: [
          { year: 2021, count: 12 },
          { year: 2022, count: 15 },
          { year: 2023, count: 18 },
          { year: 2024, count: 10 }
        ]
      });
    }
  };

  const loadAcceptedArticles = async () => {
    // Mock data for articles accepted by editor
    const mockArticles: ArticleForPublication[] = [
      {
        id: 1,
        title: "Cybersecurity Frameworks for Military Networks",
        abstract: "An examination of cybersecurity frameworks tailored for military network infrastructure, focusing on threat detection and response mechanisms...",
        authors: "Dr. Michael Chen, Maj. Sarah Davis",
        submission_date: "2024-01-08",
        acceptance_date: "2024-01-20",
        status: "accepted",
        editor_comments: "Excellent paper with strong theoretical foundation and practical applications. Ready for publication."
      },
      {
        id: 2,
        title: "Logistics Optimization in Joint Operations",
        abstract: "This study presents optimization models for logistics planning in joint military operations, with emphasis on resource allocation and supply chain efficiency...",
        authors: "Lt. Col. Robert Wilson, Dr. Emily Johnson",
        submission_date: "2024-01-05",
        acceptance_date: "2024-01-18",
        status: "published",
        editor_comments: "Well-structured paper with clear methodology and significant findings.",
        volume: 15,
        issue: 1,
        pages: "45-62",
        doi: "10.1234/armyjournal.2024.15.1.003"
      },
      {
        id: 3,
        title: "Advanced Training Methodologies for Special Forces",
        abstract: "This research explores innovative training approaches for special forces units, incorporating virtual reality and simulation technologies...",
        authors: "Col. Patricia Martinez, Dr. James Thompson",
        submission_date: "2023-12-20",
        acceptance_date: "2024-01-15",
        status: "published",
        editor_comments: "Innovative approach to military training with practical implications.",
        volume: 15,
        issue: 1,
        pages: "23-44",
        doi: "10.1234/armyjournal.2024.15.1.002"
      }
    ];
    setArticles(mockArticles);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'published':
        return <Globe className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "badge";
    switch (status) {
      case 'accepted':
        return `${baseClasses} badge-accepted`;
      case 'published':
        return `${baseClasses} badge-published`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const publishArticle = (article: ArticleForPublication) => {
    setSelectedArticle(article);
    setPublicationDetails({
      volume: '15',
      issue: '2',
      pages: '',
      doi: `10.1234/armyjournal.2024.15.2.${String(articles.filter(a => a.status === 'published').length + 1).padStart(3, '0')}`
    });
    setShowPublishModal(true);
  };

  const submitPublication = async () => {
    if (!selectedArticle) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update article status
      setArticles(prev => prev.map(article => 
        article.id === selectedArticle.id 
          ? { 
              ...article, 
              status: 'published' as const,
              volume: parseInt(publicationDetails.volume),
              issue: parseInt(publicationDetails.issue),
              pages: publicationDetails.pages,
              doi: publicationDetails.doi
            }
          : article
      ));
      
      setShowPublishModal(false);
      alert('Article published successfully!');
    } catch (error) {
      console.error('Publish article error:', error);
      alert('Failed to publish article. Please try again.');
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
        <h1 className="text-3xl font-bold text-academic-900 font-serif">Administrator Dashboard</h1>
        <p className="text-academic-600 mt-2">
          Manage publications, oversee the journal operations, and maintain quality standards.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-academic-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-academic-900">
                {statsLoading ? '...' : stats.readyToPublish}
              </p>
              <p className="text-academic-600">Ready to Publish</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-academic-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-academic-900">
                {statsLoading ? '...' : stats.published}
              </p>
              <p className="text-academic-600">Published</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-academic-200">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-academic-900">{statsLoading ? '...' : stats.totalUsers}</p>
              <p className="text-academic-600">Total Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-academic-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button onClick={() => router.push('/dashboard/admin/issues/new')} className="btn-primary flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Create New Issue
          </button>
          <button onClick={() => router.push('/dashboard/admin/user-requests')} className="btn-secondary flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Manage Users
          </button>
          <button onClick={() => router.push('/dashboard/admin/settings')} className="btn-secondary flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Journal Settings
          </button>
        </div>
      </div>

      {/* Publish Modal */}
      {showPublishModal && selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-academic-200">
              <h3 className="text-xl font-semibold text-academic-900">Publish Article</h3>
              <p className="text-academic-600 mt-1">{selectedArticle.title}</p>
            </div>
            
            <div className="p-6">
              {/* Article Details */}
              <div className="mb-6">
                <h4 className="font-medium text-academic-900 mb-2">Article Information</h4>
                <div className="bg-academic-50 rounded-lg p-4">
                  <p className="text-sm text-academic-700"><strong>Authors:</strong> {selectedArticle.authors}</p>
                  <p className="text-sm text-academic-700 mt-1"><strong>Accepted:</strong> {new Date(selectedArticle.acceptance_date).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Publication Details Form */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-academic-700 mb-2">
                    Volume
                  </label>
                  <input
                    type="number"
                    value={publicationDetails.volume}
                    onChange={(e) => setPublicationDetails(prev => ({ ...prev, volume: e.target.value }))}
                    className="form-input"
                    placeholder="15"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-academic-700 mb-2">
                    Issue
                  </label>
                  <input
                    type="number"
                    value={publicationDetails.issue}
                    onChange={(e) => setPublicationDetails(prev => ({ ...prev, issue: e.target.value }))}
                    className="form-input"
                    placeholder="2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-academic-700 mb-2">
                    Pages
                  </label>
                  <input
                    type="text"
                    value={publicationDetails.pages}
                    onChange={(e) => setPublicationDetails(prev => ({ ...prev, pages: e.target.value }))}
                    className="form-input"
                    placeholder="1-20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-academic-700 mb-2">
                    DOI
                  </label>
                  <input
                    type="text"
                    value={publicationDetails.doi}
                    onChange={(e) => setPublicationDetails(prev => ({ ...prev, doi: e.target.value }))}
                    className="form-input"
                    placeholder="10.1234/armyjournal.2024.15.2.001"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-academic-200 flex justify-end space-x-4">
              <button
                onClick={() => setShowPublishModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={submitPublication}
                className="btn-primary flex items-center"
              >
                <Globe className="w-4 h-4 mr-2" />
                Publish Article
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;
