"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Layout from "@/components/Layout";

interface User {
  id: number;
  username: string;
  role: "author" | "reviewer" | "editor" | "administrator";
  full_name?: string;
  email?: string;
}

interface Issue {
  id: number;
  volume_number: number;
  issue_number: number;
  issue_year: number;
  issue_date: string;
  is_current_issue: number | boolean;
  created_at?: string;
}

export default function AdminIssuesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return router.push("/login");
      const data = await res.json();
      if (data.user.role !== "administrator") return router.push("/");
      setCurrentUser(data.user);
      await loadIssues();
    } catch (e) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const loadIssues = async () => {
    const res = await fetch("/api/issues");
    if (!res.ok) throw new Error("Failed to load issues");
    const data = await res.json();
    setIssues((data.issues || []) as Issue[]);
  };

  const makeCurrent = async (id: number) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_current_issue: true }),
      });
      if (!res.ok) throw new Error("Failed to set current issue");
      await loadIssues();
    } catch (e) {
      console.error(e);
      alert("Failed to update issue. Try again.");
    } finally {
      setBusyId(null);
    }
  };

  const deleteIssue = async (id: number) => {
    const target = issues.find((i) => i.id === id);
    const isCurrent = Boolean(target && Number(target.is_current_issue) === 1);
    const ok = window.confirm(
      isCurrent
        ? "You are deleting the CURRENT issue. The system will automatically set the latest remaining issue as current. Continue?"
        : "Delete this issue?"
    );
    if (!ok) return;

    setBusyId(id);
    try {
      const res = await fetch(`/api/issues/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete issue");
      await loadIssues();
    } catch (e) {
      console.error(e);
      alert("Failed to delete issue. Try again.");
    } finally {
      setBusyId(null);
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
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-academic-900 font-serif">Issues</h1>
          <p className="text-academic-600 mt-2">Manage all published issues. Only one issue can be marked as current.</p>
        </div>
        <button onClick={() => router.push("/dashboard/admin/issues/new")} className="btn-primary">
          Create New Issue
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-academic-200">
        <div className="p-6 border-b border-academic-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-academic-900">All Issues</h2>
          <button onClick={loadIssues} className="btn-secondary">
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-academic-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">Issue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-academic-200">
              {issues.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-academic-600">
                    No issues found. Create your first issue.
                  </td>
                </tr>
              ) : (
                issues.map((issue) => {
                  const isCurrent = Number(issue.is_current_issue) === 1;
                  const label = `Volume ${issue.volume_number} • Issue ${issue.issue_number} • ${issue.issue_year}`;
                  return (
                    <tr key={issue.id} className="hover:bg-academic-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-academic-900">{label}</div>
                        <div className="text-xs text-academic-500 mt-1">ID: {issue.id}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-academic-700">
                        {issue.issue_date ? new Date(issue.issue_date).toLocaleDateString() : "--"}
                      </td>
                      <td className="px-6 py-4">
                        {isCurrent ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Current
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Archived
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link href={`/dashboard/admin/issues/${issue.id}/edit`} className="btn-secondary">
                            Edit
                          </Link>
                          {!isCurrent && (
                            <button
                              onClick={() => makeCurrent(issue.id)}
                              disabled={busyId === issue.id}
                              className="btn-primary"
                            >
                              {busyId === issue.id ? "Updating..." : "Make Current"}
                            </button>
                          )}
                          <button
                            onClick={() => deleteIssue(issue.id)}
                            disabled={busyId === issue.id}
                            className="btn-secondary"
                          >
                            {busyId === issue.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
