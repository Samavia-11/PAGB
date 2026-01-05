'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Check, X, Clock, User, Mail, Shield } from 'lucide-react';

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
  email?: string;
}

interface SignupRequest {
  id: number;
  username: string;
  email: string;
  role: string;
  password: string;
  confirmPassword: string;
  fatherName: string;
  cnic: string;
  contactNumber: string;
  qualification: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const UserRequestsPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<SignupRequest[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();

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

  const loadRequests = () => {
    const savedRequests = JSON.parse(localStorage.getItem('signup_requests') || '[]');
    // Sort requests: pending first (newest first), then approved/rejected (newest first)
    const sortedRequests = savedRequests.sort((a: any, b: any) => {
      // First sort by status priority: pending > approved/rejected
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (b.status === 'pending' && a.status !== 'pending') return 1;
      
      // Within same status group, sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setRequests(sortedRequests);
  };

  const handleRequestAction = async (requestId: number, action: 'approved' | 'rejected') => {
    try {
      const updatedRequests = requests.map(req => 
        req.id === requestId ? { ...req, status: action } : req
      );
      
      localStorage.setItem('signup_requests', JSON.stringify(updatedRequests));
      setRequests(updatedRequests);

      // Broadcast status update to login page
      if ('BroadcastChannel' in window) {
        const statusChannel = new BroadcastChannel('request_status_updates');
        statusChannel.postMessage({
          requestId: requestId,
          newStatus: action
        });
        statusChannel.close();
      }

      // Add notification
      const actionText = action === 'approved' ? 'approved' : 'rejected';
      const requestUser = requests.find(req => req.id === requestId);
      if (requestUser) {
        setNotifications(prev => [
          `Request ${actionText}: ${requestUser.username} (${requestUser.role})`,
          ...prev.slice(0, 4)
        ]);
      }

      // Log email notification (temporarily disabled API call to fix server error)
      const targetRequest = requests.find(req => req.id === requestId);
      if (targetRequest) {
        console.log(`📧 Email notification would be sent to: ${targetRequest.email}`);
        console.log(`📧 Type: ${action}`);
        console.log(`📧 User: ${targetRequest.username}`);
      }

      // If approved, create user account in database
      if (action === 'approved') {
        const approvedRequest = requests.find(req => req.id === requestId);
        if (approvedRequest) {
          try {
            const response = await fetch('/api/auth/create-user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                username: approvedRequest.username,
                email: approvedRequest.email,
                password: approvedRequest.password,
                role: approvedRequest.role,
                fatherName: approvedRequest.fatherName,
                cnic: approvedRequest.cnic,
                contactNumber: approvedRequest.contactNumber,
                qualification: approvedRequest.qualification
              }),
            });

            if (response.ok) {
              alert(`User ${approvedRequest.username} has been approved and can now login with their credentials!`);
            } else {
              const error = await response.json();
              alert(`User approved but account creation failed: ${error.error}`);
            }
          } catch (error) {
            console.error('Error creating user account:', error);
            alert(`User approved but account creation failed. Please try again.`);
          }
        }
      } else {
        alert('Request has been rejected.');
      }
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Failed to update request.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
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
            <h1 className="text-3xl font-bold text-academic-900 font-serif">User Requests Management</h1>
            <p className="text-academic-600 mt-2">
              Review and manage user signup requests.
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
              <Clock className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-academic-600">Pending Requests</p>
                <p className="text-2xl font-bold text-academic-900">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
            <div className="flex items-center">
              <Check className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-academic-600">Approved</p>
                <p className="text-2xl font-bold text-academic-900">
                  {requests.filter(r => r.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
            <div className="flex items-center">
              <X className="w-8 h-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-academic-600">Rejected</p>
                <p className="text-2xl font-bold text-academic-900">
                  {requests.filter(r => r.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Requests Cards */}
        <div className="space-y-6">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-sm border border-academic-200 overflow-hidden">
              {/* Header */}
              <div className="bg-academic-50 px-6 py-4 border-b border-academic-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="w-8 h-8 text-academic-500" />
                    <div>
                      <h3 className="text-lg font-semibold text-academic-900">
                        Request #{request.id}
                      </h3>
                      <p className="text-sm text-academic-600">
                        Submitted on {new Date(request.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(request.status)}
                    <span className={getStatusBadge(request.status)}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-academic-700 uppercase tracking-wider border-b border-academic-200 pb-2">
                      Personal Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-academic-500 uppercase">Full Name</label>
                        <p className="text-sm text-academic-900 font-medium">{request.username}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-academic-500 uppercase">Father's Name</label>
                        <p className="text-sm text-academic-900">{request.fatherName || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-academic-500 uppercase">CNIC</label>
                        <p className="text-sm text-academic-900 font-mono">{request.cnic || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-academic-700 uppercase tracking-wider border-b border-academic-200 pb-2">
                      Contact Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-academic-500 uppercase">Email Address</label>
                        <p className="text-sm text-academic-900 flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-academic-400" />
                          {request.email}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-academic-500 uppercase">Contact Number</label>
                        <p className="text-sm text-academic-900">{request.contactNumber || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-academic-700 uppercase tracking-wider border-b border-academic-200 pb-2">
                      Professional Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-academic-500 uppercase">Requested Role</label>
                        <p className="text-sm text-academic-900 flex items-center">
                          <Shield className="w-4 h-4 mr-2 text-academic-400" />
                          <span className="capitalize font-medium">{request.role}</span>
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-academic-500 uppercase">Qualification</label>
                        <p className="text-sm text-academic-900">{request.qualification || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {request.status === 'pending' && (
                  <div className="mt-6 pt-6 border-t border-academic-200">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-academic-600">
                        Review all details above and make a decision:
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleRequestAction(request.id, 'rejected')}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject Request
                        </button>
                        <button
                          onClick={() => handleRequestAction(request.id, 'approved')}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve Request
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {request.status !== 'pending' && (
                  <div className="mt-6 pt-6 border-t border-academic-200">
                    <p className="text-sm text-academic-600">
                      This request has been <span className="font-semibold capitalize">{request.status}</span>.
                      {request.status === 'approved' && ' The user can now login with their credentials.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
          
        {requests.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-12 text-center">
            <User className="w-12 h-12 text-academic-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-academic-900 mb-2">No requests yet</h3>
            <p className="text-academic-500">
              User signup requests will appear here when submitted.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserRequestsPage;
