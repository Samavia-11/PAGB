'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import {
  FileText,
  Clock,
  ArrowRight,
  Users,
  Inbox,
  History,
  Send,
} from 'lucide-react';

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
}

interface Submission {
  id: number;
  title: string;
  author_name: string;
  author_id?: number;
  submitted_at: string;
  status: 'new' | 'revision' | 'external_review' | 'author_reply';
  abstract?: string;
  keywords?: string;
  authors?: any[];
  last_reply?: string;
  reviewerName?: string;
  reviewerDecision?: string;
  responseDate?: string;
}

const ArticleManagementPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState<'new' | 'revision' | 'external_review' | 'author_reply'>('new');
  const router = useRouter();

  const mapDbStatusToTabStatus = (status: string): Submission['status'] => {
    if (status === 'submitted') return 'new';
    if (status === 'under_review') return 'external_review';
    if (status === 'reviewed' || status === 'editor_review') return 'revision';
    return 'revision';
  };

  useEffect(() => {
    checkAuth();
    loadMockSubmissions();
    
    // Listen for new submissions
    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('editor_submissions');
      channel.onmessage = () => {
        loadMockSubmissions(); // Reload when new submissions arrive
      };
    }

    return () => {
      if (channel) channel.close();
    };
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

  const loadMockSubmissions = async () => {
    try {
      // Load articles from database
      const response = await fetch('/api/articles');
      let allSubmissions: Submission[] = [];
      
      if (response.ok) {
        const data = await response.json();
        const articles = data.articles || [];
        
        // Transform articles to match the expected format
        const transformedSubmissions = articles.map(article => ({
          id: article.id,
          title: article.title,
          author_name: article.author_name,
          submitted_at: article.submission_date,
          status: mapDbStatusToTabStatus(article.status),
          abstract: article.abstract,
          content: article.content,
          keywords: article.keywords,
          authors: article.authors,
          affiliation: article.affiliation,
          articleType: article.article_type,
          manuscriptFileName: article.manuscript_file_name,
          author_id: article.author_id
        }));
        
        // Load editor forwards (editor_articles)
        let forwardedArticles: any[] = [];
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
          const forwardedResp = await fetch('/api/editor-articles', {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          if (forwardedResp.ok) {
            const forwardedData = await forwardedResp.json();
            forwardedArticles = (forwardedData.editorArticles || []).map((ea: any) => ({
              id: ea.id,
              title: ea.title,
              author_name: ea.author_name || ea.author_username || 'Author',
              submitted_at: ea.assigned_date,
              status: 'external_review',
              abstract: ea.abstract,
              content: ea.content,
              assignmentId: ea.id,
              reviewerId: ea.reviewer_id,
              reviewerName: ea.reviewer_name,
              reviewerDecision: ea.status,
              responseDate: ea.response_date
            }));
          }
        } catch (e) {
          console.error('Failed to load forwarded articles:', e);
        }
        
        // Combine all articles
        allSubmissions = [...transformedSubmissions, ...forwardedArticles];
      } else {
        // Fallback to localStorage data
        const realSubmissions = JSON.parse(localStorage.getItem('editor_submissions') || '[]') as Submission[];
        allSubmissions = realSubmissions;
      }
      
      // Load saved replies
      const savedReplies = JSON.parse(localStorage.getItem('authorReplies') || '[]') as {id:number,reply:string}[];
      
      console.log('All submissions after merge:', allSubmissions);
      
      // Update submissions with saved replies
      const updatedSubmissions = allSubmissions.map(sub => {
        const reply = savedReplies.find(r => r.id === sub.id);
        return reply ? { ...sub, last_reply: reply.reply } : sub;
      });
      
      console.log('Final submissions:', updatedSubmissions);
      setSubmissions(updatedSubmissions);
    } catch (error) {
      console.error('Error loading submissions:', error);
      // Fallback to localStorage
      const realSubmissions = JSON.parse(localStorage.getItem('editor_submissions') || '[]') as Submission[];
      setSubmissions(realSubmissions);
    }
  };

  const filtered = submissions.filter((s) => s.status === activeTab);
  console.log(`Filtered submissions for tab '${activeTab}':`, filtered);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        Loading...
      </div>
    );
  }

  const tabButton = (
    label: string,
    type: 'new' | 'revision' | 'external_review' | 'author_reply',
    icon: React.ReactNode,
  ) => (
    <button
      onClick={() => setActiveTab(type)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
        activeTab === type
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <Layout user={user}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Article Management
        </h1>
        <p className="text-gray-600 mt-1">
          Filter and manage author submissions efficiently.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 mb-6">
        {tabButton('New Submissions', 'new', <Inbox className="w-4 h-4" />)}
        {tabButton('Editorial Role (Revisions)', 'revision', <History className="w-4 h-4" />)}
        {tabButton('External (Reviewers)', 'external_review', <Users className="w-4 h-4" />)}
        {tabButton('Reply', 'author_reply', <Send className="w-4 h-4" />)}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Submitted
                </th>
                {activeTab === 'external_review' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Reviewer Status
                  </th>
                )}
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {s.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {s.author_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(s.submitted_at).toLocaleDateString()}
                  </td>
                  {activeTab === 'external_review' && (
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{s.reviewerName || '—'}</span>
                        <span
                          className={`mt-1 inline-flex w-fit px-2 py-1 rounded-full text-xs font-medium ${{
                            accepted: 'bg-green-100 text-green-800',
                            rejected: 'bg-red-100 text-red-800',
                            pending: 'bg-yellow-100 text-yellow-800',
                            completed: 'bg-blue-100 text-blue-800'
                          }[(s.reviewerDecision || 'pending') as any] || 'bg-gray-100 text-gray-800'}`}
                        >
                          {(s.reviewerDecision || 'pending').toUpperCase()}
                        </span>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          console.log('Reply clicked for submission:', s);
                          console.log('Current active tab:', activeTab);
                          sessionStorage.setItem('selectedSubmission', JSON.stringify(s));
                          router.push(`/dashboard/editor/article-management/${s.id}`);
                        }}
                        className="text-blue-600 hover:text-blue-700 flex items-center text-sm font-medium"
                      >
                        Reply <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
                      <button
                        onClick={() => {
                          console.log('Forward clicked for submission:', s);
                          sessionStorage.setItem('selectedSubmission', JSON.stringify(s));
                          router.push(`/dashboard/editor/article-management/forward?article=${s.id}`);
                        }}
                        className="text-green-600 hover:text-green-700 flex items-center text-sm font-medium"
                      >
                        Forward <Users className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No submissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default ArticleManagementPage;
