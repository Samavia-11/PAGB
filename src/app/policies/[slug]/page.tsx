'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, ChevronLeft } from 'lucide-react';

interface PolicyMeta {
  slug: string;
  title: string;
}

interface Policy extends PolicyMeta {
  content: string;
}

export default function PolicyPage() {
  const pathname = usePathname();
  const slug = pathname.split('/').filter(Boolean).pop() || '';

  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadPolicy() {
      try {
        const res = await fetch(`/api/policies-content?slug=${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (!cancelled) {
          setPolicy(data.policy || null);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setPolicy(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (slug) loadPolicy();
    return () => { cancelled = true; };
  }, [slug]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-green-50">
      <header className="bg-green-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2">
                {policy?.title || 'Journal Policy'}
              </h1>
              <div className="h-1 w-24 bg-orange-500 rounded-full"></div>
            </div>
            <div className="hidden md:flex items-center text-sm text-green-100">
              <BookOpen className="w-5 h-5 mr-2" />
              <span>Pakistan Army Green Book</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-green-800 hover:text-green-900"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Home
            </Link>
            <Link
              href="/policies"
              className="text-sm text-gray-600 hover:text-green-700"
            >
              View all policies
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-green-100">
            {loading && (
              <p className="text-gray-600">Loading policy...</p>
            )}

            {!loading && !policy && (
              <p className="text-gray-600">Policy not found.</p>
            )}

            {policy && (
              <article className="prose max-w-none text-gray-800">
                <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed font-sans">
                  {policy.content}
                </pre>
              </article>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
