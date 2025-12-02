'use client';

import Link from 'next/link';
import { BookOpen, ChevronLeft } from 'lucide-react';

export default function OpenAccessJournalPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-green-50">
      <header className="bg-green-800 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 mr-8">
              <div className="w-10 h-10 bg-white/20 border border-white/40 rounded flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold text-white">PAGB</h1>
                <p className="text-xs text-green-200">Pakistan Army Green Book</p>
              </div>
            </Link>
            <div className="border-l border-white/30 pl-8">
              <h2 className="text-2xl md:text-3xl font-bold font-serif">
                Open Access Journal Policy
              </h2>
              <div className="h-1 w-20 bg-orange-500 rounded-full mt-1"></div>
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
              <p className="text-base leading-relaxed mb-6">
                PAGB operates as an Open Access Journal, providing unrestricted and free access for all individuals to read, download, copy, distribute, print, search, and cite its published content. Despite its open accessibility, the editorial board of PAGB emphasizes the importance of respecting intellectual property rights, including copyright. After PAGB recognition as Y category research journal will utilize the Open Journal System (OJS) software for its Open Access platform, with previous volumes and issues also accessible via the journal&apos;s website under the ARCHIVES section.
              </p>

              <h2 className="text-xl font-bold text-green-800 mt-8 mb-4 border-b border-green-200 pb-2">
                Open Access Information
              </h2>
              <p className="text-base leading-relaxed mb-4">
                All research articles disseminated through PAGB Journal are available globally under an Open Access policy. This framework signifies that:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-6 text-base">
                <li>The full texts of all papers published in PAGB are freely and unlimitedly accessible to all readers worldwide.</li>
                <li>Users are permitted to reuse published materials provided that the original publication is properly credited through appropriate citation.</li>
              </ul>

              <h2 className="text-xl font-bold text-green-800 mt-8 mb-4 border-b border-green-200 pb-2">
                Advantages for Authors
              </h2>
              <ul className="space-y-4 mb-6">
                <li className="text-base leading-relaxed">
                  <span className="font-semibold text-green-700">Enhanced Visibility</span> – Open Access ensures that research articles are freely accessible on the Internet without restrictions, allowing a wide and diverse audience to access and download full-text papers. Additionally, Open Access publications have an increased likelihood of being indexed and discoverable through various search engines and academic databases.
                </li>
                <li className="text-base leading-relaxed">
                  <span className="font-semibold text-green-700">Increased Citation Impact</span> – The heightened visibility and accessibility of Open Access articles contribute to greater citation rates, as these publications benefit from broader dissemination and public exposure.
                </li>
                <li className="text-base leading-relaxed">
                  <span className="font-semibold text-green-700">Expedited Publication Process</span> – Articles accepted for publication in PAGB Journal are typically made available online more swiftly compared to traditional, subscription-based, or print journals, facilitating rapid dissemination of research findings.
                </li>
              </ul>

              <p className="text-base leading-relaxed mt-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-600">
                This policy underlines the journal&apos;s commitment to fostering scholarly communication by enhancing accessibility, promoting intellectual property respect, and supporting authors in achieving greater academic impact.
              </p>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}
