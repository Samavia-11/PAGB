'use client';

import Link from 'next/link';
import { BookOpen, ChevronLeft } from 'lucide-react';

export default function EditorialPolicyPage() {
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
                Editorial Policy
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
                Upon submission, each manuscript undergoes an initial assessment to determine its compliance with the submission criteria outlined in the Guidelines for Authors. Manuscripts meeting these criteria are then forwarded to a panel of reputable experts within the relevant research field for blind peer review. These reviewers provide recommendations to the author(s) as deemed necessary.
              </p>

              <h2 className="text-xl font-bold text-green-800 mt-8 mb-4 border-b border-green-200 pb-2">
                Editorial Independence
              </h2>
              <p className="text-base leading-relaxed mb-6">
                PAGB upholds the core principle of intellectual freedom and maintains independent editorial decision-making in accordance with the COPE Code of Conduct. Editorial decisions are made free from any commercial influence. Any grievances regarding editorial decisions are addressed exclusively within the publication&apos;s editorial framework.
              </p>

              <h2 className="text-xl font-bold text-green-800 mt-8 mb-4 border-b border-green-200 pb-2">
                Editorial Procedure
              </h2>
              <p className="text-base leading-relaxed mb-4">
                The editorial handling of submitted manuscripts follows a rigorous process:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-6 text-base">
                <li>A formal acknowledgment is issued upon receipt of the manuscript from the author(s).</li>
                <li>An initial evaluation is conducted by the editorial team, resulting in either rejection or provisional acceptance based on the journal&apos;s scope, submission guidelines, manuscript formatting, and an originality and plagiarism assessment.</li>
                <li>The manuscript undergoes blind peer review by qualified national and international reviewers.</li>
                <li>Authors are required to revise and improve their manuscript in accordance with reviewers&apos; recommendations, if necessary.</li>
                <li>Revised manuscripts may be resubmitted for further review as deemed appropriate.</li>
                <li>Final decisions regarding acceptance or rejection are made based on reviewers&apos; evaluations.</li>
                <li>Accepted manuscripts proceed through editorial processes including final editing, formatting, and preparation for printing.</li>
                <li>The journal is subsequently published following completion of these processes.</li>
              </ul>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}
