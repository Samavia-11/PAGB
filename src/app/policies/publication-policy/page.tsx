'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PublicationPolicyPage() {
  return (
    <>
    <Header />
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-green-50">
      <header className="bg-green-800 text-white py-4">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold font-serif">
            Publication Policy
          </h2>
          <div className="h-1 w-20 bg-orange-500 rounded-full mt-1"></div>
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
                PAGB publication policy follows the Higher Education Commission of Pakistan (HEC) Journals and Publications Guidelines and the Committee on Publication Ethics (COPE) Guidelines on Good Publication Practice.
              </p>

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

              <h2 className="text-xl font-bold text-green-800 mt-8 mb-4 border-b border-green-200 pb-2">
                Submission of Manuscript
              </h2>
              <p className="text-base leading-relaxed mb-4">
                Submission of any manuscript to PAGB means that:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-6 text-base">
                <li>The author(s) work has not been published earlier in any other journal, book, or book chapter, be it printed or online (except in the form of an abstract or an academic thesis).</li>
                <li>It is also not in any way under consideration for publication elsewhere.</li>
                <li>The submitted manuscript has permission for publication from all the concerned author(s) and is approved by the responsible authorities where that work has been carried out.</li>
                <li>If accepted in PAGB, it will not be published elsewhere in the same form, in any language, without the publisher&apos;s prior consent.</li>
              </ul>
            </article>
          </div>
        </div>
      </main>
    </div>
    <Footer />
    </>
  );
}
