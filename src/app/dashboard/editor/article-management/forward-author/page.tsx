'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft, Send, FileText, AlertCircle } from 'lucide-react';
import { showNotification } from '@/utils/notifications';
import { sanitizeMultilineText, getValidationError } from '@/utils/validation';

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
}

interface Article {
  id: number;
  title: string;
  author_id: number;
  author_name: string;
  content: string;
  status: string;
  created_at: string;
}

interface ReviewerForwardedDoc {
  id: number;
  reviewer_id: number;
  article_id: number;
  title: string;
  content: string;
  file_path: string;
  created_at: string;
}

function ForwardToAuthorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [article, setArticle] = useState<Article | null>(null);
  const [reviewerDoc, setReviewerDoc] = useState<ReviewerForwardedDoc | null>(null);
  const [comment, setComment] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  const articleId = searchParams.get('article');
  const reviewerForwardId = searchParams.get('reviewerForwardId');

  const isAllowedAttachmentFile = (file: File) => {
    const name = String(file?.name || '').toLowerCase();
    return name.endsWith('.pdf') || name.endsWith('.docx');
  };

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
    const loadData = async () => {
      if (!user?.id || !articleId) return;

      try {
        // Load article details
        const articleRes = await fetch(`/api/articles?id=${articleId}`, {
          headers: {
            'x-user-id': String(user.id),
            'x-user-role': 'editor',
          },
        });

        if (!articleRes.ok) {
          throw new Error('Failed to load article details');
        }

        const articleData = await articleRes.json();
        const articleList = articleData.articles || [];
        const foundArticle = articleList.find((a: Article) => a.id === Number(articleId));
        
        if (!foundArticle) {
          throw new Error('Article not found');
        }
        
        setArticle(foundArticle);

        if (reviewerForwardId) {
          // Load reviewer document details (API supports query params, not /:id)
          const docRes = await fetch(`/api/reviewer-forwarded-documents?editorId=${user.id}`, {
            headers: {
              'x-user-id': String(user.id),
              'x-user-role': 'editor',
            },
          });

          if (!docRes.ok) {
            throw new Error('Failed to load reviewer document');
          }

          const docData = await docRes.json();
          const items = (docData.items || []) as ReviewerForwardedDoc[];
          const foundDoc = items.find((d) => String(d.id) === String(reviewerForwardId));
          if (!foundDoc) {
            throw new Error('Reviewer document not found');
          }
          setReviewerDoc(foundDoc);
        } else {
          setReviewerDoc(null);
        }

      } catch (error) {
        console.error('Failed to load data:', error);
        showNotification.error('Failed to load data. Please try again.');
        router.back();
      }
    };

    loadData();
  }, [user?.id, articleId, reviewerForwardId, router]);

  const handleForwardToAuthor = async () => {
    if (!user || !article) return;
    if (reviewerForwardId && !reviewerDoc) return;
    
    if (!comment.trim()) {
      showNotification.error('Please enter comments for the author');
      return;
    }

    // Validate comment for special characters
    const commentError = getValidationError(comment, 'Comment');
    if (commentError) {
      showNotification.error(commentError);
      return;
    }

    setSubmitting(true);
    try {
      if (reviewerForwardId) {
        const response = await fetch('/api/editor-author-documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': String(user.id),
            'x-user-role': 'editor',
          },
          body: JSON.stringify({
            reviewerForwardId: Number(reviewerForwardId),
            authorId: article.author_id,
            comment: comment.trim(),
          }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.error || 'Failed to forward to author');
        }
      } else {
        if (!user?.id) {
          throw new Error('Not authenticated');
        }

        const formData = new FormData();
        formData.append('sender_id', String(user.id));
        formData.append('sender_role', 'editor');
        formData.append('message', comment.trim());
        if (attachmentFile) {
          formData.append('file', attachmentFile);
        }

        const response = await fetch(`/api/articles/${Number(articleId)}/comments`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.error || 'Failed to send to author');
        }

        await fetch('/api/articles', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': String(user.id),
            'x-user-role': 'editor',
          },
          body: JSON.stringify({
            id: Number(articleId),
            status: 'editor_review',
          }),
        }).catch(() => null);
      }

      showNotification.success('Document forwarded to author successfully');
      router.push('/dashboard/editor/article-management');
    } catch (error: any) {
      console.error('Forward to author failed:', error);
      showNotification.error(error?.message || 'Failed to forward to author');
    } finally {
      setSubmitting(false);
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Article Management
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Forward to Author</h1>
          <p className="text-gray-600 mt-1">Send reviewer document back to the author with your comments</p>
        </div>

        {article && (!reviewerForwardId || reviewerDoc) && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {/* Article Information */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Article Information</h2>
              <div className="space-y-1">
                <p><span className="font-medium">Title:</span> {article.title}</p>
                <p><span className="font-medium">Author:</span> {article.author_name}</p>
              </div>
            </div>

            {/* Reviewer Document Information */}
            {reviewerDoc ? (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Reviewer Document</h2>
                <div className="space-y-1">
                  <p><span className="font-medium">Document Title:</span> {reviewerDoc.title}</p>
                  <p><span className="font-medium">Created:</span> {new Date(reviewerDoc.created_at).toLocaleString()}</p>
                </div>
              </div>
            ) : null}

            {/* File Attachment Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attach File (optional)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Choose File
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      if (f && !isAllowedAttachmentFile(f)) {
                        showNotification.error('Only PDF or DOCX files are allowed');
                        e.target.value = '';
                        setAttachmentFile(null);
                        return;
                      }
                      setAttachmentFile(f);
                    }}
                  />
                </label>
                {attachmentFile ? (
                  <span className="text-sm text-gray-600">{attachmentFile.name}</span>
                ) : (
                  <span className="text-sm text-gray-400">No file selected</span>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments for Author *
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(sanitizeMultilineText(e.target.value))}
                placeholder="Provide your comments and feedback for the author..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                These comments will be sent to the author along with the reviewer document
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleForwardToAuthor}
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? 'Sending...' : 'Send to Author'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default function ForwardToAuthorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>}>
      <ForwardToAuthorContent />
    </Suspense>
  );
}
