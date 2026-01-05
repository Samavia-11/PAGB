"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { Check, X, Users, Mail, UserPlus, Trash2 } from "lucide-react";

interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: "author" | "reviewer" | "editor" | "administrator";
  education?: {
    degree: string;
    institution: string;
    year?: string;
  }[];
}

interface PendingRequest {
  id: number;
  username: string;
  full_name: string;
  email: string;
  requestedRole: "author" | "reviewer";
  education?: {
    degree: string;
    institution: string;
    year?: string;
  }[];
}

export default function ManageUsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState<User[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<User | null>(null);
  

  useEffect(() => {
    checkAuth();
    seedMockData();
    
    // Listen for new request notifications
    if ('BroadcastChannel' in window) {
      const adminChannel = new BroadcastChannel('admin_notifications');
      adminChannel.onmessage = (event) => {
        const { type, request } = event.data;
        if (type === 'new_request') {
          loadPendingRequests(); // Refresh the requests list
        }
      };

      return () => {
        adminChannel.close();
      };
    }
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return router.push("/login");
      const data = await res.json();
      if (data.user.role !== "administrator") return router.push("/");
      setCurrentUser(data.user);
    } catch (e) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const seedMockData = () => {
    setUsers([
      {
        id: 1,
        username: "admin",
        full_name: "Administrator User",
        email: "admin@journal.test",
        role: "administrator",
        education: [
          { degree: "MSc Information Systems", institution: "National Defense Univ.", year: "2017" },
        ],
      },
      {
        id: 2,
        username: "mchen",
        full_name: "Dr. Michael Chen",
        email: "mchen@example.com",
        role: "author",
        education: [
          { degree: "PhD Computer Science", institution: "MIT", year: "2014" },
          { degree: "BSc Computer Science", institution: "MIT", year: "2009" },
        ],
      },
      {
        id: 3,
        username: "sdavis",
        full_name: "Maj. Sarah Davis",
        email: "sarah.davis@example.com",
        role: "reviewer",
        education: [
          { degree: "MEng Cybersecurity", institution: "Stanford", year: "2016" },
        ],
      },
    ]);

    // Load pending requests from localStorage (unified with login page)
    loadPendingRequests();
  };

  const loadPendingRequests = () => {
    const savedRequests = JSON.parse(localStorage.getItem('signup_requests') || '[]');
    const pendingRequests = savedRequests
      .filter((req: any) => req.status === 'pending')
      .map((req: any) => ({
        id: req.id,
        username: req.username,
        full_name: req.username, // Using username as full_name for now
        email: req.email,
        requestedRole: req.role as "author" | "reviewer",
        education: [] // No education data from the simple signup form
      }));
    setPending(pendingRequests);
  };

  const approveRequest = async (req: PendingRequest) => {
    try {
      // Get the original request data with password
      const savedRequests = JSON.parse(localStorage.getItem('signup_requests') || '[]');
      const originalRequest = savedRequests.find((r: any) => r.id === req.id);
      
      if (!originalRequest) {
        alert('Original request data not found');
        return;
      }

      // Create user account in database
      const response = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: originalRequest.username,
          email: originalRequest.email,
          password: originalRequest.password,
          role: originalRequest.role
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to create user account: ${error.error}`);
        return;
      }

      // Update the request status in localStorage
      const updatedRequests = savedRequests.map((r: any) => 
        r.id === req.id ? { ...r, status: 'approved' } : r
      );
      localStorage.setItem('signup_requests', JSON.stringify(updatedRequests));

      // Log email notification (temporarily disabled API call to fix server error)
      console.log(`📧 Email notification would be sent to: ${req.email}`);
      console.log(`📧 Type: approved`);
      console.log(`📧 User: ${req.username}`);

      // Broadcast status update to login page
      if ('BroadcastChannel' in window) {
        const statusChannel = new BroadcastChannel('request_status_updates');
        statusChannel.postMessage({
          requestId: req.id,
          newStatus: 'approved'
        });
        statusChannel.close();
      }

      // Add user to the local state
      setUsers((prev) => [
        ...prev,
        {
          id: Date.now(),
          username: req.username,
          full_name: req.full_name,
          email: req.email,
          role: req.requestedRole,
          education: req.education,
        },
      ]);
      
      // Remove from pending list
      setPending((prev) => prev.filter((p) => p.id !== req.id));
      
      alert(`User ${req.username} has been approved and can now login with their credentials!`);
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request. Please try again.');
    }
  };

  const rejectRequest = async (reqId: number) => {
    // Find the request to get user details for email
    const savedRequests = JSON.parse(localStorage.getItem('signup_requests') || '[]');
    const targetRequest = savedRequests.find((r: any) => r.id === reqId);
    
    // Log email notification (temporarily disabled API call to fix server error)
    if (targetRequest) {
      console.log(`📧 Email notification would be sent to: ${targetRequest.email}`);
      console.log(`📧 Type: rejected`);
      console.log(`📧 User: ${targetRequest.username}`);
    }

    // Update the request status in localStorage
    const updatedRequests = savedRequests.map((r: any) => 
      r.id === reqId ? { ...r, status: 'rejected' } : r
    );
    localStorage.setItem('signup_requests', JSON.stringify(updatedRequests));

    // Broadcast status update to login page
    if ('BroadcastChannel' in window) {
      const statusChannel = new BroadcastChannel('request_status_updates');
      statusChannel.postMessage({
        requestId: reqId,
        newStatus: 'rejected'
      });
      statusChannel.close();
    }

    // Remove from pending list
    setPending((prev) => prev.filter((p) => p.id !== reqId));
    
    alert('Request has been rejected.');
  };

  const removeUser = (userId: number) => {
    // In real app: call API to delete/deactivate user
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const openRemoveDialog = (user: User) => setConfirmDeleteUser(user);
  const closeRemoveDialog = () => setConfirmDeleteUser(null);
  const confirmRemove = () => {
    if (confirmDeleteUser) {
      removeUser(confirmDeleteUser.id);
      setConfirmDeleteUser(null);
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
    <Layout user={currentUser}>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-academic-900 font-serif">Manage Users</h1>
          <p className="text-academic-600 mt-2">View users and handle author/reviewer access requests.</p>
        </div>
        <button className="btn-secondary" onClick={() => router.push("/dashboard/admin")}>Back to Dashboard</button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-academic-200 mb-8">
        <div className="p-6 border-b border-academic-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-academic-900 flex items-center">
            <UserPlus className="w-5 h-5 mr-2" /> Pending Access Requests
          </h2>
          <span className="text-sm text-academic-600">{pending.length} request(s)</span>
        </div>
        {pending.length === 0 ? (
          <div className="p-6 text-sm text-academic-600">No pending requests.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-academic-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">Requested Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">Education</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-academic-200">
                {pending.map((req) => (
                  <tr key={req.id} className="hover:bg-academic-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-academic-900 flex items-center">
                        <Users className="w-4 h-4 mr-2 text-academic-500" /> {req.full_name} <span className="ml-2 text-academic-500">(@{req.username})</span>
                      </div>
                      <div className="text-sm text-academic-500 flex items-center mt-1"><Mail className="w-3 h-3 mr-1" /> {req.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-academic-700 capitalize">{req.requestedRole}</td>
                    <td className="px-6 py-4 text-sm text-academic-700">
                      {req.education && req.education.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1">
                          {req.education.map((e, idx) => (
                            <li key={idx}>
                              <span className="font-medium">{e.degree}</span> – {e.institution}
                              {e.year ? <span className="text-academic-500"> ({e.year})</span> : null}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-academic-500">No education provided</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2 justify-end">
                        <button onClick={() => approveRequest(req)} className="btn-primary flex items-center">
                          <Check className="w-4 h-4 mr-2" /> Accept
                        </button>
                        <button onClick={() => rejectRequest(req.id)} className="btn-secondary flex items-center text-red-600 border-red-200 hover:text-red-700">
                          <X className="w-4 h-4 mr-2" /> Reject
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

      <div className="bg-white rounded-lg shadow-sm border border-academic-200">
        <div className="p-6 border-b border-academic-200">
          <h2 className="text-xl font-semibold text-academic-900">All Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-academic-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-academic-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-academic-200">
              {users
                .filter((u) => u.role === 'author' || u.role === 'reviewer')
                .map((u) => (
                <tr key={u.id} className="hover:bg-academic-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-academic-900">{u.full_name} <span className="text-academic-500 ml-1">(@{u.username})</span></div>
                  </td>
                  <td className="px-6 py-4 text-sm capitalize">{u.role}</td>
                  <td className="px-6 py-4 text-sm text-academic-700">
                    <div className="flex items-center text-academic-700"><Mail className="w-3 h-3 mr-1" /> {u.email}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openRemoveDialog(u)}
                      className="btn-secondary flex items-center justify-center text-red-600 border-red-200 hover:text-red-700 hover:border-red-300 ml-auto"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Remove Confirmation Modal */}
      {confirmDeleteUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-academic-200">
              <h3 className="text-lg font-semibold text-academic-900">Remove User</h3>
            </div>
            <div className="p-6">
              <p className="text-academic-700">
                Do you really want to remove user <span className="font-medium">{confirmDeleteUser.full_name}</span> (@{confirmDeleteUser.username})?
              </p>
            </div>
            <div className="p-6 border-t border-academic-200 flex justify-end space-x-3">
              <button onClick={closeRemoveDialog} className="btn-secondary">No</button>
              <button onClick={confirmRemove} className="btn-primary bg-red-600 hover:bg-red-700 border-red-600">Yes, remove</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
