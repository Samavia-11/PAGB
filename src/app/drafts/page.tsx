'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { FileText, Edit, Trash2, Eye, Plus } from 'lucide-react';
import { useConfirmDialog } from '@/contexts/ConfirmDialogContext';

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
  email?: string;
}

interface StoredArticle {
  id: number;
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
}

const storageKeyForUser = (userId: number) => `articles:${userId}`;

const readArticlesFromStorage = (userId: number): StoredArticle[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKeyForUser(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredArticle[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const deleteArticleFromStorage = (userId: number, articleId: number) => {
  if (typeof window === 'undefined') return;
  try {
    const articles = readArticlesFromStorage(userId);
    const updatedArticles = articles.filter(article => article.id !== articleId);
    localStorage.setItem(storageKeyForUser(userId), JSON.stringify(updatedArticles));
  } catch (error) {
    console.error('Error deleting article:', error);
  }
};

export default function DraftsPage() {
  const router = useRouter();
  const confirm = useConfirmDialog();
  const [user, setUser] = useState<User | null>(null);
  const [drafts, setDrafts] = useState<StoredArticle[]>([]);
  const [loading, setLoading] = useState(true);

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
        loadDrafts(data.user.id);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const loadDrafts = (userId: number) => {
    try {
      const articles = readArticlesFromStorage(userId);
      const draftArticles = articles.filter(article => article.status === 'draft');
      setDrafts(draftArticles);
    } catch (error) {
      console.error('Error loading drafts:', error);
    }
  };

  const handleEdit = (articleId: number) => {
    router.push(`/submit-article?edit=${articleId}`);
  };

  const handleDelete = async (articleId: number) => {
    const ok = await confirm({
      title: 'Delete this draft?',
      message: 'Are you sure you want to delete this draft?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true,
    });
    if (!ok) return;

    if (user) {
      deleteArticleFromStorage(user.id, articleId);
      loadDrafts(user.id);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500',
      submitted: 'bg-blue-500',
      under_review: 'bg-yellow-500',
      reviewed: 'bg-purple-500',
      editor_review: 'bg-orange-500',
      accepted: 'bg-green-500',
      published: 'bg-green-600',
      rejected: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <Layout user={user}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading drafts...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Drafts</h1>
          <button
            onClick={() => router.push('/submit-article')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Article
          </button>
        </div>

        {drafts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No drafts found</h2>
            <p className="text-gray-500 mb-6">You haven't saved any drafts yet.</p>
            <button
              onClick={() => router.push('/submit-article')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Article
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {drafts.map((draft) => (
              <div key={draft.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{draft.title}</h3>
                    <p className="text-gray-600 mb-2 line-clamp-3">
                      {draft.abstract || 'No abstract available'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Created: {new Date(draft.submission_date).toLocaleDateString()}</span>
                      <span>Last updated: {new Date(draft.last_updated).toLocaleDateString()}</span>
                    </div>
                    {draft.keywords && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500">Keywords: </span>
                        <span className="text-sm text-gray-700">{draft.keywords}</span>
                      </div>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs text-white ${getStatusColor(draft.status)}`}>
                    {draft.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(draft.id)}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(draft.id)}
                    className="flex items-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
