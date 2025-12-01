'use client';

import Link from 'next/link';
import { BookOpen, ChevronRight } from 'lucide-react';

interface PolicyLink {
  slug: string;
  title: string;
  description: string;
}

const policies: PolicyLink[] = [
  {
    slug: 'publication-policy',
    title: 'Publication Policy',
    description: 'Guidelines for manuscript submission, processing, and publication procedures'
  },
  {
    slug: 'editorial-policy',
    title: 'Editorial Policy',
    description: 'Editorial independence, procedures, and decision-making processes'
  },
  {
    slug: 'peer-review-policy',
    title: 'Peer Review Policy',
    description: 'Double-blind peer review process and reviewer guidelines'
  },
  {
    slug: 'open-access-journal-policy',
    title: 'Open Access Journal Policy',
    description: 'Open access policy and advantages for authors'
  },
  {
    slug: 'plagiarism-policy',
    title: 'Plagiarism Policy',
    description: 'Plagiarism guidelines, AI tools policy, and academic integrity'
  },
  {
    slug: 'repository-policy',
    title: 'Repository Policy',
    description: 'Guidelines for self-archiving and reproducing published materials'
  },
  {
    slug: 'complaint-policy',
    title: 'Complaint Policy',
    description: 'Complaint procedures, appeals process, and post-publication issues'
  }
];

export default function PoliciesIndexPage() {

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-green-50">
      <header className="bg-green-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2">Journal Policies</h1>
            <div className="h-1 w-24 bg-orange-500 rounded-full"></div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8 border border-green-100">
          <ul className="divide-y divide-gray-200">
            {policies.map((policy) => (
              <li key={policy.slug} className="py-4 flex items-start justify-between">
                <div className="flex items-start flex-1">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-green-700" />
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/policies/${policy.slug}`}
                      className="text-lg font-semibold text-gray-800 hover:text-green-700 block mb-1"
                    >
                      {policy.title}
                    </Link>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {policy.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 mt-2 flex-shrink-0 ml-4" />
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
