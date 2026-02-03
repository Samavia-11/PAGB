'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { ArrowLeft, Send, Paperclip } from 'lucide-react';
import { useConfirmDialog } from '@/contexts/ConfirmDialogContext';
import { showNotification } from '@/utils/notifications';
import { sanitizeMultilineText, getValidationError } from '@/utils/validation';

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
}

interface SubmissionDetail {
  id: number;
  title: string;
  author_name: string;
  author_affiliation?: string;
  submitted_at: string;
  abstract: string;
  attachment_url?: string;
}

const SubmissionDetailPage = () => {
  const params = useParams();
  const id = Number(params?.id);
  const router = useRouter();
  const confirm = useConfirmDialog();
  const [user, setUser] = useState<User | null>(null);
  const [detail, setDetail] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    checkAuth();
    loadMockDetail();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user.role !== 'editor') {
          router.push('/');
          return;
        }
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (e) {
      router.push('/login');
    }
  };

  const loadMockDetail = () => {
    // Load from sessionStorage first (set from previous page)
    const stored = sessionStorage.getItem('selectedSubmission');
    if (stored) {
      const parsedSubmission = JSON.parse(stored);
      setDetail(parsedSubmission);
    } else {
      // Fallback to localStorage
      const realSubmissions = JSON.parse(localStorage.getItem('editor_submissions') || '[]') as SubmissionDetail[];
      const found = realSubmissions.find(s => s.id === id);
      setDetail(found || null);
    }
    setLoading(false);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        showNotification.error('Only PDF and Word documents (.pdf, .doc, .docx) are allowed');
        e.target.value = '';
        return;
      }
    }
    setFile(file || null);
  };

  const handleSend = async () => {
    if (!comment.trim() && !file) {
      showNotification.warning('Please enter your comments or attach a file before sending.');
      return;
    }

    const commentError = getValidationError(comment, 'Comments');
    if (comment.trim() && commentError) {
      showNotification.error(commentError);
      return;
    }

    const ok = await confirm({
      title: 'Send to author?',
      message: 'Do you want to send this reply to the author?',
      confirmText: 'Send',
      cancelText: 'Cancel',
    });
    if (!ok) return;

    try {
      // Get the actual submission data from sessionStorage
      const storedSubmission = sessionStorage.getItem('selectedSubmission');
      if (!storedSubmission) {
        showNotification.error('Article data not found. Please go back and try again.');
        return;
      }

      const submissionData = JSON.parse(storedSubmission);
      console.log('Editor sending reply for:', submissionData);

      if (!user?.id) {
        showNotification.error('Not authenticated. Please login again.');
        router.push('/login');
        return;
      }

      const formData = new FormData();
      formData.append('sender_id', String(user.id));
      formData.append('sender_role', 'editor');
      formData.append('message', comment);
      if (file) {
        formData.append('file', file);
      }

      const sendRes = await fetch(`/api/articles/${submissionData.id}/comments`, {
        method: 'POST',
        body: formData,
      });

      if (!sendRes.ok) {
        const err = await sendRes.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to send to author');
      }

      const patchRes = await fetch('/api/articles', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(user.id),
          'x-user-role': 'editor',
        },
        body: JSON.stringify({
          id: submissionData.id,
          status: 'editor_review',
        }),
      });

      if (!patchRes.ok) {
        const err = await patchRes.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to update article status');
      }

      showNotification.success('Sent to author successfully.');
      router.push('/dashboard/editor/article-management');
    } catch (error) {
      console.error('Error sending reply:', error);
      const msg = error instanceof Error ? error.message : 'Failed to send reply. Please try again.';
      showNotification.error(msg);
    }
  };

  if (loading || !detail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        Loading...
      </div>
    );
  }

  return (
    <Layout user={user}>
      <button
        onClick={() => router.back()}
        className="text-blue-600 hover:text-blue-700 flex items-center mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {detail.title}
      </h1>
      <p className="text-gray-600 mb-4">
        By {detail.author_name} {detail.author_affiliation && `— ${detail.author_affiliation}`}
      </p>

      <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Abstract</h2>
        <div className="max-h-32 overflow-y-auto">
          <p className="text-gray-700 whitespace-pre-wrap break-words pr-2" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
            {detail.abstract}
          </p>
        </div>
      </div>

      {/* Attachment preview / open */}
      {detail.attachment_url && (
        <div className="mb-6">
          <a
            href={detail.attachment_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Open Manuscript
          </a>
        </div>
      )}

      {/* Reply form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Reply to Author</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attach Document (optional)
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-blue-600 hover:text-blue-700">
            <Paperclip className="w-4 h-4" /> Choose file
            <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFile} />
          </label>
          {file && <p className="text-sm text-gray-600 mt-1">{file.name}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
          <textarea
            rows={6}
            value={comment}
            onChange={(e) => setComment(sanitizeMultilineText(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Write your remarks, feedback or revision request here..."
          />
        </div>

        <button 
          onClick={handleSend} 
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Send className="w-4 h-4 mr-2" /> Send
        </button>
      </div>
    </Layout>
  );
};

export default SubmissionDetailPage;
