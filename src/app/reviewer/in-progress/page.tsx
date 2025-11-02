'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Clock } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  content: string;
  status: string;
  author_name: string;
  created_at: string;
  submitted_at: string;
}

export default function InProgressReviews() {
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
    fetchInProgressArticles(parsedUser.id);
  }, [router]);

  const fetchInProgressArticles = async (userId: number) => {
    try {
      const response = await fetch('/api/articles', {
        headers: {
          'x-user-id': userId.toString(),
          'x-user-role': 'reviewer'
        }
      });
      if (response.ok) {
        const data = await response.json();
        const inProgressArticles = data.articles?.filter((article: Article) => 
          article.status === 'under_review'
        ) || [];
        setArticles(inProgressArticles);
      }
    } catch (error) {
      console.error('Error fetching in-progress articles:', error);
    } finally {
      setLoading(false);
    }
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
          <FileText className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">In Progress Reviews</h1>
            <p className="text-gray-600 mt-1">Articles currently under review</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Currently Reviewing</p>
            <p className="text-3xl font-bold text-blue-600">{articles.length}</p>
          </div>
          <div className="bg-blue-100 rounded-lg p-3">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Articles Under Review</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {articles.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No articles in progress</h3>
              <p className="mt-1 text-sm text-gray-500">Start reviewing pending articles to see them here.</p>
            </div>
          ) : (
            articles.map((article) => (
              <div key={article.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Link href={`/reviewer/articles/${article.id}`} className="block">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900 hover:text-[forestgreen]">
                          {article.title}
                        </h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          IN PROGRESS
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {article.content.substring(0, 150)}...
                      </p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>Author: {article.author_name}</span>
                        <span>Submitted: {new Date(article.submitted_at).toLocaleDateString()}</span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          In review
                        </span>
                      </div>
                    </Link>
                  </div>
                  <div className="ml-4">
                    <Link
                      href={`/reviewer/articles/${article.id}`}
                      className="px-4 py-2 bg-[forestgreen] text-white rounded-lg hover:bg-[#1d7a1d] transition-colors text-sm"
                    >
                      Continue Review
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
