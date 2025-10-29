'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserRequest {
  id: number;
  requester_name: string;
  requester_email: string;
  requested_role: string;
  request_type: string;
  status: 'pending' | 'accepted' | 'rejected';
  reason: string;
  admin_comments: string;
  processed_by: number | null;
  processed_by_name: string | null;
  created_at: string;
  processed_at: string | null;
}

export default function UserRequestsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [homeDropdown, setHomeDropdown] = useState(false);

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'administrator') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
    fetchRequests();
  }, [router]);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/user-requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching user requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRequest = async (requestId: number, status: 'accepted' | 'rejected', comments: string = '') => {
    setProcessing(requestId);
    try {
      const response = await fetch(`/api/user-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          admin_comments: comments,
          processed_by: user.id,
        }),
      });

      if (response.ok) {
        await fetchRequests(); // Refresh the list
        alert(`Request ${status} successfully!`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error processing request:', error);
      alert('Failed to process request');
    } finally {
      setProcessing(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'accepted':
        return '✅';
      case 'rejected':
        return '❌';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Navigation - Fixed/Sticky */}
      <div className="w-64 bg-green-700 text-white flex flex-col fixed h-full overflow-y-auto">
        {/* Logo Section */}
        <div className="p-6 border-b border-green-600">
          <div className="flex items-center space-x-3">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <span className="text-xl font-bold">PAGB Journal</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {/* Home with Dropdown */}
            <li>
              <div>
                <button 
                  onClick={() => setHomeDropdown(!homeDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />
                    </svg>
                    <span>Home</span>
                  </div>
                  <svg className={`w-4 h-4 transform transition-transform ${homeDropdown ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                  </svg>
                </button>
                {homeDropdown && (
                  <div className="ml-6 mt-2 space-y-1">
                    <Link href="/administrator/journal" className="block px-4 py-2 text-sm text-green-200 hover:text-white hover:bg-green-600 rounded transition-colors">
                      Journal
                    </Link>
                    <Link href="/administrator/featured-authors" className="block px-4 py-2 text-sm text-green-200 hover:text-white hover:bg-green-600 rounded transition-colors">
                      Featured Authors
                    </Link>
                  </div>
                )}
              </div>
            </li>
            
            <li>
              <Link href="/administrator/current-issue/display" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-green-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                <span>Current Issue</span>
              </Link>
            </li>
            
            <li>
              <Link href="/administrator/archives" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-green-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3,3H21V7H3V3M4,8H20V21H4V8M9.5,11A0.5,0.5 0 0,0 9,11.5V13H15V11.5A0.5,0.5 0 0,0 14.5,11H9.5Z" />
                </svg>
                <span>Archives</span>
              </Link>
            </li>
            
            <li>
              <Link href="/administrator/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-green-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z" />
                </svg>
                <span>Dashboard</span>
              </Link>
            </li>
            
            <li>
              <Link href="/administrator/user-requests" className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-green-600 text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16,4C18.11,4 19.99,5.89 19.99,8C19.99,10.11 18.11,12 16,12C13.89,12 12,10.11 12,8C12,5.89 13.89,4 16,4M16,14C20.42,14 24,15.79 24,18V20H8V18C8,15.79 11.58,14 16,14M6,6V9H4V6H1V4H4V1H6V4H9V6H6M6,13V16H4V13H1V11H4V8H6V11H9V13H6Z" />
                </svg>
                <span>User Requests</span>
              </Link>
            </li>
            
            <li>
              <Link href="/administrator/authors" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-green-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                </svg>
                <span>Authors</span>
              </Link>
            </li>

            <li>
              <Link href="/administrator/about" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-green-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" />
                </svg>
                <span>About</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-green-600">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold">A</span>
            </div>
            <div>
              <p className="text-sm font-medium">administrator</p>
              <p className="text-xs text-green-200">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-green-200 hover:text-white transition-colors text-sm ml-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Top Header */}
        <header className="bg-green-600 text-white px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                <span className="text-lg font-medium">PAGB Journal</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">administrator</span>
              </div>
            </div>
          </div>
        </header>

        {/* User Requests Content */}
        <main className="flex-1 p-6 bg-gray-100">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">User Requests</h2>
            <p className="text-gray-600">Manage user account requests and role changes.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-gray-900 mb-1">
                    {requests.filter(r => r.status === 'pending').length}
                  </p>
                  <p className="text-sm text-gray-600">Pending Requests</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-gray-900 mb-1">
                    {requests.filter(r => r.status === 'accepted').length}
                  </p>
                  <p className="text-sm text-gray-600">Accepted Requests</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-gray-900 mb-1">
                    {requests.filter(r => r.status === 'rejected').length}
                  </p>
                  <p className="text-sm text-gray-600">Rejected Requests</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">❌</span>
                </div>
              </div>
            </div>
          </div>

          {/* User Requests Table */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">All User Requests</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{request.requester_name}</h4>
                          <p className="text-sm text-gray-600">{request.requester_email}</p>
                          {request.reason && (
                            <p className="text-sm text-gray-500 mt-1">{request.reason}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                        {request.request_type.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                        {request.requested_role}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                          <span className="mr-1">{getStatusIcon(request.status)}</span>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(request.created_at).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-6 py-4">
                        {request.status === 'pending' ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleProcessRequest(request.id, 'accepted')}
                              disabled={processing === request.id}
                              className="text-green-600 hover:text-green-900 text-sm font-medium disabled:opacity-50"
                            >
                              {processing === request.id ? 'Processing...' : 'Accept'}
                            </button>
                            <button
                              onClick={() => handleProcessRequest(request.id, 'rejected')}
                              disabled={processing === request.id}
                              className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
                            >
                              {processing === request.id ? 'Processing...' : 'Reject'}
                            </button>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            {request.processed_at && (
                              <div>
                                <div>Processed: {new Date(request.processed_at).toLocaleDateString('en-GB')}</div>
                                {request.processed_by_name && (
                                  <div>By: {request.processed_by_name}</div>
                                )}
                                {request.admin_comments && (
                                  <div className="text-xs mt-1">Comments: {request.admin_comments}</div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {requests.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No user requests</h3>
                  <p className="mt-1 text-sm text-gray-500">User requests will appear here when submitted.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
