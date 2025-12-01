'use client';

import Link from 'next/link';
import { BookOpen, ChevronLeft } from 'lucide-react';

export default function ComplaintPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-green-50">
      <header className="bg-green-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2">
                Complaint Policy
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
{`The editorial team of PAGB welcomes complaints/appeals as they provide an opportunity for improvement. Please write your complaint with the journal volume number, issue number, research paper title, and page number to Editor PAGB at editor@pagb.org.pk, and a team member will respond as quickly as possible.

**Right to Appeal**

Author(s) has the right to appeal an editorial decision on his/her paper. If you wish to appeal a decision, write or email Editor PAGB explaining why the decision should be reversed. If reviewer reports were included with the previous rejection letter or email, the criticism would be responded to accordingly. All appeals are sent to the journal's Editor, who will assess your research paper and details of the peer review process before a final decision. We try to manage appeals as quickly as possible, but they can be complex, so we request the author(s) to be patient and cooperate. As with any complaint, we will acknowledge receipt and keep you informed during the appeal process.

**Post-Publication Issues**

While our editorial team strives to ensure that every research paper published in NDU Journal is entirely accurate, there are instances where problems would be raised after publication. These may fall into the following categories and result in different responses:

- Where the production process has introduced an error in the paper, we will publish an Erratum.
- Where the author(s) notices a mistake, we have not introduced, we will publish a Corrigendum.
- Where there are issues that may affect the record's validity, such as suspected image manipulation, but the author(s) is not willing to publish a Corrigendum, we will publish an Expression of Concern.
- Where major issues are affecting the validity of the scientific record, such as duplicate publication or proven plagiarism, we will publish a Retraction.

In all such cases, our editorial team collaborates with the author(s) to determine the best option from available responses. If a third party raises the issue, all concerned are also informed.

Errata, Corrigenda, Expressions of Concern, and Retractions are free to view and digitally linked to the original published article on our website and third-party websites that collect our metadata.

If anyone suspects a post-publication issue, we request them to contact the editorial team of PAGB immediately, providing sufficient details to undertake an investigation.

PAGB follows Committee on Publication Ethics (COPE) guidelines regarding complaints and appeals.`}
              </div>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}
