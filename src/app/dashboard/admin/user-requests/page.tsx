'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Check, X, Clock, User, Mail, Shield } from 'lucide-react';
import { useConfirmDialog } from '@/contexts/ConfirmDialogContext';
import { showNotification } from '@/utils/notifications';

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
  email?: string;
  created_at?: string;
}

const UserRequestsPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<Partial<User & { password?: string }>>({});
  const router = useRouter();
  const confirm = useConfirmDialog();

  useEffect(() => {
    checkAuth();
    loadRequests();
    setupNotifications();
  }, []);

  const setupNotifications = () => {
    // Listen for new request notifications
    if ('BroadcastChannel' in window) {
      const adminChannel = new BroadcastChannel('admin_notifications');
      adminChannel.onmessage = (event) => {
        const { type, request } = event.data;
        if (type === 'new_request') {
          setNotifications(prev => [
            `New ${request.role} request from ${request.username}`,
            ...prev.slice(0, 4) // Keep only last 5 notifications
          ]);
          loadRequests(); // Refresh the requests list
        }
      };

      return () => {
        adminChannel.close();
      };
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.user.role !== 'administrator') {
          router.push('/');
          return;
        }
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        // Filter to show only authors and reviewers
        const filteredUsers = data.users.filter((user: any) => 
          user.role === 'author' || user.role === 'reviewer'
        );
        setRequests(filteredUsers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleRequestAction = async (userId: number, action: 'edit' | 'delete') => {
    if (action === 'delete') {
      const ok = await confirm({
        title: 'Delete this user?',
        message: 'Are you sure you want to delete this user? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        danger: true,
      });
      if (!ok) return;
    }

    try {
      if (action === 'delete') {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          showNotification.success('User deleted successfully!');
          loadRequests();
        } else {
          const error = await response.json();
          showNotification.error(`Failed to delete user: ${error.error}`);
        }
      } else if (action === 'edit') {
        const userToEdit = requests.find(user => user.id === userId);
        if (userToEdit) {
          setEditingUser(userToEdit);
          setEditForm({
            username: userToEdit.username,
            full_name: userToEdit.full_name || '',
            email: userToEdit.email || '',
            role: userToEdit.role
          });
          setIsEditModalOpen(true);
        }
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification.error('Failed to update user.');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        showNotification.success('User updated successfully!');
        setIsEditModalOpen(false);
        setEditingUser(null);
        setEditForm({});
        loadRequests(); // Reload users to reflect changes
      } else {
        const error = await response.json();
        showNotification.error(`Failed to update user: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification.error('Failed to update user.');
    }
  };

  const handleEditInputChange = (field: keyof User | 'password', value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const getStatusIcon = (role: string) => {
    switch (role) {
      case 'author':
        return <Check className="w-4 h-4 text-blue-500" />;
      case 'reviewer':
        return <Check className="w-4 h-4 text-purple-500" />;
      case 'editor':
        return <Check className="w-4 h-4 text-orange-500" />;
      case 'administrator':
        return <Check className="w-4 h-4 text-red-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (role: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (role) {
      case 'author':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'reviewer':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'editor':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'administrator':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-academic-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-academic-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-academic-900 font-serif">Authors & Reviewers Management</h1>
            <p className="text-academic-600 mt-2">
              View and manage all authors and reviewers in the system.
            </p>
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 bg-white rounded-lg shadow-sm border border-academic-200 hover:bg-academic-50 transition-colors"
            >
              <svg className="w-6 h-6 text-academic-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H6.5A2.5 2.5 0 014 16.5v-9A2.5 2.5 0 016.5 5h11A2.5 2.5 0 0120 7.5v3.5" />
              </svg>
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-academic-200 z-50">
                <div className="p-4 border-b border-academic-200">
                  <h3 className="font-semibold text-academic-900">Recent Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                      <div key={index} className="p-3 border-b border-academic-100 last:border-b-0 hover:bg-academic-50">
                        <p className="text-sm text-academic-700">{notification}</p>
                        <p className="text-xs text-academic-500 mt-1">Just now</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-academic-500">
                      <p className="text-sm">No notifications yet</p>
                    </div>
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-academic-200">
                    <button
                      onClick={() => setNotifications([])}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
            <div className="flex items-center">
              <User className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-academic-600">Total Authors</p>
                <p className="text-2xl font-bold text-academic-900">
                  {requests.filter(r => r.role === 'author').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
            <div className="flex items-center">
              <User className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-academic-600">Total Reviewers</p>
                <p className="text-2xl font-bold text-academic-900">
                  {requests.filter(r => r.role === 'reviewer').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
            <div className="flex items-center">
              <User className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-academic-600">Total Users</p>
                <p className="text-2xl font-bold text-academic-900">
                  {requests.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Cards */}
        <div className="space-y-6">
          {requests.map((user) => (
            <div key={user.id} className="bg-white rounded-lg shadow-sm border border-academic-200 overflow-hidden">
              {/* Header */}
              <div className="bg-academic-50 px-6 py-4 border-b border-academic-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="w-8 h-8 text-academic-500" />
                    <div>
                      <h3 className="text-lg font-semibold text-academic-900">
                        {user.full_name || user.username}
                      </h3>
                      <p className="text-sm text-academic-600">
                        Joined on {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(user.role)}
                    <span className={getStatusBadge(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* User Information */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-academic-700 uppercase tracking-wider border-b border-academic-200 pb-2">
                      User Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-academic-500 uppercase">Username</label>
                        <p className="text-sm text-academic-900 font-medium">{user.username}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-academic-500 uppercase">Full Name</label>
                        <p className="text-sm text-academic-900">{user.full_name || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-academic-500 uppercase">Email</label>
                        <p className="text-sm text-academic-900 flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-academic-400" />
                          {user.email || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Role Information */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-academic-700 uppercase tracking-wider border-b border-academic-200 pb-2">
                      Role Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-academic-500 uppercase">Current Role</label>
                        <p className="text-sm text-academic-900 flex items-center">
                          <Shield className="w-4 h-4 mr-2 text-academic-400" />
                          <span className="capitalize font-medium">{user.role}</span>
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-academic-500 uppercase">User ID</label>
                        <p className="text-sm text-academic-900 font-mono">#{user.id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-6 border-t border-academic-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-academic-600">
                      Manage this user account:
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleRequestAction(user.id, 'edit')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Edit User
                      </button>
                      <button
                        onClick={() => handleRequestAction(user.id, 'delete')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Delete User
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
          
        {requests.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-12 text-center">
            <User className="w-12 h-12 text-academic-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-academic-900 mb-2">No authors or reviewers found</h3>
            <p className="text-academic-500">
              Authors and reviewers will appear here when they register.
            </p>
          </div>
        )}

        {/* Edit User Modal */}
        {isEditModalOpen && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-academic-900 mb-4">Edit User</h3>
              
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-academic-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={editForm.username || ''}
                    onChange={(e) => handleEditInputChange('username', e.target.value)}
                    className="w-full px-3 py-2 border border-academic-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-academic-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.full_name || ''}
                    onChange={(e) => handleEditInputChange('full_name', e.target.value)}
                    className="w-full px-3 py-2 border border-academic-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-academic-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => handleEditInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-academic-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-academic-700 mb-1">Role</label>
                  <select
                    value={editForm.role || ''}
                    onChange={(e) => handleEditInputChange('role', e.target.value)}
                    className="w-full px-3 py-2 border border-academic-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="author">Author</option>
                    <option value="reviewer">Reviewer</option>
                    <option value="editor">Editor</option>
                    <option value="administrator">Administrator</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-academic-700 mb-1">New Password (leave empty to keep current)</label>
                  <input
                    type="password"
                    value={editForm.password || ''}
                    onChange={(e) => handleEditInputChange('password', e.target.value)}
                    placeholder="Enter new password (optional)"
                    className="w-full px-3 py-2 border border-academic-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-academic-500 mt-1">Leave empty if you don&apos;t want to change the password</p>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingUser(null);
                      setEditForm({});
                    }}
                    className="px-4 py-2 text-academic-700 bg-academic-200 rounded-md hover:bg-academic-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Update User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserRequestsPage;
