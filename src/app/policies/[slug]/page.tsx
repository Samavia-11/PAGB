'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, ChevronLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface PolicyMeta {
  slug: string;
  title: string;
}

interface Policy extends PolicyMeta {
  content: string;
}

// Convert markdown-style content to HTML
function formatPolicyContent(content: string): string {
  let html = content
    // Escape HTML entities first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Convert markdown images ![alt](url) to <img>
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="mx-auto my-6 rounded-lg shadow-md max-w-full h-auto" />')
    // Convert markdown links [text](url) to anchor tags
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-green-700 underline hover:text-green-900" target="_blank" rel="noopener noreferrer">$1</a>')
    // Convert bare URLs to anchor tags
    .replace(/(https?:\/\/[^\s)]+)/g, '<a href="$1" class="text-green-700 underline hover:text-green-900" target="_blank" rel="noopener noreferrer">$1</a>')
    // Convert **bold** to <strong>
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Convert headers (lines that are all caps or start with **)
    .replace(/^([A-Z][A-Z\s&\-]+)$/gm, '<h2 class="text-xl font-bold text-green-800 mt-8 mb-4 border-b border-green-200 pb-2">$1</h2>')
    // Convert bullet points
    .replace(/^[-•]\s*(.+)$/gm, '<li class="ml-4">$1</li>')
    // Wrap consecutive <li> items in <ul>
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="list-disc list-inside space-y-2 mb-6 text-base">$&</ul>')
    // Convert numbered lists
    .replace(/^\d+\.\s*(.+)$/gm, '<li class="ml-4">$1</li>')
    // Convert paragraphs (double newlines)
    .replace(/\n\n+/g, '</p><p class="text-base leading-relaxed mb-4">')
    // Convert single newlines within paragraphs
    .replace(/\n/g, '<br/>');
  
  // Wrap in paragraph tags
  html = '<p class="text-base leading-relaxed mb-4">' + html + '</p>';
  
  // Clean up empty paragraphs
  html = html.replace(/<p[^>]*>\s*<\/p>/g, '');
  html = html.replace(/<p[^>]*>\s*<h2/g, '<h2');
  html = html.replace(/<\/h2>\s*<\/p>/g, '</h2>');
  
  return html;
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
    <>
    <Header />
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
                <div 
                  className="policy-content text-base leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: formatPolicyContent(policy.content) 
                  }}
                />
              </article>
            )}
          </div>
        </div>
      </main>
    </div>
    <Footer />
    </>
  );
}
