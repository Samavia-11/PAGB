'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { FileText, Globe, Eye, Calendar, User, Download } from 'lucide-react';

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
}

type PublishedArticle = {
  id: number;
  title: string;
  abstract: string;
  authors: string;
  author_name: string;
  author_email?: string;
  author_phone?: string;
  submission_date: string;
  acceptance_date: string;
  status: 'accepted' | 'published';
  editor_comments?: string;
  volume?: number;
  issue?: number;
  pages?: string;
  doi?: string;
};

export default function AdminPublicationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<PublishedArticle[]>([]);
  const [selected, setSelected] = useState<PublishedArticle | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (data.user?.role !== 'administrator') {
          router.push('/');
          return;
        }
        setUser(data.user);
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  useEffect(() => {
    const loadPublished = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch('/api/articles?status=published');
        if (!res.ok) {
          setArticles([]);
          return;
        }
        const data = await res.json();
        const list = (data.articles || []) as PublishedArticle[];
        setArticles(list);
      } catch (e) {
        console.error('Failed to load published articles:', e);
        setArticles([]);
      }
    };

    loadPublished();
  }, [user?.id]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Publications</h1>
          <p className="text-gray-600 mt-1">All published articles visible to the public.</p>
        </div>

        {articles.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-gray-600">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">No published articles</h2>
            <p>Once you publish articles from the admin dashboard, they will appear here.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publication</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{article.title}</div>
                          <div className="text-sm text-gray-600 mt-1 line-clamp-2">{article.abstract}</div>
                          <div className="text-xs text-gray-500 mt-1">By {article.author_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div>{article.author_name}</div>
                        {article.author_email && (
                          <div className="text-xs text-gray-500">{article.author_email}</div>
                        )}
                        {article.author_phone && (
                          <div className="text-xs text-gray-500">{article.author_phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>{new Date(article.submission_date).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500 mt-1">Accepted: {new Date(article.acceptance_date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(article.status)}`}>
                            {article.status}
                          </span>
                        </div>
                        {article.volume && (
                          <div className="text-xs text-gray-500">Vol. {article.volume}</div>
                        )}
                        {article.issue && (
                          <div className="text-xs text-gray-500">Issue {article.issue}</div>
                        )}
                        {article.pages && (
                          <div className="text-xs text-gray-500">pp. {article.pages}</div>
                        )}
                        {article.doi && (
                          <div className="text-xs text-gray-500 truncate" title={article.doi}>DOI: {article.doi}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                            onClick={() => setSelected(article)}
                          >
                            <Eye className="w-4 h-4 mr-1" /> View
                          </button>
                          <a
                            href={`/api/articles/${article.id}/download`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
                          >
                            <Download className="w-4 h-4 mr-1" /> Download
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selected.title}</h2>
                  <div className="text-sm text-gray-600 mt-1">By {selected.author_name}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Article Information</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div><strong>Author:</strong> {selected.author_name}</div>
                    {selected.author_email && <div><strong>Email:</strong> {selected.author_email}</div>}
                    {selected.author_phone && <div><strong>Phone:</strong> {selected.author_phone}</div>}
                    <div><strong>Submitted:</strong> {new Date(selected.submission_date).toLocaleDateString()}</div>
                    <div><strong>Accepted:</strong> {new Date(selected.acceptance_date).toLocaleDateString()}</div>
                    <div><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selected.status)}`}>{selected.status}</span></div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Abstract</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.abstract}</p>
                </div>

                {selected.editor_comments && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Editor Comments</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.editor_comments}</p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Publication Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Volume</label>
                      <div className="px-3 py-2 bg-white border border-gray-300 rounded-md">{selected.volume || '—'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Issue</label>
                      <div className="px-3 py-2 bg-white border border-gray-300 rounded-md">{selected.issue || '—'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pages</label>
                      <div className="px-3 py-2 bg-white border border-gray-300 rounded-md">{selected.pages || '—'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">DOI</label>
                      <div className="px-3 py-2 bg-white border border-gray-300 rounded-md">{selected.doi || '—'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
