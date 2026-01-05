'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { getAuthToken, isAuthenticated, redirectToLogin } from '@/lib/client-auth';
import { 
  Search, 
  Filter,
  Users,
  BookOpen,
  Award,
  Building,
  Mail,
  Phone,
  Globe,
  Star,
  Calendar,
  FileText,
  Eye
} from 'lucide-react';

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
}

interface Review {
  id: number;
  title: string;
  author: string;
  journal: string;
  status: 'pending' | 'in_progress' | 'completed';
  deadline: string;
  submitted_date: string;
  specialty: string[];
  priority: 'high' | 'medium' | 'low';
}

const ReviewerPage = () => {
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
          if (userData.user.role !== 'reviewer') {
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

  // Mock review data - in production this would come from the database
  const reviews: Review[] = [
    {
      id: 1,
      title: "Advanced Military Communication Systems in Modern Warfare",
      author: "Dr. Sarah Johnson",
      journal: "Army Journal of Technology",
      status: "pending",
      deadline: "2024-02-15",
      submitted_date: "2024-01-10",
      specialty: ["Military Technology", "Communications"],
      priority: "high"
    },
    {
      id: 2,
      title: "Leadership Strategies in Combat Operations",
      author: "Col. Michael Chen",
      journal: "Military Leadership Review",
      status: "in_progress",
      deadline: "2024-02-20",
      submitted_date: "2024-01-05",
      specialty: ["Leadership", "Strategy"],
      priority: "medium"
    },
    {
      id: 3,
      title: "Psychological Resilience Training for Military Personnel",
      author: "Dr. Emily Rodriguez",
      journal: "Army Psychology Quarterly",
      status: "completed",
      deadline: "2024-01-30",
      submitted_date: "2023-12-15",
      specialty: ["Psychology", "Training"],
      priority: "medium"
    },
    {
      id: 4,
      title: "Cybersecurity Protocols in Military Networks",
      author: "Lt. Col. David Kim",
      journal: "Defense Cybersecurity Journal",
      status: "pending",
      deadline: "2024-03-01",
      submitted_date: "2024-01-20",
      specialty: ["Cybersecurity", "Technology"],
      priority: "high"
    }
  ];

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.specialty.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || review.status === selectedStatus;
    const matchesSpecialty = selectedSpecialty === 'all' || 
                            review.specialty.includes(selectedSpecialty);
    
    return matchesSearch && matchesStatus && matchesSpecialty;
  });

  const allSpecialties = Array.from(new Set(reviews.flatMap(review => review.specialty))).sort();

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
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
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
                Peer Review Dashboard
              </h1>
              <p className="text-xl text-academic-600 max-w-3xl mx-auto">
                Manage your assigned manuscript reviews and contribute to academic excellence
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
                  placeholder="Search reviews..."
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
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
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
                  <p className="text-sm font-medium text-academic-600">Total Reviews</p>
                  <p className="text-2xl font-bold text-academic-900">{reviews.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-academic-600">Pending</p>
                  <p className="text-2xl font-bold text-academic-900">
                    {reviews.filter(r => r.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Eye className="w-8 h-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-academic-600">In Progress</p>
                  <p className="text-2xl font-bold text-academic-900">
                    {reviews.filter(r => r.status === 'in_progress').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Award className="w-8 h-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-academic-600">Completed</p>
                  <p className="text-2xl font-bold text-academic-900">
                    {reviews.filter(r => r.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-sm border border-academic-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-academic-900 mb-2 line-clamp-2">
                      {review.title}
                    </h3>
                    <p className="text-academic-600 mb-2">by {review.author}</p>
                    <p className="text-sm text-academic-500">{review.journal}</p>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(review.status)}`}>
                      {review.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(review.priority)}`}>
                      {review.priority}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {review.specialty.map((spec, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-academic-100 text-academic-700 rounded-full">
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center text-sm text-academic-600 mb-4">
                  <span>Submitted: {new Date(review.submitted_date).toLocaleDateString()}</span>
                  <span>Deadline: {new Date(review.deadline).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                    {review.status === 'pending' ? 'Start Review' : review.status === 'in_progress' ? 'Continue Review' : 'View Review'}
                  </button>
                  <button className="px-4 py-2 border border-academic-300 text-academic-700 rounded-lg hover:bg-academic-50 transition-colors text-sm font-medium">
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredReviews.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-academic-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-academic-900 mb-2">No reviews found</h3>
              <p className="text-academic-600">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ReviewerPage;
