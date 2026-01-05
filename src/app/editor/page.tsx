'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { getAuthToken, isAuthenticated, redirectToLogin } from '@/lib/client-auth';
import { 
  Search, 
  Filter,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  Calendar,
  Users,
  Award,
  TrendingUp
} from 'lucide-react';

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
}

interface Editorial {
  id: number;
  title: string;
  author: string;
  reviewers: string[];
  status: 'under_review' | 'revision_required' | 'accepted' | 'rejected';
  submitted_date: string;
  reviews_completed: number;
  total_reviews: number;
  specialty: string[];
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
}

const EditorPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
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
          if (userData.user.role !== 'editor') {
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

  // Mock editorial data - in production this would come from the database
  const editorials: Editorial[] = [
    {
      id: 1,
      title: "Advanced Military Communication Systems in Modern Warfare",
      author: "Dr. Sarah Johnson",
      reviewers: ["Dr. Michael Chen", "Prof. Emily Rodriguez"],
      status: "under_review",
      submitted_date: "2024-01-10",
      reviews_completed: 1,
      total_reviews: 2,
      specialty: ["Military Technology", "Communications"],
      priority: "high",
      recommendation: "Pending"
    },
    {
      id: 2,
      title: "Leadership Strategies in Combat Operations",
      author: "Col. Michael Chen",
      reviewers: ["Dr. David Kim", "Lt. Col. Sarah Wilson"],
      status: "revision_required",
      submitted_date: "2024-01-05",
      reviews_completed: 2,
      total_reviews: 2,
      specialty: ["Leadership", "Strategy"],
      priority: "medium",
      recommendation: "Minor Revisions"
    },
    {
      id: 3,
      title: "Psychological Resilience Training for Military Personnel",
      author: "Dr. Emily Rodriguez",
      reviewers: ["Dr. James Brown", "Prof. Lisa Anderson"],
      status: "accepted",
      submitted_date: "2023-12-15",
      reviews_completed: 2,
      total_reviews: 2,
      specialty: ["Psychology", "Training"],
      priority: "medium",
      recommendation: "Accept"
    },
    {
      id: 4,
      title: "Cybersecurity Protocols in Military Networks",
      author: "Lt. Col. David Kim",
      reviewers: ["Dr. Robert Taylor", "Prof. Maria Garcia"],
      status: "rejected",
      submitted_date: "2024-01-20",
      reviews_completed: 2,
      total_reviews: 2,
      specialty: ["Cybersecurity", "Technology"],
      priority: "high",
      recommendation: "Reject"
    }
  ];

  const filteredEditorials = editorials.filter(editorial => {
    const matchesSearch = editorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         editorial.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         editorial.specialty.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || editorial.status === selectedStatus;
    const matchesSpecialty = selectedSpecialty === 'all' || 
                            editorial.specialty.includes(selectedSpecialty);
    
    return matchesSearch && matchesStatus && matchesSpecialty;
  });

  const allSpecialties = Array.from(new Set(editorials.flatMap(editorial => editorial.specialty))).sort();

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
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'revision_required':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
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
                Editorial Dashboard
              </h1>
              <p className="text-xl text-academic-600 max-w-3xl mx-auto">
                Manage manuscript reviews and make editorial decisions for publication
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-academic-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search manuscripts..."
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
                <option value="under_review">Under Review</option>
                <option value="revision_required">Revision Required</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="px-4 py-2 border border-academic-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Specialties</option>
                {allSpecialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="w-8 h-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-academic-600">Total Manuscripts</p>
                  <p className="text-2xl font-bold text-academic-900">{editorials.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-academic-600">Under Review</p>
                  <p className="text-2xl font-bold text-academic-900">
                    {editorials.filter(e => e.status === 'under_review').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-academic-600">Accepted</p>
                  <p className="text-2xl font-bold text-academic-900">
                    {editorials.filter(e => e.status === 'accepted').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-academic-600">Pending Decision</p>
                  <p className="text-2xl font-bold text-academic-900">
                    {editorials.filter(e => e.reviews_completed === e.total_reviews && e.status === 'under_review').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Manuscripts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEditorials.map((editorial) => (
              <div key={editorial.id} className="bg-white rounded-lg shadow-sm border border-academic-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-academic-900 mb-2 line-clamp-2">
                      {editorial.title}
                    </h3>
                    <p className="text-academic-600 mb-2">by {editorial.author}</p>
                    <p className="text-sm text-academic-500">
                      Reviews: {editorial.reviews_completed}/{editorial.total_reviews} completed
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(editorial.status)}`}>
                      {editorial.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(editorial.priority)}`}>
                      {editorial.priority}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {editorial.specialty.map((spec, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-academic-100 text-academic-700 rounded-full">
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="mb-4">
                  <p className="text-sm text-academic-600 mb-2">Reviewers:</p>
                  <div className="flex flex-wrap gap-1">
                    {editorial.reviewers.map((reviewer, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
                        {reviewer}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-academic-600 mb-4">
                  <span>Submitted: {new Date(editorial.submitted_date).toLocaleDateString()}</span>
                  <span>Recommendation: {editorial.recommendation}</span>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                    {editorial.reviews_completed === editorial.total_reviews ? 'Make Decision' : 'View Progress'}
                  </button>
                  <button className="px-4 py-2 border border-academic-300 text-academic-700 rounded-lg hover:bg-academic-50 transition-colors text-sm font-medium">
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredEditorials.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-academic-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-academic-900 mb-2">No manuscripts found</h3>
              <p className="text-academic-600">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EditorPage;
