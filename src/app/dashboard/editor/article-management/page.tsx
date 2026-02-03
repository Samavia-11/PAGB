'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useConfirmDialog } from '@/contexts/ConfirmDialogContext';
import { showNotification } from '@/utils/notifications';
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
  manuscriptFileName?: string;
  manuscriptFilePath?: string;
  affiliation?: string;
  articleType?: string;
  last_reply?: string;
  reviewerName?: string;
  reviewerDecision?: string;
  responseDate?: string;
  forwardSource?: 'article' | 'reviewer_doc';
  reviewerForwardId?: number;
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

interface AuthorReplyItem {
  message_id: number;
  article_id: number;
  sender_id: number;
  message: string | null;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  created_at: string;
  article_title: string | null;
  article_abstract: string | null;
  author_id: number | null;
  author_name: string | null;
  author_username: string | null;
}

const ArticleManagementPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState<'new' | 'revision' | 'external_review' | 'reviewer_article' | 'author_article'>('new');
  const [reviewerDocs, setReviewerDocs] = useState<ReviewerForwardedDoc[]>([]);
  const [authorReplies, setAuthorReplies] = useState<AuthorReplyItem[]>([]);
  const [authors, setAuthors] = useState<AuthorUser[]>([]);
  const [selectedAuthorByDoc, setSelectedAuthorByDoc] = useState<Record<number, number | ''>>({});
  const [sendCommentByDoc, setSendCommentByDoc] = useState<Record<number, string>>({});
  const [sendingDocId, setSendingDocId] = useState<number | null>(null);
  const [forwardedReviewerDocIds, setForwardedReviewerDocIds] = useState<Set<number>>(new Set());
  const [forwardedArticleIds, setForwardedArticleIds] = useState<Set<number>>(new Set());
  const [forwardChoiceOpen, setForwardChoiceOpen] = useState(false);
  const [forwardChoiceSubmission, setForwardChoiceSubmission] = useState<Submission | null>(null);
  const router = useRouter();
  const confirm = useConfirmDialog();

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
    loadReviewerDocForwardStatus(user.id);
  }, [user]);

  const loadReviewerDocForwardStatus = async (editorId: number) => {
    try {
      const [toAuthorRes, toAdminRes] = await Promise.all([
        fetch(`/api/editor-author-documents?editorId=${editorId}`, {
          headers: {
            'x-user-id': String(editorId),
            'x-user-role': 'editor',
          },
        }),
        fetch(`/api/editor-admin-documents?editorId=${editorId}`, {
          headers: {
            'x-user-id': String(editorId),
            'x-user-role': 'editor',
          },
        }),
      ]);

      const next = new Set<number>();

      if (toAuthorRes.ok) {
        const data = await toAuthorRes.json().catch(() => ({}));
        const items = Array.isArray(data?.items) ? data.items : [];
        for (const it of items) {
          const id = Number((it as any)?.reviewer_forward_id);
          if (Number.isFinite(id) && id > 0) next.add(id);
        }
      }

      if (toAdminRes.ok) {
        const data = await toAdminRes.json().catch(() => ({}));
        const items = Array.isArray(data?.items) ? data.items : [];
        for (const it of items) {
          const id = Number((it as any)?.reviewer_forward_id);
          if (Number.isFinite(id) && id > 0) next.add(id);
        }
      }

      setForwardedReviewerDocIds(next);
    } catch (e) {
      console.error('Failed to load reviewer-doc forward status:', e);
      setForwardedReviewerDocIds(new Set());
    }
  };

  useEffect(() => {
    if (!user) return;
    if (activeTab !== 'author_article') return;
    loadAuthorReplies(user.id);
  }, [user, activeTab]);

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

  const loadAuthorReplies = async (editorId: number) => {
    try {
      const res = await fetch('/api/author-replies', {
        headers: {
          'x-user-id': String(editorId),
          'x-user-role': 'editor',
        },
      });

      if (!res.ok) {
        setAuthorReplies([]);
        return;
      }

      const data = await res.json();
      setAuthorReplies((data.items || []) as AuthorReplyItem[]);
    } catch (e) {
      console.error('Failed to load author replies:', e);
      setAuthorReplies([]);
    }
  };

  const sendToAuthor = async (doc: ReviewerForwardedDoc) => {
    if (!user) return;
    const authorId = selectedAuthorByDoc[doc.id];
    if (!authorId) {
      showNotification.warning('Please select an author first.');
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

      showNotification.success('Sent to author successfully.');
      setSendCommentByDoc((prev) => ({ ...prev, [doc.id]: '' }));
    } catch (e: any) {
      console.error('Failed to send to author:', e);
      showNotification.error(e?.message || 'Failed to send');
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
          manuscriptFilePath: article.manuscript_file_path,
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
              manuscriptFileName: ea.manuscript_file_name || ea.attachment_name,
              manuscriptFilePath: ea.manuscript_file_path || ea.attachment_path,
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

        const nextForwardedArticleIds = new Set<number>();
        for (const f of forwardedArticles) {
          const aid = Number((f as any)?.articleId);
          if (Number.isFinite(aid) && aid > 0) nextForwardedArticleIds.add(aid);
        }
        setForwardedArticleIds(nextForwardedArticleIds);
        
        // Combine all articles
        const forwardedByArticleId = new Map<number, Submission>();
        for (const f of forwardedArticles) {
          if (typeof f?.articleId === 'number') {
            forwardedByArticleId.set(f.articleId, f);
          }
        }

        const dedupedBase = transformedSubmissions.filter((s: any) => {
          // If the article has been forwarded to a reviewer, show it only in External (Reviewers)
          // using the editor-forwarded record (which contains reviewer info).
          if (s?.status === 'external_review' && forwardedByArticleId.has(s.articleId)) return false;
          return true;
        });

        allSubmissions = [...dedupedBase, ...forwardedArticles];
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

      // Normalize row keys to guarantee uniqueness across merged sources
      const usedKeys = new Set<string>();
      const normalizedSubmissions = updatedSubmissions.map((sub, index) => {
        const baseKey = (sub.rowKey && String(sub.rowKey).trim())
          ? String(sub.rowKey)
          : `submission-${sub.articleId ?? sub.id}-${index}`;
        let key = baseKey;
        if (usedKeys.has(key)) {
          key = `${baseKey}-${index}`;
        }
        usedKeys.add(key);
        return { ...sub, rowKey: key };
      });
      
      console.log('Final submissions:', normalizedSubmissions);
      setSubmissions(normalizedSubmissions);
    } catch (error) {
      console.error('Error loading submissions:', error);
      // Fallback to localStorage
      const realSubmissions = JSON.parse(localStorage.getItem('editor_submissions') || '[]') as Submission[];
      const usedKeys = new Set<string>();
      const normalized = (realSubmissions || []).map((sub, index) => {
        const baseKey = (sub as any)?.rowKey && String((sub as any).rowKey).trim()
          ? String((sub as any).rowKey)
          : `editor-submission-${(sub as any)?.articleId ?? (sub as any)?.id ?? index}-${index}`;
        let key = baseKey;
        if (usedKeys.has(key)) {
          key = `${baseKey}-${index}`;
        }
        usedKeys.add(key);
        return { ...sub, rowKey: key } as Submission;
      });
      setSubmissions(normalized);
    }
  };

  const filtered = submissions.filter((s) => s.status === activeTab);
  console.log(`Active tab: ${activeTab}, Total submissions: ${submissions.length}, Filtered: ${filtered.length}`);
  console.log('Submissions by status:', submissions.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {}));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        Loading...
      </div>
    );
  }

  const tabButton = (
    label: string,
    type: 'new' | 'revision' | 'external_review' | 'reviewer_article' | 'author_article',
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
                              {doc.attachment_path.toLowerCase().endsWith('.pdf') ? (
                                <a
                                  href={doc.attachment_path}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                  Open
                                </a>
                              ) : null}
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
                          <button
                            type="button"
                            disabled={forwardedReviewerDocIds.has(doc.id)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => {
                              const selected: Submission = {
                                rowKey: `reviewer-doc-${doc.article_id}-${doc.id}`,
                                id: doc.article_id,
                                articleId: doc.article_id,
                                title: doc.article_title || `Article #${doc.article_id}`,
                                author_name: 'Author',
                                submitted_at: doc.created_at,
                                status: 'reviewer_article',
                                abstract: doc.article_abstract || undefined,
                                forwardSource: 'reviewer_doc',
                                reviewerForwardId: doc.id,
                              };
                              sessionStorage.setItem('selectedSubmission', JSON.stringify(selected));
                              setForwardChoiceSubmission(selected);
                              setForwardChoiceOpen(true);
                            }}
                          >
                            Forward
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

      {activeTab === 'author_article' ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="text-lg font-semibold text-gray-900">Author Article</div>
            <div className="text-sm text-gray-600 mt-1">Author revisions received and documents to send to authors.</div>
          </div>

          <div className="p-4 border-b border-gray-200">
            <div className="text-base font-semibold text-gray-900">Author Replies</div>
            <div className="text-sm text-gray-600 mt-1">Latest revision uploads from authors.</div>
          </div>

          {authorReplies.length === 0 ? (
            <div className="p-6 text-gray-600">No author replies yet.</div>
          ) : (
            <div className="overflow-x-auto border-b border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {authorReplies.map((r) => (
                    <tr key={`${r.article_id}-${r.message_id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{r.article_title || `Article #${r.article_id}`}</div>
                        {r.file_name ? (
                          <div className="text-xs text-gray-500 mt-1 truncate">File: {r.file_name}</div>
                        ) : null}
                        {r.message ? (
                          <div className="text-xs text-gray-600 mt-1 line-clamp-2">Comment: {r.message}</div>
                        ) : null}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{r.author_name || r.author_username || (r.author_id ? `#${r.author_id}` : '—')}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3 justify-end">
                          {r.file_url ? (
                            <>
                              {r.file_url.toLowerCase().endsWith('.pdf') ? (
                                <a
                                  href={r.file_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                  Open
                                </a>
                              ) : null}
                              <a
                                href={r.file_url}
                                download
                                className="text-green-600 hover:text-green-700 text-sm font-medium"
                              >
                                Download
                              </a>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">No file</span>
                          )}

                          <button
                            type="button"
                            disabled={forwardedArticleIds.has(r.article_id)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => {
                              const selected: Submission = {
                                rowKey: `author-reply-${r.article_id}-${r.message_id}`,
                                id: r.article_id,
                                articleId: r.article_id,
                                title: r.article_title || `Article #${r.article_id}`,
                                author_name: r.author_name || r.author_username || 'Author',
                                author_id: r.author_id ?? undefined,
                                submitted_at: r.created_at,
                                status: 'revision',
                                abstract: r.article_abstract || undefined,
                              };
                              sessionStorage.setItem('selectedSubmission', JSON.stringify(selected));
                              setForwardChoiceSubmission(selected);
                              setForwardChoiceOpen(true);
                            }}
                          >
                            Forward
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
                  Abstract
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Files
                </th>
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
                    <div className="max-w-xs max-h-20 overflow-y-auto">
                      <p className="break-words pr-2" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                        {s.abstract || '—'}
                      </p>
                    </div>
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
                    {s.manuscriptFilePath ? (
                      <div className="flex gap-3">
                        {s.manuscriptFilePath.toLowerCase().endsWith('.pdf') ? (
                          <a
                            href={s.manuscriptFilePath}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Open
                          </a>
                        ) : null}
                        <a
                          href={s.manuscriptFilePath}
                          download
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          Download
                        </a>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No file</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {activeTab !== 'revision' && (
                        <button
                          type="button"
                          disabled={activeTab === 'external_review' && (s.reviewerDecision || 'pending') === 'accepted'}
                          onClick={() => {
                            // Open existing forward modal (Forward to Reviewer / Forward to Author)
                            const selected = { ...s, id: s.articleId };
                            sessionStorage.setItem('selectedSubmission', JSON.stringify(selected));
                            setForwardChoiceSubmission(selected);
                            setForwardChoiceOpen(true);
                          }}
                          className="text-green-600 hover:text-green-700 flex items-center text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Forward <Send className="w-4 h-4 ml-1" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
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
                  if (forwardChoiceSubmission.forwardSource === 'reviewer_doc') {
                    const rid = forwardChoiceSubmission.reviewerForwardId;
                    router.push(`/dashboard/editor/article-management/forward-admin?reviewerForwardId=${rid}`);
                    return;
                  }
                  const articleId = forwardChoiceSubmission.articleId;
                  router.push(`/dashboard/editor/article-management/forward?article=${articleId}`);
                }}
                className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                {forwardChoiceSubmission.forwardSource === 'reviewer_doc' ? 'Forward to Admin' : 'Forward to Reviewer'}
              </button>

              {/* Only show Forward to Author button if NOT in external_review tab */}
              {activeTab !== 'external_review' && (
                <button
                  type="button"
                  onClick={() => {
                    setForwardChoiceOpen(false);
                    const articleId = forwardChoiceSubmission.articleId;
                    if (forwardChoiceSubmission.forwardSource === 'reviewer_doc') {
                      const reviewerForwardId = forwardChoiceSubmission.reviewerForwardId;
                      if (!reviewerForwardId) {
                        showNotification.error('Missing reviewer document. Please try again.');
                        return;
                      }
                      router.push(
                        `/dashboard/editor/article-management/forward-author?article=${articleId}&reviewerForwardId=${reviewerForwardId}`
                      );
                      return;
                    }

                    router.push(`/dashboard/editor/article-management/${articleId}`);
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  Forward to Author
                </button>
              )}

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
}

export default ArticleManagementPage;
