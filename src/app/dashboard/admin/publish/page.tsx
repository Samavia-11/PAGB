'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { FileText, Globe, Eye, Download } from 'lucide-react';

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
}

type BookStatus = 'submitted' | 'published' | 'archived';

interface BookListItem {
  id: number;
  editor_id: number | null;
  title: string;
  edition_year: number;
  cover_image_name: string | null;
  cover_image_path: string | null;
  author_list: string | null;
  status: BookStatus;
  featured_rank: number;
  is_current: number;
  created_at: string;
  published_at: string | null;
  article_count: number;
}

export default function AdminPublishPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<BookListItem[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [selected, setSelected] = useState<BookListItem | null>(null);

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
    const loadBooks = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch('/api/books', {
          headers: {
            'x-user-id': String(user.id),
            'x-user-role': 'administrator',
          },
        });
        if (!res.ok) {
          setBooks([]);
          return;
        }
        const data = await res.json();
        const list = (data.books || []) as BookListItem[];
        setBooks(list);
      } catch (e) {
        console.error('Failed to load books:', e);
        setBooks([]);
      }
    };

    loadBooks();
  }, [user?.id]);

  const refresh = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch('/api/books', {
        headers: {
          'x-user-id': String(user.id),
          'x-user-role': 'administrator',
        },
      });
      if (!res.ok) {
        setBooks([]);
        return;
      }
      const data = await res.json();
      setBooks((data.books || []) as BookListItem[]);
    } catch (e) {
      console.error('Failed to refresh books:', e);
      setBooks([]);
    }
  };

  const downloadBook = async (book: BookListItem) => {
    if (!user?.id) return;
    setBusyId(book.id);
    try {
      const res = await fetch(`/api/books/${book.id}/download`, {
        headers: {
          'x-user-id': String(user.id),
          'x-user-role': 'administrator',
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to download');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const contentDisposition = res.headers.get('content-disposition') || '';
      const match = contentDisposition.match(/filename="?([^\"]+)"?/i);
      const fallback = `${String(book.title || 'book').replace(/[^a-z0-9]+/gi, '_').toLowerCase()}_${book.edition_year}.json`;
      a.download = match?.[1] || fallback;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error('Download failed:', e);
      alert(e?.message || 'Failed to download');
    } finally {
      setBusyId(null);
    }
  };

  const publishBook = async (book: BookListItem) => {
    if (!user?.id) return;
    const ok = window.confirm('Publish this book? This will set it as the current book for the landing page and rotate older editions.');
    if (!ok) return;

    setBusyId(book.id);
    try {
      const res = await fetch(`/api/books/${book.id}/publish`, {
        method: 'POST',
        headers: {
          'x-user-id': String(user.id),
          'x-user-role': 'administrator',
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to publish');
      }
      alert('Book published successfully.');
      await refresh();
      setSelected(null);
    } catch (e: any) {
      console.error('Publish failed:', e);
      alert(e?.message || 'Failed to publish');
    } finally {
      setBusyId(null);
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
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Publish</h1>
          <p className="text-gray-600 mt-1">Manage books (publications) and publish a selected book to the public website.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-gray-600">
            Need to review what editors forwarded? Go to Publications.
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => router.push('/dashboard/admin/publications')}
          >
            Go to Publications
          </button>
        </div>

        {books.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-gray-600">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">No books found</h2>
            <p>Once editors submit books, they will appear here.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edition/Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Articles</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {books.map((book) => {
                    const isCurrent = Number(book.is_current) === 1;
                    const isBusy = busyId === book.id;
                    return (
                      <tr key={book.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-20 flex-shrink-0 bg-gray-100 border border-gray-200 overflow-hidden">
                              {book.cover_image_path ? (
                                <img src={book.cover_image_path} alt={book.title} className="w-full h-full object-cover" />
                              ) : null}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{book.title || `Book #${book.id}`}</div>
                              {book.author_list ? (
                                <div className="text-xs text-gray-600 mt-1">{book.author_list}</div>
                              ) : (
                                <div className="text-xs text-gray-500 mt-1">ID: {book.id}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{book.edition_year}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{Number(book.article_count || 0)}</td>
                        <td className="px-6 py-4">
                          {isCurrent ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Current
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {book.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-3">
                            <button
                              type="button"
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                              onClick={() => setSelected(book)}
                            >
                              <Eye className="w-4 h-4 mr-1" /> View
                            </button>
                            <button
                              type="button"
                              disabled={isBusy}
                              className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center disabled:text-gray-400"
                              onClick={() => downloadBook(book)}
                            >
                              <Download className="w-4 h-4 mr-1" /> {isBusy ? 'Working...' : 'Download'}
                            </button>
                            <button
                              type="button"
                              disabled={isBusy || isCurrent}
                              className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center disabled:text-gray-400"
                              onClick={() => publishBook(book)}
                            >
                              <Globe className="w-4 h-4 mr-1" /> Publish
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
                  <h2 className="text-xl font-semibold text-gray-900">{selected.title || `Book #${selected.id}`}</h2>
                  <div className="text-sm text-gray-600 mt-1">Edition: {selected.edition_year}</div>
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
                  <h3 className="font-medium text-gray-900 mb-2">Book Information</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div><strong>Book ID:</strong> {selected.id}</div>
                    <div><strong>Title:</strong> {selected.title}</div>
                    <div><strong>Edition/Year:</strong> {selected.edition_year}</div>
                    <div><strong>Status:</strong> {selected.status}{Number(selected.is_current) === 1 ? ' (current)' : ''}</div>
                    <div><strong>Articles:</strong> {Number(selected.article_count || 0)}</div>
                    {selected.author_list ? <div><strong>Authors:</strong> {selected.author_list}</div> : null}
                    <div><strong>Created:</strong> {selected.created_at ? new Date(selected.created_at).toLocaleDateString() : '--'}</div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => setSelected(null)}
                    disabled={busyId === selected.id}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    onClick={() => downloadBook(selected)}
                    disabled={busyId === selected.id}
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                    onClick={() => publishBook(selected)}
                    disabled={busyId === selected.id || Number(selected.is_current) === 1}
                  >
                    Publish
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
