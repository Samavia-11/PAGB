'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { getAuthToken, isAuthenticated, redirectToLogin } from '@/lib/client-auth';
import { 
  Search, 
  Filter,
  FileText,
  Users,
  BookOpen,
  TrendingUp,
  Settings,
  Shield,
  Database,
  Globe,
  Calendar,
  Award,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
}

interface Publication {
  id: number;
  title: string;
  author: string;
  volume: number;
  issue: number;
  pages: string;
  publication_date: string;
  doi: string;
  status: 'ready_to_publish' | 'published' | 'archived';
  category: string[];
  downloads: number;
  citations: number;
}

const AdministratorPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const router = useRouter();

  useEffect(() => {
    // Check authentication on component mount
    if (!isAuthenticated()) {
      redirectToLogin();
      return;
    }

    // Fetch user data from API
    const fetchUserData = async () => {
      const token = getAuthToken();
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          if (userData.user.role !== 'administrator') {
            router.push('/');
            return;
          }
          setUser(userData.user);
        } else {
          redirectToLogin();
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        redirectToLogin();
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // Mock publication data - in production this would come from the database
  const publications: Publication[] = [
    {
      id: 1,
      title: "Advanced Military Communication Systems in Modern Warfare",
      author: "Dr. Sarah Johnson",
      volume: 45,
      issue: 3,
      pages: "123-145",
      publication_date: "2024-03-15",
      doi: "10.1234/amj.2024.001",
      status: "ready_to_publish",
      category: ["Military Technology", "Communications"],
      downloads: 0,
      citations: 0
    },
    {
      id: 2,
      title: "Leadership Strategies in Combat Operations",
      author: "Col. Michael Chen",
      volume: 45,
      issue: 2,
      pages: "67-89",
      publication_date: "2024-02-15",
      doi: "10.1234/amj.2024.002",
      status: "published",
      category: ["Leadership", "Strategy"],
      downloads: 234,
      citations: 12
    },
    {
      id: 3,
      title: "Psychological Resilience Training for Military Personnel",
      author: "Dr. Emily Rodriguez",
      volume: 45,
      issue: 1,
      pages: "12-34",
      publication_date: "2024-01-15",
      doi: "10.1234/amj.2024.003",
      status: "published",
      category: ["Psychology", "Training"],
      downloads: 456,
      citations: 8
    },
    {
      id: 4,
      title: "Historical Analysis of Military Tactics in World War II",
      author: "Prof. Robert Taylor",
      volume: 44,
      issue: 4,
      pages: "200-225",
      publication_date: "2023-12-15",
      doi: "10.1234/amj.2023.004",
      status: "archived",
      category: ["History", "Military Tactics"],
      downloads: 789,
      citations: 25
    }
  ];

  const filteredPublications = publications.filter(publication => {
    const matchesSearch = publication.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         publication.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         publication.category.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || publication.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || 
                           publication.category.includes(selectedCategory);
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const allCategories = Array.from(new Set(publications.flatMap(publication => publication.category))).sort();

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready_to_publish':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Layout user={user}>
      <div className="min-h-screen bg-academic-50">
        {/* Header */}
        <div className="bg-white border-b border-academic-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-academic-900 mb-4">
                Administration Dashboard
              </h1>
              <p className="text-xl text-academic-600 max-w-3xl mx-auto">
                Manage publications, users, and system settings for the Army Journal Portal
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <button className="bg-primary-600 text-white p-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              New Issue
            </button>
            <button className="bg-white border border-academic-300 text-academic-700 p-4 rounded-lg hover:bg-academic-50 transition-colors flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              Manage Users
            </button>
            <button className="bg-white border border-academic-300 text-academic-700 p-4 rounded-lg hover:bg-academic-50 transition-colors flex items-center justify-center gap-2">
              <Settings className="w-5 h-5" />
              System Settings
            </button>
            <button className="bg-white border border-academic-300 text-academic-700 p-4 rounded-lg hover:bg-academic-50 transition-colors flex items-center justify-center gap-2">
              <Database className="w-5 h-5" />
              Export Data
            </button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-academic-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search publications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-academic-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-academic-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Status</option>
                <option value="ready_to_publish">Ready to Publish</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-academic-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Categories</option>
                {allCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="w-8 h-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-academic-600">Total Publications</p>
                  <p className="text-2xl font-bold text-academic-900">{publications.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-academic-600">Ready to Publish</p>
                  <p className="text-2xl font-bold text-academic-900">
                    {publications.filter(p => p.status === 'ready_to_publish').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-academic-600">Total Downloads</p>
                  <p className="text-2xl font-bold text-academic-900">
                    {publications.reduce((sum, p) => sum + p.downloads, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Award className="w-8 h-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-academic-600">Total Citations</p>
                  <p className="text-2xl font-bold text-academic-900">
                    {publications.reduce((sum, p) => sum + p.citations, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Publications Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPublications.map((publication) => (
              <div key={publication.id} className="bg-white rounded-lg shadow-sm border border-academic-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-academic-900 mb-2 line-clamp-2">
                      {publication.title}
                    </h3>
                    <p className="text-academic-600 mb-2">by {publication.author}</p>
                    <p className="text-sm text-academic-500">
                      Vol. {publication.volume}, Issue {publication.issue}, pp. {publication.pages}
                    </p>
                    <p className="text-sm text-academic-500">DOI: {publication.doi}</p>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(publication.status)}`}>
                      {publication.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {publication.category.map((cat, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-academic-100 text-academic-700 rounded-full">
                      {cat}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-academic-900">{publication.downloads}</p>
                    <p className="text-xs text-academic-600">Downloads</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-academic-900">{publication.citations}</p>
                    <p className="text-xs text-academic-600">Citations</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-academic-900">
                      {new Date(publication.publication_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-academic-600">Published</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {publication.status === 'ready_to_publish' ? (
                    <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                      Publish Now
                    </button>
                  ) : (
                    <button className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                      View Details
                    </button>
                  )}
                  <button className="px-4 py-2 border border-academic-300 text-academic-700 rounded-lg hover:bg-academic-50 transition-colors text-sm font-medium">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredPublications.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-academic-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-academic-900 mb-2">No publications found</h3>
              <p className="text-academic-600">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdministratorPage;
