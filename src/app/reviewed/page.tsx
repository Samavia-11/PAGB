'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { FileText, MessageSquare, Calendar, User, Eye, Download } from 'lucide-react';

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
  email?: string;
}

interface ReviewedArticle {
  id: number | string; // Allow both number and string for fallback articles
  originalId?: number; // Optional original ID for fallback articles
  title: string;
  abstract: string;
  status: 'draft' | 'submitted' | 'under_review' | 'reviewed' | 'editor_review' | 'accepted' | 'published' | 'rejected';
  submission_date: string;
  last_updated: string;
  keywords?: string;
  content?: string;
  authors?: any[];
  affiliation?: string;
  articleType?: string;
  editorComments?: string;
  reviewerComments?: string;
  reviewedBy?: string;
  reviewedDate?: string;
  manuscriptFile?: File | null;
  manuscriptFileName?: string;
  editorAttachment?: string;
  editorAttachmentName?: string;
}

interface EditorAuthorDocument {
  id: number;
  article_id: number;
  editor_id: number;
  author_id: number;
  comment: string | null;
  attachment_name: string | null;
  attachment_path: string | null;
  created_at: string;
  editor_name?: string | null;
  author_name?: string | null;
  article_title?: string | null;
  article_abstract?: string | null;
}

type ArticleMessage = {
  id: number;
  article_id: number;
  sender_id: number;
  sender_name: string;
  sender_role: 'author' | 'reviewer' | 'editor' | 'administrator' | string;
  message: string | null;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  created_at: string;
};

type DbArticle = {
  id: number;
  title: string;
  abstract: string;
  status: ReviewedArticle['status'];
  submission_date: string;
  last_updated: string;
  keywords?: string | null;
  content?: string | null;
  authors?: any[] | null;
  affiliation?: string | null;
  article_type?: string | null;
  manuscript_file_name?: string | null;
};

const storageKeyForUser = (userId: number) => `articles:${userId}`;

const readArticlesFromStorage = (userId: number): ReviewedArticle[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKeyForUser(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ReviewedArticle[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function ReviewedPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [reviewedArticles, setReviewedArticles] = useState<ReviewedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<ReviewedArticle | null>(null);
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [forwardArticle, setForwardArticle] = useState<ReviewedArticle | null>(null);
  const [forwardComment, setForwardComment] = useState('');
  const [forwardFile, setForwardFile] = useState<File | null>(null);
  const [sendingForward, setSendingForward] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        
        if (!response.ok) {
          console.error('Auth response not OK:', response.status);
          router.push('/login');
          return;
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Response is not JSON:', contentType);
          router.push('/login');
          return;
        }

        const data = await response.json();
        if (!data.user) {
          console.error('No user in response');
          router.push('/login');
          return;
        }
        
        if (data.user.role !== 'author') {
          console.error('User not author:', data.user.role);
          router.push('/login');
          return;
        }
        
        setUser(data.user);
        loadReviewedArticles(data.user.id);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const loadReviewedArticles = async (userId: number) => {
    try {
      let articles: ReviewedArticle[] = [];

      // Prefer DB as source of truth (localStorage can be empty/outdated)
      try {
        const res = await fetch('/api/articles', {
          headers: {
            'x-user-id': String(userId),
            'x-user-role': 'author',
          },
        });
        if (res.ok) {
          const data = await res.json();
          const dbArticles = (data.articles || []) as DbArticle[];
          articles = dbArticles.map((a) => ({
            id: a.id,
            title: a.title,
            abstract: a.abstract,
            status: a.status,
            submission_date: a.submission_date,
            last_updated: a.last_updated,
            keywords: a.keywords || undefined,
            content: a.content || undefined,
            authors: a.authors || undefined,
            affiliation: a.affiliation || undefined,
            articleType: a.article_type || undefined,
            manuscriptFileName: a.manuscript_file_name || undefined,
          }));
        } else {
          console.warn('Failed to fetch /api/articles for author:', res.status);
        }
      } catch (e) {
        console.error('Error fetching /api/articles for author:', e);
      }

      // Fallback: localStorage (demo/offline mode)
      if (articles.length === 0) {
        articles = readArticlesFromStorage(userId);
      }

      console.log('All articles for user:', articles);
      
      // Check for articles that have been reviewed by editors or have any review activity
      let reviewed = articles.filter(article => {
        const hasReviewStatus = ['reviewed', 'editor_review', 'accepted', 'rejected'].includes(article.status);
        const hasEditorComments = article.editorComments && article.editorComments.trim() !== '';
        const hasReviewerComments = article.reviewerComments && article.reviewerComments.trim() !== '';
        const hasReviewedDate = article.reviewedDate;
        
        const isReviewed = hasReviewStatus || hasEditorComments || hasReviewerComments || hasReviewedDate;
        
        console.log(`Article ${article.id}:`, {
          status: article.status,
          hasReviewStatus,
          hasEditorComments,
          hasReviewerComments,
          hasReviewedDate,
          isReviewed
        });
        
        return isReviewed;
      });

      // Load editor->author forwarded documents from DB (these are not stored in localStorage)
      try {
        const res = await fetch(`/api/editor-author-documents?authorId=${userId}`, {
          headers: {
            'x-user-id': String(userId),
            'x-user-role': 'author',
          },
        });

        if (res.ok) {
          const data = await res.json();
          const docs = (data.items || []) as EditorAuthorDocument[];

          const docArticles: ReviewedArticle[] = docs.map((d) => ({
            id: `ead_${d.id}`,
            originalId: d.article_id,
            title: d.article_title || `Article ${d.article_id}`,
            abstract: d.article_abstract || 'Article abstract not available',
            status: 'editor_review',
            submission_date: d.created_at,
            last_updated: d.created_at,
            editorComments: d.comment || undefined,
            reviewedBy: d.editor_name || 'Editor',
            reviewedDate: d.created_at,
            editorAttachment: d.attachment_path || undefined,
            editorAttachmentName: d.attachment_name || undefined,
            manuscriptFileName: 'manuscript.docx',
          }));

          // Merge into reviewed list (prefer enriching an existing article with same originalId)
          docArticles.forEach((docArticle) => {
            const matchIndex = reviewed.findIndex((a) => {
              const aOriginalId = typeof a.id === 'number' ? a.id : a.originalId;
              return aOriginalId && docArticle.originalId && aOriginalId === docArticle.originalId;
            });

            if (matchIndex >= 0) {
              const existing = reviewed[matchIndex];
              reviewed[matchIndex] = {
                ...existing,
                status: existing.status === 'submitted' ? 'editor_review' : existing.status,
                editorComments: existing.editorComments || docArticle.editorComments,
                editorAttachment: existing.editorAttachment || docArticle.editorAttachment,
                editorAttachmentName: existing.editorAttachmentName || docArticle.editorAttachmentName,
                reviewedBy: existing.reviewedBy || docArticle.reviewedBy,
                reviewedDate: existing.reviewedDate || docArticle.reviewedDate,
                last_updated: existing.last_updated || docArticle.last_updated,
              };
            } else {
              reviewed.push(docArticle);
            }
          });
        } else {
          console.warn('Failed to fetch editor_author_documents:', res.status);
        }
      } catch (e) {
        console.error('Error fetching editor_author_documents:', e);
      }
      
      // Fallback: Check if there are any author replies that aren't showing up
      const authorReplies = JSON.parse(localStorage.getItem('authorReplies') || '[]') as {id:number,reply:string,articleId:number}[];
      console.log('Author replies found:', authorReplies);
      
      // If no articles found but there are replies, create mock articles from replies
      if (reviewed.length === 0 && authorReplies.length > 0) {
        console.log('Creating articles from author replies as fallback');
        reviewed = authorReplies
          .filter(reply => !reviewed.some(article => article.id === reply.articleId)) // Avoid duplicates
          .map((reply, index) => ({
            id: `reply_${reply.articleId}_${index}`, // Unique key
            originalId: reply.articleId, // Keep original ID for reference
            title: `Article ${reply.articleId}`,
            abstract: 'Article abstract not available',
            status: 'editor_review' as const,
            submission_date: new Date().toISOString(),
            last_updated: new Date().toISOString(),
            editorComments: reply.reply,
            reviewedBy: 'Editor',
            reviewedDate: new Date().toISOString(),
            manuscriptFileName: 'manuscript.docx', // Add default manuscript file
          }));
      }
      
      console.log('Final reviewed articles:', reviewed);

      const getNumericArticleId = (a: ReviewedArticle): number | null => {
        if (typeof a.id === 'number') return a.id;
        if (typeof a.originalId === 'number') return a.originalId;
        return null;
      };

      const hydrateWithMessages = async (items: ReviewedArticle[]) => {
        const enriched = await Promise.all(
          items.map(async (a) => {
            const numericId = getNumericArticleId(a);
            if (!numericId) return a;

            try {
              const res = await fetch(`/api/articles/${numericId}/comments`);
              if (!res.ok) return a;

              const data = await res.json();
              const messages = (data?.messages || []) as ArticleMessage[];
              if (!Array.isArray(messages) || messages.length === 0) return a;

              const lastEditor = [...messages].reverse().find((m) => m.sender_role === 'editor');
              const lastReviewer = [...messages].reverse().find((m) => m.sender_role === 'reviewer');

              const next: ReviewedArticle = { ...a };

              if (!next.editorComments && lastEditor?.message) {
                next.editorComments = lastEditor.message;
              }

              if (!next.reviewerComments && lastReviewer?.message) {
                next.reviewerComments = lastReviewer.message;
              }

              if (!next.reviewedBy && lastEditor?.sender_name) {
                next.reviewedBy = lastEditor.sender_name;
              }

              if (!next.reviewedDate && lastEditor?.created_at) {
                next.reviewedDate = lastEditor.created_at;
              }

              if (!next.editorAttachment && lastEditor?.file_url) {
                next.editorAttachment = lastEditor.file_url;
              }

              if (!next.editorAttachmentName && lastEditor?.file_name) {
                next.editorAttachmentName = lastEditor.file_name;
              }

              return next;
            } catch (e) {
              console.error('Error fetching article messages:', e);
              return a;
            }
          })
        );

        return enriched;
      };

      const enrichedReviewed = await hydrateWithMessages(reviewed);
      setReviewedArticles(enrichedReviewed);
    } catch (error) {
      console.error('Error loading reviewed articles:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      reviewed: 'bg-purple-500',
      editor_review: 'bg-orange-500',
      accepted: 'bg-green-500',
      rejected: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      reviewed: 'Reviewed',
      editor_review: 'Editor Review',
      accepted: 'Accepted',
      rejected: 'Rejected'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <Layout user={user}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading reviewed articles...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Reviewed Articles</h1>

        {/* Debug Section */}
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Info</h3>
          <p className="text-sm">User ID: {user?.id}</p>
          <p className="text-sm">Total Articles: {reviewedArticles.length}</p>
          <div className="flex gap-2 mt-2">
            <button 
              onClick={() => {
                const allArticles = readArticlesFromStorage(user?.id || 0);
                console.log('All articles:', allArticles);
                alert(`Found ${allArticles.length} total articles. Check console for details.`);
              }}
              className="text-sm bg-blue-500 text-white px-2 py-1 rounded"
            >
              Check Storage
            </button>
            <button 
              onClick={() => {
                const authorReplies = JSON.parse(localStorage.getItem('authorReplies') || '[]');
                console.log('Author replies:', authorReplies);
                alert(`Found ${authorReplies.length} author replies. Check console for details.`);
              }}
              className="text-sm bg-green-500 text-white px-2 py-1 rounded"
            >
              Check Replies
            </button>
            <button 
              onClick={() => {
                const editorSubmissions = JSON.parse(localStorage.getItem('editor_submissions') || '[]');
                console.log('Editor submissions:', editorSubmissions);
                alert(`Found ${editorSubmissions.length} editor submissions. Check console for details.`);
              }}
              className="text-sm bg-purple-500 text-white px-2 py-1 rounded"
            >
              Check Editor
            </button>
          </div>
        </div>

        {reviewedArticles.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No reviewed articles found</h2>
            <p className="text-gray-500">Your articles will appear here after they have been reviewed by editors.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {reviewedArticles.map((article) => (
              <div key={article.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                    <p className="text-gray-600 mb-2 line-clamp-3">
                      {article.abstract || 'No abstract available'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Submitted: {new Date(article.submission_date).toLocaleDateString()}
                      </span>
                      {article.reviewedDate && (
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Reviewed: {new Date(article.reviewedDate).toLocaleDateString()}
                        </span>
                      )}
                      {article.reviewedBy && (
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          Reviewed by: {article.reviewedBy}
                        </span>
                      )}
                    </div>
                    {article.keywords && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500">Keywords: </span>
                        <span className="text-sm text-gray-700">{article.keywords}</span>
                      </div>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs text-white ${getStatusColor(article.status)}`}>
                    {getStatusText(article.status)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setForwardArticle(article);
                      setForwardComment('');
                      setForwardFile(null);
                      setForwardModalOpen(true);
                    }}
                    className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Forward
                  </button>
                </div>

                {/* Files Section */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center mb-2">
                    <FileText className="w-5 h-5 mr-2 text-green-600" />
                    <h4 className="font-semibold">Files & Documents</h4>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Always show manuscript file section */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-800">Your Manuscript</p>
                        <p className="text-xs text-gray-500">{article.manuscriptFileName || 'manuscript.docx'}</p>
                      </div>
                      <button
                        onClick={() => {
                          // Create a dummy download for demo
                          const blob = new Blob(['Sample manuscript content for ' + (article.title || 'Article')], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = article.manuscriptFileName || 'manuscript.docx';
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          window.URL.revokeObjectURL(url);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Download
                      </button>
                    </div>
                    
                    {/* Show editor attachment if available */}
                    {article.editorAttachmentName && (
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-green-800">Editor's Attachment</p>
                          <p className="text-xs text-green-600">{article.editorAttachmentName}</p>
                        </div>
                        {article.editorAttachment ? (
                          <a
                            href={article.editorAttachment}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                          >
                            Download
                          </a>
                        ) : (
                          <button
                            onClick={() => {
                              const blob = new Blob(['Sample editor feedback document'], { type: 'text/plain' });
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = article.editorAttachmentName || 'editor-feedback.txt';
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              window.URL.revokeObjectURL(url);
                            }}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                          >
                            Download
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Comments Section */}
                {(article.editorComments || article.reviewerComments) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center mb-2">
                      <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                      <h4 className="font-semibold">Comments & Feedback</h4>
                    </div>
                    
                    {article.reviewerComments && (
                      <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-800 mb-1">Reviewer Comments:</p>
                        <p className="text-sm text-gray-700">{article.reviewerComments}</p>
                      </div>
                    )}
                    
                    {article.editorComments && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-800 mb-1">Editor Comments:</p>
                        <p className="text-sm text-gray-700">{article.editorComments}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setSelectedArticle(article)}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {forwardModalOpen && forwardArticle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold">Forward to Editor</h2>
                  <button
                    onClick={() => {
                      if (sendingForward) return;
                      setForwardModalOpen(false);
                      setForwardArticle(null);
                      setForwardComment('');
                      setForwardFile(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-600">Article</div>
                  <div className="text-sm font-semibold text-gray-900">{forwardArticle.title}</div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                  <textarea
                    rows={6}
                    value={forwardComment}
                    onChange={(e) => setForwardComment(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Write comment and send to editor"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attach Revised File (optional)</label>
                  <input
                    type="file"
                    className="block w-full text-sm text-gray-700"
                    onChange={(e) => setForwardFile(e.target.files?.[0] || null)}
                    disabled={sendingForward}
                  />
                  {forwardFile ? <div className="text-xs text-gray-600 mt-1">Selected: {forwardFile.name}</div> : null}
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    disabled={sendingForward}
                    onClick={() => {
                      setForwardModalOpen(false);
                      setForwardArticle(null);
                      setForwardComment('');
                      setForwardFile(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    disabled={sendingForward || (!forwardComment.trim() && !forwardFile)}
                    onClick={async () => {
                      if (!user) return;

                      const numericId = typeof forwardArticle.id === 'number' ? forwardArticle.id : forwardArticle.originalId;
                      if (!numericId) {
                        alert('Invalid article.');
                        return;
                      }

                      setSendingForward(true);
                      try {
                        const formData = new FormData();
                        formData.append('message', forwardComment.trim());
                        formData.append('sender_id', String(user.id));
                        formData.append('sender_role', 'author');
                        if (forwardFile) {
                          formData.append('file', forwardFile);
                        }

                        const msgRes = await fetch(`/api/articles/${numericId}/comments`, {
                          method: 'POST',
                          body: formData,
                        });

                        if (!msgRes.ok) {
                          const err = await msgRes.json().catch(() => ({}));
                          throw new Error(err?.error || 'Failed to send message');
                        }

                        const statusRes = await fetch('/api/articles', {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ id: numericId, status: 'editor_review' }),
                        });

                        if (!statusRes.ok) {
                          const err = await statusRes.json().catch(() => ({}));
                          throw new Error(err?.error || 'Failed to update status');
                        }

                        // Update local storage copy so UI stays consistent
                        const storageKey = storageKeyForUser(user.id);
                        const all = readArticlesFromStorage(user.id);
                        const updated = all.map((a) =>
                          a.id === numericId
                            ? {
                                ...a,
                                status: 'editor_review',
                                last_updated: new Date().toISOString(),
                              }
                            : a
                        );
                        localStorage.setItem(storageKey, JSON.stringify(updated));

                        loadReviewedArticles(user.id);
                        alert('Sent to editor successfully.');
                        setForwardModalOpen(false);
                        setForwardArticle(null);
                        setForwardComment('');
                        setForwardFile(null);
                      } catch (e: any) {
                        console.error('Forward to editor error:', e);
                        alert(e?.message || 'Failed to send');
                      } finally {
                        setSendingForward(false);
                      }
                    }}
                  >
                    {sendingForward ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {selectedArticle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">{selectedArticle.title}</h2>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Abstract</h3>
                    <p className="text-gray-700">{selectedArticle.abstract}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Article Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs text-white ${getStatusColor(selectedArticle.status)}`}>
                          {getStatusText(selectedArticle.status)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Article Type:</span>
                        <span className="ml-2">{selectedArticle.articleType || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="font-medium">Submission Date:</span>
                        <span className="ml-2">{new Date(selectedArticle.submission_date).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="font-medium">Last Updated:</span>
                        <span className="ml-2">{new Date(selectedArticle.last_updated).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {selectedArticle.keywords && (
                    <div>
                      <h3 className="font-semibold mb-2">Keywords</h3>
                      <p className="text-gray-700">{selectedArticle.keywords}</p>
                    </div>
                  )}

                  {(selectedArticle.editorComments || selectedArticle.reviewerComments) && (
                    <div>
                      <h3 className="font-semibold mb-2">Review Comments</h3>
                      {selectedArticle.reviewerComments && (
                        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-800 mb-1">Reviewer Comments:</p>
                          <p className="text-sm text-gray-700">{selectedArticle.reviewerComments}</p>
                        </div>
                      )}
                      {selectedArticle.editorComments && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm font-medium text-green-800 mb-1">Editor Comments:</p>
                          <p className="text-sm text-gray-700">{selectedArticle.editorComments}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
