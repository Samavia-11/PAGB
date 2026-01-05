'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { ArrowLeft, Send, Paperclip } from 'lucide-react';

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
    setFile(e.target.files?.[0] || null);
  };

  const handleSend = async () => {
    if (!comment.trim()) {
      alert('Please enter your comments before sending.');
      return;
    }

    try {
      // Get the actual submission data from sessionStorage
      const storedSubmission = sessionStorage.getItem('selectedSubmission');
      if (!storedSubmission) {
        alert('Article data not found. Please go back and try again.');
        return;
      }

      const submissionData = JSON.parse(storedSubmission);
      console.log('Editor sending reply for:', submissionData);
      
      // Save reply for author to see in reviewed page
      const authorReplies = JSON.parse(localStorage.getItem('authorReplies') || '[]') as {id:number,reply:string,articleId:number}[];
      authorReplies.push({
        id: submissionData.id,
        reply: comment,
        articleId: submissionData.id
      });
      localStorage.setItem('authorReplies', JSON.stringify(authorReplies));
      console.log('Saved to authorReplies:', authorReplies);

      // Update the author's article in their storage
      if (submissionData.author_id) {
        console.log('Updating author article for author_id:', submissionData.author_id);
        const authorArticles = JSON.parse(localStorage.getItem(`articles:${submissionData.author_id}`) || '[]') as any[];
        console.log('Author articles before update:', authorArticles);
        
        const updatedAuthorArticles = authorArticles.map(article => 
          article.id === submissionData.id 
            ? {
                ...article,
                status: 'editor_review',
                editorComments: comment,
                reviewedDate: new Date().toISOString(),
                reviewedBy: user?.full_name || user?.username || 'Editor',
                editorAttachment: file ? URL.createObjectURL(file) : undefined,
                editorAttachmentName: file ? file.name : undefined,
              }
            : article
        );
        
        console.log('Author articles after update:', updatedAuthorArticles);
        localStorage.setItem(`articles:${submissionData.author_id}`, JSON.stringify(updatedAuthorArticles));
      } else {
        console.warn('No author_id found in submission data');
      }

      // Update editor submissions status
      const editorSubmissions = JSON.parse(localStorage.getItem('editor_submissions') || '[]') as any[];
      const updatedEditorSubmissions = editorSubmissions.map(s => 
        s.id === submissionData.id 
          ? { ...s, status: 'author_reply', last_reply: comment }
          : s
      );
      localStorage.setItem('editor_submissions', JSON.stringify(updatedEditorSubmissions));

      alert('Reply sent successfully to author! The author can view your comments in their Reviewed section.');
      router.push('/dashboard/editor/article-management');
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply. Please try again.');
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
        <p className="text-gray-700 whitespace-pre-wrap">{detail.abstract}</p>
      </div>

      {/* Attachment preview / download */}
      {detail.attachment_url && (
        <div className="mb-6">
          <a
            href={detail.attachment_url}
            target="_blank"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            View Attached Manuscript
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
            <input type="file" className="hidden" onChange={handleFile} />
          </label>
          {file && <p className="text-sm text-gray-600 mt-1">{file.name}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
          <textarea
            rows={6}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
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
