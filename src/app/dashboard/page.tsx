'use client';

import { useState, useEffect } from 'react';
import { Bell, FileText, CheckCircle, XCircle, Clock, Send } from 'lucide-react';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

interface Article {
  id: number;
  title: string;
  author_name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchNotifications(parsedUser.id);
      fetchArticles(parsedUser.id, parsedUser.role);
    }
  }, []);

  const fetchNotifications = async (userId: number) => {
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'x-user-id': userId.toString() }
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.notifications?.filter((n: Notification) => !n.is_read).length || 0);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const fetchArticles = async (userId: number, role: string) => {
    try {
      const res = await fetch('/api/articles', {
        headers: {
          'x-user-id': userId.toString(),
          'x-user-role': role
        }
      });
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error('Failed to fetch articles');
    }
  };

  const markAsRead = async (id: number) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => prev - 1);
  };

  const handleWorkflowAction = async (articleId: number, action: string, toUserId?: number) => {
    try {
      await fetch(`/api/articles/${articleId}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          from_user_id: user.id,
          to_user_id: toUserId,
          from_role: user.role,
          to_role: toUserId ? 'assistant_editor' : null
        })
      });
      fetchArticles(user.id, user.role);
      alert('Action completed successfully');
    } catch (error) {
      alert('Action failed');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500',
      submitted: 'bg-blue-500',
      under_review: 'bg-yellow-500',
      with_editor: 'bg-purple-500',
      published: 'bg-green-500',
      rejected: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Login</h2>
          <a href="/login" className="text-blue-600 hover:underline">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">PAGB Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold">{user.fullName}</p>
              <p className="text-sm capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Articles */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Articles
              </h2>
              <div className="space-y-4">
                {articles.map(article => (
                  <div key={article.id} className="border-b pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold">{article.title}</h3>
                        <p className="text-sm text-gray-600">by {article.author_name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Updated: {new Date(article.updated_at).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded text-white text-sm ${getStatusColor(article.status)}`}>
                        {article.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    {/* Workflow Actions */}
                    <div className="mt-3 flex gap-2">
                      {user.role === 'author' && article.status === 'draft' && (
                        <button
                          onClick={() => handleWorkflowAction(article.id, 'submit')}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          <Send className="w-4 h-4 inline mr-1" />
                          Submit
                        </button>
                      )}
                      
                      {(user.role === 'editor_in_chief' || user.role === 'assistant_editor') && article.status === 'submitted' && (
                        <button
                          onClick={() => handleWorkflowAction(article.id, 'assign_assistant_editor', 5)}
                          className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                        >
                          Assign to Editor
                        </button>
                      )}
                      
                      {(user.role === 'editor_in_chief' || user.role === 'patron') && article.status === 'with_editor' && (
                        <>
                          <button
                            onClick={() => handleWorkflowAction(article.id, 'publish')}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 inline mr-1" />
                            Publish
                          </button>
                          <button
                            onClick={() => handleWorkflowAction(article.id, 'reject')}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            <XCircle className="w-4 h-4 inline mr-1" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Notifications */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notifications
              </h2>
              <div className="space-y-3">
                {notifications.slice(0, 10).map(notif => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded border ${notif.is_read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}
                    onClick={() => !notif.is_read && markAsRead(notif.id)}
                  >
                    <h4 className="font-semibold text-sm">{notif.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notif.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
