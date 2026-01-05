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
    readyToPublish: 2,
    published: 8,
    currentVolume: 15,
    totalUsers: 45
  });
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
    loadStats();
    loadAnalytics();
  }, []);

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
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-academic-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-academic-900">
                {stats.readyToPublish}
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
                {stats.published}
              </p>
              <p className="text-academic-600">Published</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-academic-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-academic-900">{stats.currentVolume}</p>
              <p className="text-academic-600">Current Volume</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-academic-200">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-academic-900">{stats.totalUsers}</p>
              <p className="text-academic-600">Total Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-3 mb-8">
        <h2 className="text-xs font-semibold text-academic-900 mb-2">Analytics Overview</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Status Distribution Pie Chart */}
          <div>
            <div className="flex items-center mb-1">
              <PieChartIcon className="w-3 h-3 text-primary-600 mr-1" />
              <h3 className="text-xs font-medium text-academic-900">Status Distribution</h3>
            </div>
            <div className="h-36 flex items-center justify-center">
              <div className="w-full" style={{ maxWidth: '200px' }}>
                <Pie
                  data={{
                    labels: [
                      'Submissions',
                      'Editor',
                      'Reviewer',
                      'Publication'
                    ],
                    datasets: [
                      {
                        label: 'Articles',
                        data: [
                          analytics.statusDistribution['submitted'] || 0,
                          analytics.statusDistribution['editor_review'] || 0,
                          analytics.statusDistribution['under_review'] || 0,
                          (analytics.statusDistribution['accepted'] || 0) + (analytics.statusDistribution['published'] || 0)
                        ],
                        backgroundColor: [
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(139, 92, 246, 0.8)',
                          'rgba(251, 191, 36, 0.8)',
                          'rgba(34, 197, 94, 0.8)'
                        ],
                        borderColor: [
                          'rgba(59, 130, 246, 1)',
                          'rgba(139, 92, 246, 1)',
                          'rgba(251, 191, 36, 1)',
                          'rgba(34, 197, 94, 1)'
                        ],
                        borderWidth: 2
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    layout: {
                      padding: {
                        bottom: 5,
                        top: 0
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'bottom',
                        align: 'center',
                        fullSize: true,
                        labels: {
                          padding: 5,
                          font: {
                            size: 8
                          },
                          boxWidth: 10,
                          boxHeight: 10,
                          usePointStyle: false
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                            return `${label}: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Yearly Publications Bar Chart */}
          <div>
            <div className="flex items-center mb-1">
              <TrendingUp className="w-3 h-3 text-primary-600 mr-1" />
              <h3 className="text-xs font-medium text-academic-900">Yearly Publications</h3>
            </div>
            <div className="h-36">
              <Bar
                data={{
                  labels: analytics.yearlyPublications.map(item => item.year.toString()),
                  datasets: [
                    {
                      label: 'Published Articles',
                      data: analytics.yearlyPublications.map(item => item.count),
                      backgroundColor: 'rgba(59, 130, 246, 0.7)',
                      borderColor: 'rgba(59, 130, 246, 1)',
                      borderWidth: 1,
                      borderRadius: 3,
                      barThickness: 30,
                      maxBarThickness: 35
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 6,
                      titleFont: {
                        size: 9
                      },
                      bodyFont: {
                        size: 9
                      },
                      callbacks: {
                        label: function(context) {
                          return `Articles: ${context.parsed.y}`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.08)'
                      },
                      ticks: {
                        stepSize: 5,
                        font: {
                          size: 9
                        },
                        color: '#6B7280',
                        padding: 5
                      },
                      border: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.2)',
                        width: 1
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      },
                      ticks: {
                        font: {
                          size: 9,
                          weight: 500
                        },
                        color: '#374151',
                        padding: 5
                      },
                      border: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.2)',
                        width: 1
                      }
                    }
                  }
                }}
              />
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

      {/* Articles Table */}
      <div className="bg-white rounded-lg shadow-sm border border-academic-200">
        <div className="p-6 border-b border-academic-200">
          <h2 className="text-xl font-semibold text-academic-900">Articles for Publication</h2>
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
                  Acceptance Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Publication Details
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
                        {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-academic-500">
                    {new Date(article.acceptance_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {article.status === 'published' ? (
                      <div className="text-sm">
                        <div className="text-academic-900">Vol. {article.volume}, Issue {article.issue}</div>
                        <div className="text-academic-500">Pages: {article.pages}</div>
                        <div className="text-academic-500">DOI: {article.doi}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-academic-500">Pending publication</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        View
                      </button>
                      {article.status === 'accepted' && (
                        <button 
                          onClick={() => publishArticle(article)}
                          className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
                        >
                          <Globe className="w-3 h-3 mr-1" />
                          Publish
                        </button>
                      )}
                      {article.status === 'published' && (
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Edit Details
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
