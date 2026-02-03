'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft, Send, FileText } from 'lucide-react';
import { showNotification } from '@/utils/notifications';

// Sanitization function to prevent special characters
const sanitizeComment = (value: string) => String(value || '').replace(/[^A-Za-z0-9\s.,!?-]/g, '');

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
}

interface ReviewerForwardedDoc {
  id: number;
  article_id: number;
  editor_id: number;
  reviewer_id: number;
  comment: string | null;
  attachment_name: string | null;
  attachment_path: string | null;
  created_at: string;
  reviewer_name?: string;
  article_title?: string;
  article_abstract?: string;
}

function ForwardAdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const reviewerForwardId = useMemo(() => {
    const v = searchParams.get('reviewerForwardId');
    const n = v ? Number(v) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [searchParams]);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [doc, setDoc] = useState<ReviewerForwardedDoc | null>(null);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (data.user?.role !== 'editor') {
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
    const loadDoc = async () => {
      if (!user?.id || !reviewerForwardId) return;

      try {
        const res = await fetch(`/api/reviewer-forwarded-documents?editorId=${user.id}`, {
          headers: {
            'x-user-id': String(user.id),
            'x-user-role': 'editor',
          },
        });

        if (!res.ok) {
          setDoc(null);
          return;
        }

        const data = await res.json();
        const items = (data.items || []) as ReviewerForwardedDoc[];
        const found = items.find((d) => Number(d.id) === reviewerForwardId) || null;
        setDoc(found);
      } catch (e) {
        console.error('Failed to load reviewer forwarded doc:', e);
        setDoc(null);
      }
    };

    loadDoc();
  }, [user?.id, reviewerForwardId]);

  const handleSend = async () => {
    if (!user?.id || !reviewerForwardId) return;

    setSending(true);
    try {
      const res = await fetch('/api/editor-admin-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(user.id),
          'x-user-role': 'editor',
        },
        body: JSON.stringify({
          reviewerForwardId,
          comment: comment.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to forward to admin');
      }

      showNotification.success('Forwarded to admin successfully.');
      router.push('/dashboard/editor/article-management');
    } catch (e: any) {
      console.error('Forward to admin failed:', e);
      showNotification.error(e?.message || 'Failed to forward to admin');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>
    );
  }

  if (!doc) {
    return (
      <Layout user={user}>
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => router.push('/dashboard/editor/article-management')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </button>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 text-gray-700">
              <FileText className="w-5 h-5" />
              <div className="font-semibold">Reviewer document not found</div>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              Please go back and try again.
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user}>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/dashboard/editor/article-management')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Article Management
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Forward to Admin</h1>
          <div className="text-sm text-gray-600 mt-1">
            Article: {doc.article_title || `Article #${doc.article_id}`}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Reviewer Submission</h2>
          {doc.reviewer_name ? (
            <div className="text-sm text-gray-700 mb-2">Reviewer: {doc.reviewer_name}</div>
          ) : null}
          {doc.article_abstract ? (
            <div className="text-sm text-gray-700 whitespace-pre-wrap">{doc.article_abstract}</div>
          ) : (
            <div className="text-sm text-gray-600">No abstract available.</div>
          )}

          {doc.attachment_path ? (
            <div className="mt-4">
              <a
                href={doc.attachment_path}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Open Attachment{doc.attachment_name ? `: ${doc.attachment_name}` : ''}
              </a>
            </div>
          ) : null}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Comment to Admin (optional)</label>
          <textarea
            rows={5}
            value={comment}
            onChange={(e) => setComment(sanitizeComment(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Write message for administrator"
            disabled={sending}
          />

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard/editor/article-management')}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={sending}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={sending}
            >
              <span className="inline-flex items-center">
                <Send className="w-4 h-4 mr-2" /> {sending ? 'Sending...' : 'Forward to Admin'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function ForwardAdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>}>
      <ForwardAdminContent />
    </Suspense>
  );
}
