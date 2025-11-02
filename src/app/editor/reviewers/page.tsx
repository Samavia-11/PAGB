'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, MessageSquare, Search, User } from 'lucide-react';

interface Reviewer {
  id: number;
  full_name: string;
  username: string;
  email: string;
  role: string;
}

export default function ReviewersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [filteredReviewers, setFilteredReviewers] = useState<Reviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
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
    fetchReviewers();
  }, [router]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = reviewers.filter(reviewer =>
        reviewer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reviewer.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reviewer.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredReviewers(filtered);
    } else {
      setFilteredReviewers(reviewers);
    }
  }, [searchTerm, reviewers]);

  const fetchReviewers = async () => {
    try {
      const response = await fetch('/api/users?role=reviewer');
      if (response.ok) {
        const data = await response.json();
        setReviewers(data.users || []);
        setFilteredReviewers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching reviewers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
            <Users className="w-6 h-6 text-orange-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reviewers</h1>
              <p className="text-gray-600 mt-1">Browse and chat with active reviewers</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Total Reviewers</div>
            <div className="text-3xl font-bold text-orange-600">{reviewers.length}</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search reviewers by name, username, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Reviewers List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Active Reviewers ({filteredReviewers.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredReviewers.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'No reviewers found' : 'No reviewers available'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? 'Try adjusting your search criteria.' 
                  : 'Reviewers will appear here once they are added to the system.'}
              </p>
            </div>
          ) : (
            filteredReviewers.map((reviewer) => (
              <div key={reviewer.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold text-lg">
                      {(reviewer.full_name || reviewer.username || 'R').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {reviewer.full_name || reviewer.username}
                      </h3>
                      <p className="text-sm text-gray-600">
                        @{reviewer.username}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {reviewer.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/editor/reviewers/${reviewer.id}/chat`}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

