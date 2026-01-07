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
  Download,
  User,
} from 'lucide-react';

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
}

interface Submission {
  rowKey: string;
  id: number;
  articleId: number;
  title: string;
  author_name: string;
  author_id?: number;
  submitted_at: string;
  status: 'new' | 'revision' | 'external_review' | 'author_reply' | 'reviewer_article' | 'author_article';
  abstract?: string;
  keywords?: string;
  authors?: any[];
  last_reply?: string;
  reviewerName?: string;
  reviewerDecision?: string;
  responseDate?: string;
}

interface ReviewerForwardedDoc {
  id: number;
  editor_article_id: number;
  article_id: number;
  reviewer_id: number;
  editor_id: number;
  comment: string | null;
  attachment_name: string | null;
  attachment_path: string | null;
  attachment_type: string | null;
  attachment_size: number | null;
  created_at: string;
  reviewer_name?: string;
  editor_name?: string;
  article_title?: string;
  article_abstract?: string;
}

interface AuthorUser {
  id: number;
  username: string;
  full_name?: string;
  email?: string;
}

const ArticleManagementPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState<'new' | 'revision' | 'external_review' | 'author_reply' | 'reviewer_article' | 'author_article'>('new');
  const [reviewerDocs, setReviewerDocs] = useState<ReviewerForwardedDoc[]>([]);
  const [authors, setAuthors] = useState<AuthorUser[]>([]);
  const [selectedAuthorByDoc, setSelectedAuthorByDoc] = useState<Record<number, number | ''>>({});
  const [sendCommentByDoc, setSendCommentByDoc] = useState<Record<number, string>>({});
  const [sendingDocId, setSendingDocId] = useState<number | null>(null);
  const [forwardChoiceOpen, setForwardChoiceOpen] = useState(false);
  const [forwardChoiceSubmission, setForwardChoiceSubmission] = useState<Submission | null>(null);
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

  useEffect(() => {
    if (!user) return;
    loadReviewerForwardedDocs(user.id);
    loadAuthors();
  }, [user]);

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

  const loadReviewerForwardedDocs = async (editorId: number) => {
    try {
      const res = await fetch(`/api/reviewer-forwarded-documents?editorId=${editorId}`, {
        headers: {
          'x-user-id': String(editorId),
          'x-user-role': 'editor',
        },
      });
      if (!res.ok) {
        setReviewerDocs([]);
        return;
      }
      const data = await res.json();
      setReviewerDocs((data.items || []) as ReviewerForwardedDoc[]);
    } catch (e) {
      console.error('Failed to load reviewer forwarded documents:', e);
      setReviewerDocs([]);
    }
  };

  const loadAuthors = async () => {
    try {
      const res = await fetch('/api/users?role=author');
      if (!res.ok) {
        setAuthors([]);
        return;
      }
      const data = await res.json();
      setAuthors((data.users || []) as AuthorUser[]);
    } catch (e) {
      console.error('Failed to load authors:', e);
      setAuthors([]);
    }
  };

  const sendToAuthor = async (doc: ReviewerForwardedDoc) => {
    if (!user) return;
    const authorId = selectedAuthorByDoc[doc.id];
    if (!authorId) {
      alert('Please select an author first.');
      return;
    }

    setSendingDocId(doc.id);
    try {
      const res = await fetch('/api/editor-author-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(user.id),
          'x-user-role': 'editor',
        },
        body: JSON.stringify({
          reviewerForwardId: doc.id,
          authorId: authorId,
          comment: sendCommentByDoc[doc.id] || '',
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to send');
      }

      alert('Sent to author successfully.');
      setSendCommentByDoc((prev) => ({ ...prev, [doc.id]: '' }));
    } catch (e: any) {
      console.error('Failed to send to author:', e);
      alert(e?.message || 'Failed to send');
    } finally {
      setSendingDocId(null);
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
          rowKey: `author-article-${article.id}`,
          id: article.id,
          articleId: article.id,
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
              rowKey: `editor-article-${ea.id}`,
              id: ea.id,
              articleId: ea.article_id,
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
    type: 'new' | 'revision' | 'external_review' | 'author_reply' | 'reviewer_article' | 'author_article',
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
        {tabButton('Reviewer Article', 'reviewer_article', <Download className="w-4 h-4" />)}
        {tabButton('Author Article', 'author_article', <User className="w-4 h-4" />)}
      </div>

      {activeTab === 'reviewer_article' ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="text-lg font-semibold text-gray-900">Reviewer Article</div>
            <div className="text-sm text-gray-600 mt-1">Documents forwarded by reviewers (downloadable).</div>
          </div>

          {reviewerDocs.length === 0 ? (
            <div className="p-6 text-gray-600">No documents forwarded by reviewers yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviewer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reviewerDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{doc.article_title || `Article #${doc.article_id}`}</div>
                        {doc.attachment_name ? (
                          <div className="text-xs text-gray-500 mt-1 truncate">File: {doc.attachment_name}</div>
                        ) : null}
                        {doc.comment ? (
                          <div className="text-xs text-gray-600 mt-1 line-clamp-2">Comment: {doc.comment}</div>
                        ) : null}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{doc.reviewer_name || `#${doc.reviewer_id}`}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{doc.created_at ? new Date(doc.created_at).toLocaleString() : '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-end">
                          {doc.attachment_path ? (
                            <>
                              <a
                                href={doc.attachment_path}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                Open
                              </a>
                              <a
                                href={doc.attachment_path}
                                download
                                className="text-green-600 hover:text-green-700 text-sm font-medium"
                              >
                                Download
                              </a>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">No file</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      {activeTab === 'author_article' ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="text-lg font-semibold text-gray-900">Author Article</div>
            <div className="text-sm text-gray-600 mt-1">Select an author and send the reviewer document.</div>
          </div>

          {reviewerDocs.length === 0 ? (
            <div className="p-6 text-gray-600">No reviewer documents available to send.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Select Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comment</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reviewerDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{doc.article_title || `Article #${doc.article_id}`}</div>
                        {doc.attachment_name ? (
                          <div className="text-xs text-gray-500 mt-1 truncate">File: {doc.attachment_name}</div>
                        ) : null}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          className="form-input"
                          value={selectedAuthorByDoc[doc.id] ?? ''}
                          onChange={(e) => {
                            const v = e.target.value ? Number(e.target.value) : '';
                            setSelectedAuthorByDoc((prev) => ({ ...prev, [doc.id]: v }));
                          }}
                        >
                          <option value="">Select author</option>
                          {authors.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.full_name || a.username}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Comment (optional)"
                          value={sendCommentByDoc[doc.id] ?? ''}
                          onChange={(e) => setSendCommentByDoc((prev) => ({ ...prev, [doc.id]: e.target.value }))}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-end">
                          {doc.attachment_path ? (
                            <a
                              href={doc.attachment_path}
                              download
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Download
                            </a>
                          ) : null}
                          <button
                            type="button"
                            className="text-green-600 hover:text-green-700 text-sm font-medium disabled:text-gray-400"
                            disabled={sendingDocId === doc.id}
                            onClick={() => sendToAuthor(doc)}
                          >
                            {sendingDocId === doc.id ? 'Sending...' : 'Send'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      {/* Table */}
      {activeTab === 'reviewer_article' || activeTab === 'author_article' ? null : (
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
                <tr key={s.rowKey} className="hover:bg-gray-50">
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
                          const selected = { ...s, id: s.articleId };
                          sessionStorage.setItem('selectedSubmission', JSON.stringify(selected));
                          router.push(`/dashboard/editor/article-management/${s.articleId}`);
                        }}
                        className="text-blue-600 hover:text-blue-700 flex items-center text-sm font-medium"
                      >
                        Reply <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
                      <button
                        onClick={() => {
                          console.log('Forward clicked for submission:', s);
                          const selected = { ...s, id: s.articleId };
                          sessionStorage.setItem('selectedSubmission', JSON.stringify(selected));
                          setForwardChoiceSubmission(selected);
                          setForwardChoiceOpen(true);
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
      )}

      {forwardChoiceOpen && forwardChoiceSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md shadow-lg border border-gray-200">
            <div className="p-5 border-b border-gray-200 flex items-start justify-between">
              <div>
                <div className="text-lg font-semibold text-gray-900">Forward Article</div>
                <div className="text-sm text-gray-600 mt-1 line-clamp-2">{forwardChoiceSubmission.title}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setForwardChoiceOpen(false);
                  setForwardChoiceSubmission(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="p-5 space-y-3">
              <button
                type="button"
                onClick={() => {
                  setForwardChoiceOpen(false);
                  const articleId = forwardChoiceSubmission.articleId;
                  router.push(`/dashboard/editor/article-management/forward?article=${articleId}`);
                }}
                className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Forward to Reviewer
              </button>

              <button
                type="button"
                onClick={() => {
                  setForwardChoiceOpen(false);
                  const articleId = forwardChoiceSubmission.articleId;
                  // Reuse existing Reply-to-Author page so author receives it on /reviewed
                  router.push(`/dashboard/editor/article-management/${articleId}`);
                }}
                className="w-full px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                Forward to Author
              </button>

              <button
                type="button"
                onClick={() => {
                  setForwardChoiceOpen(false);
                  setForwardChoiceSubmission(null);
                }}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ArticleManagementPage;
