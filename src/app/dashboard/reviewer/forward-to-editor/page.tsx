'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft, Upload, Send, FileText } from 'lucide-react';

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
}

interface EditorArticle {
  id: number;
  article_id: number;
  editor_id: number;
  reviewer_id: number;
  title: string;
  abstract: string;
  content?: string;
  editor_instructions?: string;
  status: string;
  assigned_date?: string;
  editor_name?: string;
}

export default function ReviewerForwardToEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editorArticleId = searchParams.get('editorArticleId');

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [editorArticle, setEditorArticle] = useState<EditorArticle | null>(null);
  const [comment, setComment] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  const editorArticleIdNum = useMemo(() => {
    const n = Number(editorArticleId);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [editorArticleId]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
          return;
        }
        const data = await response.json();
        if (data.user.role !== 'reviewer') {
          router.push('/');
          return;
        }
        setUser(data.user);
      } catch (e) {
        router.push('/login');
      }
    };

    checkAuth().finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    const loadEditorArticle = async () => {
      if (!editorArticleIdNum) return;
      try {
        const res = await fetch(`/api/editor-articles/${editorArticleIdNum}`, {
          headers: {
            'x-user-role': 'reviewer',
          },
        });
        if (!res.ok) {
          setEditorArticle(null);
          return;
        }
        const data = await res.json();
        setEditorArticle(data.editorArticle);
      } catch (e) {
        setEditorArticle(null);
      }
    };

    loadEditorArticle();
  }, [editorArticleIdNum]);

  const submit = async () => {
    if (!user || !editorArticleIdNum || !editorArticle) return;
    if (!attachmentFile) {
      alert('Please attach a document before forwarding.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('editorArticleId', String(editorArticleIdNum));
      formData.append('articleId', String(editorArticle.article_id));
      formData.append('editorId', String(editorArticle.editor_id));
      formData.append('comment', comment);
      formData.append('attachment', attachmentFile);

      const res = await fetch('/api/reviewer-forwarded-documents', {
        method: 'POST',
        headers: {
          'x-user-role': 'reviewer',
          'x-user-id': String(user.id),
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to forward');
      }

      alert('Forwarded to editor successfully.');
      router.push('/dashboard/reviewer');
    } catch (e: any) {
      console.error('Failed to forward to editor:', e);
      alert(e?.message || 'Failed to forward');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-academic-50 flex items-center justify-center">
        <div className="text-academic-600">Loading...</div>
      </div>
    );
  }

  return (
    <Layout user={user}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.push('/dashboard/reviewer')}
            className="flex items-center text-academic-600 hover:text-academic-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reviewer Dashboard
          </button>

          <h1 className="text-3xl font-bold text-academic-900 font-serif">Forward to Editor</h1>
          <p className="text-academic-600 mt-1">Attach your reviewed document and add comments for the editor.</p>
        </div>

        {!editorArticleIdNum || !editorArticle ? (
          <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
            <div className="text-academic-700">Article not found.</div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
              <h2 className="text-lg font-semibold text-academic-900 mb-2">Article Summary</h2>
              <div className="text-sm text-academic-700">
                <div className="font-semibold text-academic-900">{editorArticle.title}</div>
                <div className="text-academic-600 mt-1">{editorArticle.abstract}</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
              <h2 className="text-lg font-semibold text-academic-900 mb-4">Comments</h2>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={6}
                className="form-textarea"
                placeholder="Write comments for the editor (optional)"
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
              <h2 className="text-lg font-semibold text-academic-900 mb-4">Attach Document</h2>

              <div className="flex items-center gap-3">
                <label className="flex items-center px-4 py-2 border border-academic-200 rounded-lg cursor-pointer hover:bg-academic-50 transition-colors text-sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                  />
                </label>

                {attachmentFile ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-academic-600" />
                    <span className="text-sm text-academic-800 truncate">{attachmentFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachmentFile(null)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <span className="text-sm text-academic-600">No file selected</span>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6 flex justify-end gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => router.push('/dashboard/reviewer')}
                disabled={submitting}
              >
                Cancel
              </button>
              <button type="button" className="btn-primary flex items-center" onClick={submit} disabled={submitting}>
                <Send className="w-4 h-4 mr-2" />
                {submitting ? 'Sending...' : 'Send to Editor'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
