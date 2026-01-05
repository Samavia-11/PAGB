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
    const mock: SubmissionDetail = {
      id,
      title: 'Innovative Battlefield Medicine',
      author_name: 'Samavia Khan',
      author_affiliation: 'Army Medical Corps',
      submitted_at: '2025-09-25',
      abstract:
        'This paper discusses novel first-aid procedures and evacuation tactics applicable to modern battlefield scenarios...',
      attachment_url: '#',
    };
    setDetail(mock);
    setLoading(false);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleSend = () => {
    // Mock send
    alert('Response sent to author!');
    router.push('/dashboard/editor/article-management');
  };

  if (loading || !detail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-academic-50">
        Loading...
      </div>
    );
  }

  return (
    <Layout user={user}>
      <button
        onClick={() => router.back()}
        className="text-primary-600 hover:text-primary-700 flex items-center mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <h1 className="text-2xl font-bold font-serif text-academic-900 mb-2">
        {detail.title}
      </h1>
      <p className="text-academic-600 mb-4">
        By {detail.author_name} {detail.author_affiliation && `— ${detail.author_affiliation}`}
      </p>

      <div className="mb-6 bg-white border border-academic-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-academic-900 mb-2">Abstract</h2>
        <p className="text-academic-700 whitespace-pre-wrap">{detail.abstract}</p>
      </div>

      {/* Attachment preview / download */}
      {detail.attachment_url && (
        <div className="mb-6">
          <a
            href={detail.attachment_url}
            target="_blank"
            className="text-primary-600 hover:text-primary-700 underline"
          >
            View Attached Manuscript
          </a>
        </div>
      )}

      {/* Reply form */}
      <div className="bg-white border border-academic-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-academic-900 mb-4">Reply to Author</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-academic-700 mb-1">
            Attach Document (optional)
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-primary-600 hover:text-primary-700">
            <Paperclip className="w-4 h-4" /> Choose file
            <input type="file" className="hidden" onChange={handleFile} />
          </label>
          {file && <p className="text-sm text-academic-600 mt-1">{file.name}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-academic-700 mb-1">Comments</label>
          <textarea
            rows={6}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="form-textarea w-full"
            placeholder="Write your remarks, feedback or revision request here..."
          />
        </div>

        <button onClick={handleSend} className="btn-primary flex items-center">
          <Send className="w-4 h-4 mr-2" /> Send
        </button>
      </div>
    </Layout>
  );
};

export default SubmissionDetailPage;
