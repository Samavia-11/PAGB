'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Archive, FileText, Search, Filter } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  content: string;
  status: string;
  author_name: string;
  created_at: string;
  submitted_at: string;
}

export default function ReviewerArchive() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
    fetchAllArticles(parsedUser.id);
  }, [router]);

  useEffect(() => {
    let filtered = articles;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(article => article.status === statusFilter);
    }

    setFilteredArticles(filtered);
  }, [articles, searchTerm, statusFilter]);

  const fetchAllArticles = async (userId: number) => {
    try {
      const response = await fetch('/api/articles', {
        headers: {
          'x-user-id': userId.toString(),
          'x-user-role': 'reviewer'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'with_editor':
        return 'bg-green-100 text-green-800';
      case 'published':
        return 'bg-emerald-100 text-emerald-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUniqueStatuses = () => {
    const statuses = [...new Set(articles.map(article => article.status))];
    return statuses;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[forestgreen] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3">
          <Archive className="w-6 h-6 text-gray-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Archive</h1>
            <p className="text-gray-600 mt-1">All articles you have reviewed</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search articles, authors, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[forestgreen] focus:border-transparent"
              />
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[forestgreen] focus:border-transparent"
            >
              <option value="all">All Status</option>
              {getUniqueStatuses().map(status => (
                <option key={status} value={status}>
                  {status.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-600">Total Articles</p>
          <p className="text-2xl font-bold text-gray-900">{articles.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-600">Published</p>
          <p className="text-2xl font-bold text-emerald-600">
            {articles.filter(a => a.status === 'published').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-600">With Editor</p>
          <p className="text-2xl font-bold text-green-600">
            {articles.filter(a => a.status === 'with_editor').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-600">Filtered Results</p>
          <p className="text-2xl font-bold text-[forestgreen]">{filteredArticles.length}</p>
        </div>
      </div>

      {/* Articles List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Articles Archive ({filteredArticles.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredArticles.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Archive className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm || statusFilter !== 'all' ? 'No articles match your filters' : 'No articles in archive'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Articles you review will appear here.'}
              </p>
            </div>
          ) : (
            filteredArticles.map((article) => (
              <div key={article.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Link href={`/reviewer/articles/${article.id}`} className="block">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900 hover:text-[forestgreen]">
                          {article.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(article.status)}`}>
                          {article.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {article.content.substring(0, 150)}...
                      </p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>Author: {article.author_name}</span>
                        <span>Submitted: {new Date(article.submitted_at).toLocaleDateString()}</span>
                        <span>Created: {new Date(article.created_at).toLocaleDateString()}</span>
                      </div>
                    </Link>
                  </div>
                  <div className="ml-4">
                    <Link
                      href={`/reviewer/articles/${article.id}`}
                      className="px-4 py-2 bg-[forestgreen] text-white rounded-lg hover:bg-[#1d7a1d] transition-colors text-sm"
                    >
                      View
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
