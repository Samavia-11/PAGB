'use client';

import Link from 'next/link';
import { BookOpen, ChevronLeft } from 'lucide-react';

export default function EditorialPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-green-50">
      <header className="bg-green-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2">
                Editorial Policy
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
{`Upon submission, each manuscript undergoes an initial assessment to determine its compliance with the submission criteria outlined in the Guidelines for Authors. Manuscripts meeting these criteria are then forwarded to a panel of reputable experts within the relevant research field for blind peer review. These reviewers provide recommendations to the author(s) as deemed necessary.

**Editorial Independence**

PAGB upholds the core principle of intellectual freedom and maintains independent editorial decision-making in accordance with the COPE Code of Conduct. Editorial decisions are made free from any commercial influence. Any grievances regarding editorial decisions are addressed exclusively within the publication's editorial framework.

**Editorial Procedure**

The editorial handling of submitted manuscripts follows a rigorous process:

- A formal acknowledgment is issued upon receipt of the manuscript from the author(s).
- An initial evaluation is conducted by the editorial team, resulting in either rejection or provisional acceptance based on the journal's scope, submission guidelines, manuscript formatting, and an originality and plagiarism assessment.
- The manuscript undergoes blind peer review by qualified national and international reviewers.
- Authors are required to revise and improve their manuscript in accordance with reviewers' recommendations, if necessary.
- Revised manuscripts may be resubmitted for further review as deemed appropriate.
- Final decisions regarding acceptance or rejection are made based on reviewers' evaluations.
- Accepted manuscripts proceed through editorial processes including final editing, formatting, and preparation for printing.
- The journal is subsequently published following completion of these processes.`}
              </div>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}
