'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Clock, FileText } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  content: string;
  status: string;
  author_name: string;
  created_at: string;
  submitted_at: string;
}

export default function PendingReviews() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

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
    fetchPendingArticles(parsedUser.id);
  }, [router]);

  const fetchPendingArticles = async (userId: number) => {
    try {
      const response = await fetch('/api/articles', {
        headers: {
          'x-user-id': userId.toString(),
          'x-user-role': 'reviewer'
        }
      });
      if (response.ok) {
        const data = await response.json();
        const pendingArticles = data.articles?.filter((article: Article) => 
          article.status === 'submitted'
        ) || [];
        setArticles(pendingArticles);
      }
    } catch (error) {
      console.error('Error fetching pending articles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
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
          <Clock className="w-6 h-6 text-yellow-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pending Reviews</h1>
            <p className="text-gray-600 mt-1">Articles waiting for your review</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{articles.length}</p>
          </div>
          <div className="bg-yellow-100 rounded-lg p-3">
            <FileText className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Pending Articles</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {articles.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pending reviews</h3>
              <p className="mt-1 text-sm text-gray-500">All caught up! New submissions will appear here.</p>
            </div>
          ) : (
            articles.map((article) => (
              <div key={article.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Link href={`/reviewer/articles/${article.id}`} className="block">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900 hover:text-purple-600">
                          {article.title}
                        </h3>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                          PENDING
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {article.content.substring(0, 150)}...
                      </p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>Author: {article.author_name}</span>
                        <span>Submitted: {new Date(article.submitted_at).toLocaleDateString()}</span>
                        <span>Days waiting: {Math.floor((Date.now() - new Date(article.submitted_at).getTime()) / (1000 * 60 * 60 * 24))}</span>
                      </div>
                    </Link>
                  </div>
                  <div className="ml-4">
                    <Link
                      href={`/reviewer/articles/${article.id}`}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      Start Review
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
