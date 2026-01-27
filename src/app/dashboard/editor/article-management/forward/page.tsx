'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft, Users, Send, FileText, UserCheck, Mail, Phone, Award, Upload } from 'lucide-react';
import { showNotification } from '@/utils/notifications';

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
  email?: string;
}

interface Reviewer {
  id: number;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  specialization: string;
  assignedArticles: number;
  status: 'available' | 'busy' | 'offline';
}

interface Submission {
  id: number;
  title: string;
  author_name: string;
  abstract: string;
  keywords?: string;
  content?: string;
}

const ForwardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [selectedReviewer, setSelectedReviewer] = useState<Reviewer | null>(null);
  const [comment, setComment] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    checkAuth();
    loadSubmission();
    loadReviewers();
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
    } finally {
      setLoading(false);
    }
  };

  const loadSubmission = async () => {
    const articleParam = searchParams.get('article');
    const articleId = articleParam ? parseInt(articleParam) : NaN;

    if (!articleParam || Number.isNaN(articleId) || articleId <= 0) {
      // Fallback to legacy sessionStorage navigation
      const stored = sessionStorage.getItem('selectedSubmission');
      if (stored) {
        const parsedSubmission = JSON.parse(stored);
        setSubmission(parsedSubmission);
        return;
      }
      router.push('/dashboard/editor/article-management');
      return;
    }

    try {
      const res = await fetch(`/api/articles?id=${articleId}`, {
        headers: {
          'x-user-id': (user?.id || '').toString(),
          'x-user-role': 'editor',
        },
      });

      if (!res.ok) {
        setSubmission(null);
        return;
      }

      const data = await res.json();
      const article = (data.articles || [])[0];
      if (!article) {
        setSubmission(null);
        return;
      }

      setSubmission({
        id: article.id,
        title: article.title,
        author_name: article.author_name,
        abstract: article.abstract,
        keywords: article.keywords,
        content: article.content,
      });
    } catch (error) {
      console.error('Error loading article:', error);
      setSubmission(null);
    }
  };

  const loadReviewers = async () => {
    try {
      const res = await fetch('/api/users?role=reviewer');
      if (!res.ok) {
        setReviewers([]);
        return;
      }

      const data = await res.json();
      const reviewerUsers = (data.users || []) as any[];

      const realReviewers: Reviewer[] = reviewerUsers.map((u) => ({
        id: u.id,
        name: u.full_name || u.username,
        email: u.email || `${u.username}@example.com`,
        phone: '+1-555-0' + String(u.id).padStart(3, '0'),
        qualification: 'Registered Reviewer',
        specialization: 'Academic Review',
        assignedArticles: 0,
        status: 'available' as const,
      }));

      setReviewers(realReviewers);
    } catch (error) {
      console.error('Error loading reviewers:', error);
      // Fallback to empty array if no reviewers found
      setReviewers([]);
    }
  };

  const handleForwardToReviewer = async () => {
    if (!selectedReviewer || !comment.trim() || !submission) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('articleId', String(submission.id));
      formData.append('reviewerId', String(selectedReviewer.id));
      formData.append('title', submission.title);
      formData.append('abstract', submission.abstract);
      formData.append('content', submission.content || '');
      formData.append('editorInstructions', comment);
      formData.append('status', 'pending');
      if (attachmentFile) {
        formData.append('attachment', attachmentFile);
      }

      // Save to database via API
      const response = await fetch('/api/editor-articles', {
        method: 'POST',
        headers: {
          'x-user-id': (user?.id || '').toString(),
          'x-user-role': 'editor',
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update the original article status to external_review
        await fetch('/api/articles', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': (user?.id || '').toString(),
            'x-user-role': 'editor',
          },
          body: JSON.stringify({
            id: submission.id,
            status: 'under_review'
          })
        });

        // Update reviewer's assigned articles count
        const updatedReviewers = reviewers.map(r => 
          r.id === selectedReviewer.id 
            ? { ...r, assignedArticles: r.assignedArticles + 1 }
            : r
        );
        setReviewers(updatedReviewers);

        showNotification.success(`Article forwarded to ${selectedReviewer.name} successfully!`);
        router.push('/dashboard/editor/article-management');
      } else {
        throw new Error('Failed to forward article');
      }
    } catch (error) {
      console.error('Error forwarding to reviewer:', error);
      showNotification.error('Failed to forward article. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Layout user={user}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          Loading...
        </div>
      </Layout>
    );
  }

  if (!submission) {
    return (
      <Layout user={user}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Article not found</h2>
            <p className="text-gray-500 mb-6">The requested article could not be found.</p>
            <button
              onClick={() => router.push('/dashboard/editor/article-management')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard/editor/article-management')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Article Management
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Forward to Reviewer
          </h1>
          <p className="text-gray-600">
            Select a reviewer to review: "{submission.title}"
          </p>
        </div>

        {/* Article Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Article Summary</h2>
          <div className="space-y-3">
            <div>
              <h3 className="font-medium text-gray-700">Author</h3>
              <p className="text-gray-600">{submission.author_name}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Title</h3>
              <p className="text-gray-600">{submission.title}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Abstract</h3>
              <p className="text-gray-600">{submission.abstract}</p>
            </div>
            {submission.keywords && (
              <div>
                <h3 className="font-medium text-gray-700">Keywords</h3>
                <p className="text-gray-600">{submission.keywords}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reviewers List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Available Reviewers
          </h2>
          
          {reviewers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No reviewers available</h3>
              <p className="text-gray-500">There are no registered reviewers in the system. Please ask reviewers to register first.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {reviewers.map((reviewer) => (
                <div
                  key={reviewer.id}
                  onClick={() => setSelectedReviewer(reviewer)}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedReviewer?.id === reviewer.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <UserCheck className="w-5 h-5 mr-2 text-green-600" />
                        <h3 className="font-semibold text-gray-900">{reviewer.name}</h3>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          reviewer.status === 'available' 
                            ? 'bg-green-100 text-green-800'
                            : reviewer.status === 'busy'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {reviewer.status}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          {reviewer.email}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {reviewer.phone}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Award className="w-4 h-4 mr-2" />
                          {reviewer.qualification}
                        </div>
                        <div className="text-gray-600">
                          <strong>Specialization:</strong> {reviewer.specialization}
                        </div>
                        <div className="text-gray-600">
                          <strong>Assigned Articles:</strong> {reviewer.assignedArticles}
                        </div>
                      </div>
                    </div>
                    
                    {selectedReviewer?.id === reviewer.id && (
                      <div className="ml-4">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment and Forward Section */}
        {selectedReviewer && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Forward to {selectedReviewer.name}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions for Reviewer
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Enter specific instructions or focus areas for the reviewer..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attach document (optional)</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                      onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  {attachmentFile ? (
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm text-gray-700 truncate">{attachmentFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setAttachmentFile(null)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">No file selected</span>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleForwardToReviewer}
                  disabled={sending || !comment.trim()}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sending ? 'Sending...' : 'Forward to Reviewer'}
                </button>
                
                <button
                  onClick={() => router.push('/dashboard/editor/article-management')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ForwardPage;
