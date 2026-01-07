'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { FileText, Globe, Download, Eye } from 'lucide-react';

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
}

type EditorAdminDoc = {
  id: number;
  reviewer_forward_id: number;
  article_id: number;
  editor_id: number;
  admin_id: number;
  comment: string | null;
  attachment_name: string | null;
  attachment_path: string | null;
  created_at: string;
  editor_name?: string | null;
  admin_name?: string | null;
  reviewer_name?: string | null;
  author_name?: string | null;
  author_email?: string | null;
  author_phone?: string | null;
  article_title?: string | null;
  article_abstract?: string | null;
  article_status?: string | null;
  manuscript_file_name?: string | null;
  manuscript_file_path?: string | null;
};

export default function EditorAdminDocumentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<EditorAdminDoc[]>([]);
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [selected, setSelected] = useState<EditorAdminDoc | null>(null);

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
      } catch (e) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  const loadItems = async (adminId: number) => {
    try {
      const res = await fetch(`/api/editor-admin-documents?adminId=${adminId}`, {
        headers: {
          'x-user-id': String(adminId),
          'x-user-role': 'administrator',
        },
      });
      if (!res.ok) {
        setItems([]);
        return;
      }
      const data = await res.json();
      setItems((data.items || []) as EditorAdminDoc[]);
    } catch (e) {
      console.error('Failed to load editor admin documents:', e);
      setItems([]);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    loadItems(user.id);
  }, [user?.id]);

  const publish = async (doc: EditorAdminDoc) => {
    if (!user?.id) return;
    setPublishingId(doc.id);
    try {
      const res = await fetch('/api/articles', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(user.id),
          'x-user-role': 'administrator',
        },
        body: JSON.stringify({ id: doc.article_id, status: 'published' }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to publish');
      }

      alert('Published successfully.');
      loadItems(user.id);
      setSelected(null);
    } catch (e: any) {
      console.error('Publish failed:', e);
      alert(e?.message || 'Failed to publish');
    } finally {
      setPublishingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>
    );
  }

  return (
    <Layout user={user}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Editor → Admin Documents</h1>
          <div className="text-sm text-gray-600 mt-1">Documents forwarded by editors for publication.</div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-gray-600">
            No forwarded documents yet.
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Editor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{d.article_title || `Article #${d.article_id}`}</div>
                        {d.attachment_name ? (
                          <div className="text-xs text-gray-500 mt-1 truncate">File: {d.attachment_name}</div>
                        ) : null}
                        {d.comment ? (
                          <div className="text-xs text-gray-600 mt-1 line-clamp-2">Editor note: {d.comment}</div>
                        ) : null}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div>{d.author_name || '—'}</div>
                        {d.author_email ? <div className="text-xs text-gray-500">{d.author_email}</div> : null}
                        {d.author_phone ? <div className="text-xs text-gray-500">{d.author_phone}</div> : null}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{d.editor_name || `#${d.editor_id}`}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{d.article_status || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3 justify-end">
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                            onClick={() => setSelected(d)}
                          >
                            <Eye className="w-4 h-4 mr-1" /> View
                          </button>
                          {d.attachment_path ? (
                            <a
                              href={d.attachment_path}
                              download
                              className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
                            >
                              <Download className="w-4 h-4 mr-1" /> Download
                            </a>
                          ) : null}
                          <button
                            type="button"
                            className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center disabled:text-gray-400"
                            disabled={publishingId === d.id}
                            onClick={() => publish(d)}
                          >
                            <Globe className="w-4 h-4 mr-1" /> {publishingId === d.id ? 'Publishing...' : 'Publish'}
                          </button>
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
                  <div className="text-xl font-bold text-gray-900">{selected.article_title || `Article #${selected.article_id}`}</div>
                  <div className="text-sm text-gray-600 mt-1">Forwarded by {selected.editor_name || `#${selected.editor_id}`}</div>
                </div>
                <button className="text-gray-500 hover:text-gray-700" onClick={() => setSelected(null)}>
                  ×
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-800 font-semibold">
                    <FileText className="w-5 h-5" /> Article & Author Details
                  </div>
                  <div className="text-sm text-gray-700 mt-2"><strong>Author:</strong> {selected.author_name || '—'}</div>
                  <div className="text-sm text-gray-700"><strong>Email:</strong> {selected.author_email || '—'}</div>
                  <div className="text-sm text-gray-700"><strong>Phone:</strong> {selected.author_phone || '—'}</div>
                  <div className="text-sm text-gray-700 mt-2 whitespace-pre-wrap"><strong>Abstract:</strong> {selected.article_abstract || '—'}</div>
                </div>

                {selected.comment ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-sm font-semibold text-gray-900">Editor Note</div>
                    <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{selected.comment}</div>
                  </div>
                ) : null}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => setSelected(null)}
                    disabled={publishingId === selected.id}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                    onClick={() => publish(selected)}
                    disabled={publishingId === selected.id}
                  >
                    {publishingId === selected.id ? 'Publishing...' : 'Publish'}
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
