"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
}

export default function EditIssuePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const issueId = params?.id;

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [form, setForm] = useState({
    volume: "",
    issueNumber: "",
    issueDate: "",
    setCurrent: false,
  });

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
      await loadIssue();
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const loadIssue = async () => {
    const res = await fetch(`/api/issues/${issueId}`);
    if (!res.ok) throw new Error("Failed to load issue");
    const data = await res.json();
    const i = data.issue as Issue;
    setIssue(i);
    setForm({
      volume: String(i.volume_number ?? ""),
      issueNumber: String(i.issue_number ?? ""),
      issueDate: i.issue_date ? String(i.issue_date).slice(0, 10) : "",
      setCurrent: Number(i.is_current_issue) === 1,
    });
  };

  const update = (k: keyof typeof form, v: any) => setForm((s) => ({ ...s, [k]: v }));

  const save = async () => {
    if (!form.volume || !form.issueNumber || !form.issueDate) {
      alert("Please fill all fields.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/issues/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volume_number: Number(form.volume),
          issue_number: Number(form.issueNumber),
          issue_date: form.issueDate,
          is_current_issue: form.setCurrent,
        }),
      });

      if (!res.ok) throw new Error("Failed to update issue");

      alert("Issue updated successfully.");
      router.push("/dashboard/admin/issues");
    } catch (e) {
      console.error(e);
      alert("Failed to update issue. Try again.");
    } finally {
      setSaving(false);
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

  if (!issue) {
    return (
      <Layout user={currentUser}>
        <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
          <p className="text-academic-700">Issue not found.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={currentUser}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-academic-900 font-serif">Edit Issue</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-academic-700 mb-2">Volume</label>
            <input
              type="number"
              value={form.volume}
              onChange={(e) => update("volume", e.target.value)}
              className="w-full rounded-lg border border-academic-300 bg-white px-4 py-3 text-academic-900 shadow-sm focus:border-academic-500 focus:outline-none focus:ring-2 focus:ring-academic-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-academic-700 mb-2">Issue Number</label>
            <input
              type="number"
              value={form.issueNumber}
              onChange={(e) => update("issueNumber", e.target.value)}
              className="w-full rounded-lg border border-academic-300 bg-white px-4 py-3 text-academic-900 shadow-sm focus:border-academic-500 focus:outline-none focus:ring-2 focus:ring-academic-200"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-academic-700 mb-2">Issue Date</label>
          <input
            type="date"
            value={form.issueDate}
            onChange={(e) => update("issueDate", e.target.value)}
            className="w-full rounded-lg border border-academic-300 bg-white px-4 py-3 text-academic-900 shadow-sm focus:border-academic-500 focus:outline-none focus:ring-2 focus:ring-academic-200"
          />
        </div>

        <div className="mt-6">
          <label className="flex items-center gap-3 text-sm text-academic-800">
            <input
              type="checkbox"
              checked={form.setCurrent}
              onChange={(e) => update("setCurrent", e.target.checked)}
              className="h-4 w-4"
            />
            Mark as current issue
          </label>
          <p className="text-xs text-academic-500 mt-2">
            Only one issue can be current. Setting this will automatically unset the previous current issue.
          </p>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={() => router.push("/dashboard/admin/issues")} className="btn-secondary">
            Cancel
          </button>
          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </Layout>
  );
}
