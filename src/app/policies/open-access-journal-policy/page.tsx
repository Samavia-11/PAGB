'use client';

import Link from 'next/link';
import { BookOpen, ChevronLeft } from 'lucide-react';

export default function OpenAccessJournalPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-green-50">
      <header className="bg-green-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2">
                Open Access Journal Policy
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
            <article className="prose max-w-none text-gray-800">
              <div className="whitespace-pre-wrap break-words text-sm leading-relaxed font-sans">
{`PAGB operates as an Open Access Journal, providing unrestricted and free access for all individuals to read, download, copy, distribute, print, search, and cite its published content. Despite its open accessibility, the editorial board of PAGB emphasizes the importance of respecting intellectual property rights, including copyright. After PAGB recognition as Y category research journal will utilize the Open Journal System (OJS) software for its Open Access platform, with previous volumes and issues also accessible via the journal's website under the ARCHIVES section.

**Open Access Information**

All research articles disseminated through PAGB Journal are available globally under an Open Access policy. This framework signifies that:

- The full texts of all papers published in PAGB are freely and unlimitedly accessible to all readers worldwide.
- Users are permitted to reuse published materials provided that the original publication is properly credited through appropriate citation.

**Advantages for Authors**

- **Enhanced Visibility** – Open Access ensures that research articles are freely accessible on the Internet without restrictions, allowing a wide and diverse audience to access and download full-text papers. Additionally, Open Access publications have an increased likelihood of being indexed and discoverable through various search engines and academic databases.
- **Increased Citation Impact** – The heightened visibility and accessibility of Open Access articles contribute to greater citation rates, as these publications benefit from broader dissemination and public exposure.
- **Expedited Publication Process** – Articles accepted for publication in NDU Journal are typically made available online more swiftly compared to traditional, subscription-based, or print journals, facilitating rapid dissemination of research findings.

This policy underlines the journal's commitment to fostering scholarly communication by enhancing accessibility, promoting intellectual property respect, and supporting authors in achieving greater academic impact.`}
              </div>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}
