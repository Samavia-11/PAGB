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
    issueNumber: "",
    issueDate: "",
  });

  const update = (k: keyof typeof form, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const publishIssue = async () => {
    if (!form.volume || !form.issueNumber || !form.issueDate) {
      alert("Please fill all fields.");
      return;
    }
    setPublishing(true);
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volume_number: Number(form.volume),
          issue_number: Number(form.issueNumber),
          issue_date: form.issueDate,
        }),
      });
      if (!res.ok) throw new Error("Failed to publish issue");
      alert("Issue published successfully.");
      router.push("/dashboard/admin/issues");
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-academic-700 mb-2">Volume</label>
            <input
              type="number"
              value={form.volume}
              onChange={(e) => update("volume", e.target.value)}
              className="w-full rounded-lg border border-academic-300 bg-white px-4 py-3 text-academic-900 shadow-sm focus:border-academic-500 focus:outline-none focus:ring-2 focus:ring-academic-200"
              placeholder="e.g., 16"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-academic-700 mb-2">Issue Number</label>
            <input
              type="number"
              value={form.issueNumber}
              onChange={(e) => update("issueNumber", e.target.value)}
              className="w-full rounded-lg border border-academic-300 bg-white px-4 py-3 text-academic-900 shadow-sm focus:border-academic-500 focus:outline-none focus:ring-2 focus:ring-academic-200"
              placeholder="e.g., 1"
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
