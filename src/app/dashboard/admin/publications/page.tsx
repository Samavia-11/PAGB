'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { FileText, Eye, Download } from 'lucide-react';

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
}

type BookStatus = 'submitted' | 'published' | 'archived';

interface EditorAdminDocument {
  id: number;
  reviewer_forward_id: number | null;
  article_id: number | null;
  editor_id: number | null;
  admin_id: number | null;
  comment: string | null;
  attachment_name: string | null;
  attachment_path: string | null;
  attachment_type: string | null;
  attachment_size: number | null;
  created_at: string | null;

  editor_name: string | null;
  admin_name: string | null;
  reviewer_name: string | null;
  author_name: string | null;
  author_email: string | null;
  author_phone: string | null;

  article_title: string | null;
  article_abstract: string | null;
  article_status: BookStatus | string | null;
  manuscript_file_name: string | null;
  manuscript_file_path: string | null;
}

export default function AdminPublicationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<EditorAdminDocument[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [selected, setSelected] = useState<EditorAdminDocument | null>(null);

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
    const loadItems = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/editor-admin-documents?adminId=${encodeURIComponent(String(user.id))}`, {
          headers: {
            'x-user-id': String(user.id),
            'x-user-role': 'administrator',
          },
        });
        if (!res.ok) {
          setItems([]);
          return;
        }
        const data = await res.json();
        const list = (data.items || []) as EditorAdminDocument[];
        setItems(list);
      } catch (e) {
        console.error('Failed to load editor-admin documents:', e);
        setItems([]);
      }
    };

    loadItems();
  }, [user?.id]);

  const downloadItem = async (item: EditorAdminDocument) => {
    if (!user?.id) return;
    const fileUrl = item.attachment_path || item.manuscript_file_path;
    if (!fileUrl) {
      alert('No downloadable file is available for this item.');
      return;
    }

    setBusyId(item.id);
    try {
      const res = await fetch(fileUrl);
      if (!res.ok) throw new Error('Failed to download');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fallback = String(item.attachment_name || item.manuscript_file_name || `document_${item.id}`).replace(/[^a-z0-9._-]+/gi, '_');
      a.download = fallback;
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
          <p className="text-gray-600 mt-1">Articles/documents forwarded by editors to the administrator.</p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-gray-600">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">No forwarded articles found</h2>
            <p>When editors forward articles/documents to admin, they will appear here.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Editor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item) => {
                    const isBusy = busyId === item.id;
                    return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.article_title || `Article #${item.article_id || '--'}`}</div>
                          <div className="text-xs text-gray-500 mt-1">Forward ID: {item.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{item.editor_name || '--'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{item.author_name || '--'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Approved
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : '--'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                            onClick={() => setSelected(item)}
                          >
                            <Eye className="w-4 h-4 mr-1" /> View
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center disabled:text-gray-400"
                            onClick={() => downloadItem(item)}
                          >
                            <Download className="w-4 h-4 mr-1" /> {isBusy ? 'Working...' : 'Download'}
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
                  <h2 className="text-xl font-semibold text-gray-900">{selected.article_title || `Forwarded Item #${selected.id}`}</h2>
                  <div className="text-sm text-gray-600 mt-1">Editor: {selected.editor_name || '--'}</div>
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
                  <h3 className="font-medium text-gray-900 mb-2">Forwarded Article Information</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div><strong>Forward ID:</strong> {selected.id}</div>
                    <div><strong>Article ID:</strong> {selected.article_id || '--'}</div>
                    <div><strong>Article Title:</strong> {selected.article_title || '--'}</div>
                    <div><strong>Editor:</strong> {selected.editor_name || '--'}</div>
                    <div><strong>Author:</strong> {selected.author_name || '--'}</div>
                    <div><strong>Status:</strong> Approved</div>
                    <div><strong>Forwarded At:</strong> {selected.created_at ? new Date(selected.created_at).toLocaleString() : '--'}</div>
                    {selected.comment ? <div><strong>Comment:</strong> {selected.comment}</div> : null}
                  </div>
                </div>

                {selected.article_abstract ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Abstract</h3>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">{selected.article_abstract}</div>
                  </div>
                ) : null}

                {(selected.attachment_path || selected.manuscript_file_path) ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Files</h3>
                    <div className="space-y-2 text-sm">
                      {selected.attachment_path ? (
                        <div>
                          <a className="text-blue-600 hover:text-blue-700" href={selected.attachment_path} target="_blank" rel="noreferrer">
                            Open Attachment
                          </a>
                        </div>
                      ) : (
                        <div>
                          <a className="text-blue-600 hover:text-blue-700" href={selected.manuscript_file_path} target="_blank" rel="noreferrer">
                            Open Manuscript
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

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
                    onClick={() => downloadItem(selected)}
                    disabled={busyId === selected.id}
                  >
                    Download
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
