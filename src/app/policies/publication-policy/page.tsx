'use client';

import Link from 'next/link';
import { BookOpen, ChevronLeft } from 'lucide-react';

export default function PublicationPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-green-50">
      <header className="bg-green-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2">
                Publication Policy
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
{`PAGB publication policy follows the Higher Education Commission of Pakistan (HEC) Journals and Publications Guidelines and the Committee on Publication Ethics (COPE) Guidelines on Good Publication Practice.

The editorial handling of submitted manuscripts follows a rigorous process:

- A formal acknowledgment is issued upon receipt of the manuscript from the author(s).
- An initial evaluation is conducted by the editorial team, resulting in either rejection or provisional acceptance based on the journal's scope, submission guidelines, manuscript formatting, and an originality and plagiarism assessment.
- The manuscript undergoes blind peer review by qualified national and international reviewers.
- Authors are required to revise and improve their manuscript in accordance with reviewers' recommendations, if necessary.
- Revised manuscripts may be resubmitted for further review as deemed appropriate.
- Final decisions regarding acceptance or rejection are made based on reviewers' evaluations.
- Accepted manuscripts proceed through editorial processes including final editing, formatting, and preparation for printing.
- The journal is subsequently published following completion of these processes.

**Submission of Manuscript**

Submission of any manuscript to PAGB means that:

- The author(s) work has not been published earlier in any other journal, book, or book chapter, be it printed or online (except in the form of an abstract or an academic thesis).
- It is also not in any way under consideration for publication elsewhere.
- The submitted manuscript has permission for publication from all the concerned author(s) and is approved by the responsible authorities where that work has been carried out.
- If accepted in PAGB, it will not be published elsewhere in the same form, in any language, without the publisher's prior consent.`}
              </div>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}
