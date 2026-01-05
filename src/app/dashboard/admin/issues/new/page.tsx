"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";

interface User {
  id: number;
  username: string;
  role: "author" | "reviewer" | "editor" | "administrator";
  full_name?: string;
  email?: string;
}

export default function CreateIssuePage() {
  const router = useRouter();
  const [currentUser] = useState<User | null>({
    id: 1,
    username: "admin",
    role: "administrator",
    full_name: "Administrator User",
    email: "admin@journal.test",
  });
  const [publishing, setPublishing] = useState(false);
  const [form, setForm] = useState({
    volume: "",
    issueDate: "",
    abstract: "",
    issue: "",
  });

  const update = (k: keyof typeof form, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const publishIssue = async () => {
    if (!form.volume || !form.issueDate || !form.abstract || !form.issue) {
      alert("Please fill all fields.");
      return;
    }
    setPublishing(true);
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volume: Number(form.volume),
          date: form.issueDate,
          abstract: form.abstract,
          content: form.issue,
          visibility: ["author", "reviewer", "editor"],
          status: "published",
        }),
      });
      if (!res.ok) throw new Error("Failed to publish issue");
      alert("Issue published and visible to Authors, Reviewers, and Editors.");
      router.push("/dashboard/admin");
    } catch (e) {
      console.error(e);
      alert("Failed to publish. Try again.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <Layout user={currentUser}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-academic-900 font-serif">Create New Issue</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-academic-700 mb-2">Volume</label>
            <input
              type="number"
              value={form.volume}
              onChange={(e) => update("volume", e.target.value)}
              className="form-input"
              placeholder="e.g., 16"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-academic-700 mb-2">Issue Date</label>
          <input
            type="date"
            value={form.issueDate}
            onChange={(e) => update("issueDate", e.target.value)}
            className="form-input"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-academic-700 mb-2">Issue</label>
          <input
            type="text"
            value={form.issue}
            onChange={(e) => update("issue", e.target.value)}
            className="form-input"
            placeholder="Write the issue title here..."
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-academic-700 mb-2">Abstract</label>
          <textarea
            value={form.abstract}
            onChange={(e) => update("abstract", e.target.value)}
            className="form-textarea"
            rows={6}
            placeholder="Write a brief abstract for this issue..."
          />
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={() => router.push("/dashboard/admin")} className="btn-secondary">Cancel</button>
          <button onClick={publishIssue} disabled={publishing} className="btn-primary">
            {publishing ? "Publishing..." : "Publish Issue"}
          </button>
        </div>
      </div>
    </Layout>
  );
}
