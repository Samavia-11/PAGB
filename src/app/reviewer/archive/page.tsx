'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Archive, FileText, Search, Clock, CheckCircle, Send, RefreshCw } from 'lucide-react';

interface ForwardedRecord {
  id: number;
  title: string;
  message: string;
  article_id: number;
  created_at: string;
}

export default function ReviewerArchive() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [forwardedRecords, setForwardedRecords] = useState<ForwardedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'reviewer') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
    fetchForwardedRecords();

    // Set up real-time polling for new forwarded records
    const interval = setInterval(fetchForwardedRecords, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [router]);

  const fetchForwardedRecords = async () => {
    try {
      const response = await fetch('/api/notifications?type=forwarded&user_role=reviewer');
      if (response.ok) {
        const data = await response.json();
        // Filter for forwarded article notifications
        const archiveRecords = (data.notifications || []).filter((n: any) => 
          n.title.includes('Article Forwarded') && n.type === 'review_submitted'
        );
        setForwardedRecords(archiveRecords);
      }
    } catch (error) {
      console.error('Error fetching forwarded records:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseArchiveMessage = (message: string) => {
    try {
      // Parse the notification message to extract details
      // Format: Article "title" has been reviewed and forwarded with recommendation: RECOMMENDATION. Reviewer comments: comments
      const articleMatch = message.match(/Article "([^"]+)"/);
      const recommendationMatch = message.match(/recommendation: ([^.]+)\./);
      const commentsMatch = message.match(/Reviewer comments: (.+)/);
      
      return {
        Article: articleMatch ? articleMatch[1] : 'Unknown',
        Recommendation: recommendationMatch ? recommendationMatch[1] : 'Unknown',
        Comments: commentsMatch ? commentsMatch[1] : 'No comments',
        Author: 'Unknown', // We'll need to get this from the article data
        Reviewer: 'You'
      };
    } catch {
      return { Article: 'Unknown', Author: 'Unknown', Recommendation: 'Unknown', Comments: 'No comments', Reviewer: 'You' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation?.toLowerCase()) {
      case 'accept': return 'bg-green-100 text-green-800';
      case 'minor revision': return 'bg-blue-100 text-blue-800';
      case 'major revision': return 'bg-yellow-100 text-yellow-800';
      case 'reject': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRecords = forwardedRecords.filter(record => {
    const details = parseArchiveMessage(record.message);
    const searchLower = searchTerm.toLowerCase();
    return (
      details.Article?.toLowerCase().includes(searchLower) ||
      details.Author?.toLowerCase().includes(searchLower) ||
      details.Recommendation?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading forwarded articles archive...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Archive className="w-8 h-8 mr-3 text-green-600" />
                Forwarded Articles Archive
              </h1>
              <p className="text-gray-600 mt-1">
                Real-time archive of all articles you've forwarded to editor ({forwardedRecords.length} total)
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchForwardedRecords}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <Link
                href="/reviewer/dashboard"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by article title, author, or recommendation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <Send className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Forwarded</p>
                <p className="text-2xl font-bold text-gray-900">{forwardedRecords.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {forwardedRecords.filter(r => parseArchiveMessage(r.message).Recommendation?.toLowerCase().includes('accept')).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revisions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {forwardedRecords.filter(r => parseArchiveMessage(r.message).Recommendation?.toLowerCase().includes('revision')).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gray-100 rounded-lg p-3">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {forwardedRecords.filter(r => {
                    const recordDate = new Date(r.created_at);
                    const now = new Date();
                    return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Forwarded Records List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Forwarded Articles ({filteredRecords.length})
            </h2>
          </div>
          
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {forwardedRecords.length === 0 ? 'No Forwarded Articles' : 'No Matching Records'}
              </h3>
              <p className="text-gray-600">
                {forwardedRecords.length === 0 
                  ? 'You haven&#39;t forwarded any articles to the editor yet.' 
                  : 'No records match your search criteria.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRecords.map((record) => {
                const details = parseArchiveMessage(record.message);
                return (
                  <div key={record.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {details.Article?.replace(/"/g, '') || 'Unknown Article'}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRecommendationColor(details.Recommendation)}`}>
                            <Send className="w-3 h-3 mr-1" />
                            {details.Recommendation || 'Unknown'}
                          </span>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Author:</span> {details.Author || 'Unknown'}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Reviewer:</span> {details.Reviewer || 'You'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Forwarded:</span> {formatDate(record.created_at)}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">Comments:</p>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            {details.Comments || 'No comments provided'}
                          </p>
                        </div>

                        {details['Editor Comments'] && details['Editor Comments'] !== 'None' && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-1">Editor Comments:</p>
                            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                              {details['Editor Comments']}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="ml-6 flex flex-col space-y-2">
                        <Link
                          href={`/reviewer/articles/${record.article_id}`}
                          className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Article
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
