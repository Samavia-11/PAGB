'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ComplaintPolicyPage() {
  return (
    <>
    <Header />
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-green-50">
      <header className="bg-green-800 text-white py-4">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold font-serif">
            Complaint Policy
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
                The editorial team of PAGB welcomes complaints/appeals as they provide an opportunity for improvement. Please write your complaint with the journal volume number, issue number, research paper title, and page number to Editor PAGB at <a href="mailto:editor@pagb.org.pk" className="text-green-700 hover:underline">editor@pagb.org.pk</a>, and a team member will respond as quickly as possible.
              </p>

              <h2 className="text-xl font-bold text-green-800 mt-8 mb-4 border-b border-green-200 pb-2">
                Right to Appeal
              </h2>
              <p className="text-base leading-relaxed mb-6">
                Author(s) has the right to appeal an editorial decision on his/her paper. If you wish to appeal a decision, write or email Editor PAGB explaining why the decision should be reversed. If reviewer reports were included with the previous rejection letter or email, the criticism would be responded to accordingly. All appeals are sent to the journal&apos;s Editor, who will assess your research paper and details of the peer review process before a final decision. We try to manage appeals as quickly as possible, but they can be complex, so we request the author(s) to be patient and cooperate. As with any complaint, we will acknowledge receipt and keep you informed during the appeal process.
              </p>

              <h2 className="text-xl font-bold text-green-800 mt-8 mb-4 border-b border-green-200 pb-2">
                Post-Publication Issues
              </h2>
              <p className="text-base leading-relaxed mb-4">
                While our editorial team strives to ensure that every research paper published in PAGB Journal is entirely accurate, there are instances where problems would be raised after publication. These may fall into the following categories and result in different responses:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="text-base leading-relaxed">
                  <span className="font-semibold text-green-700">Erratum</span> – Where the production process has introduced an error in the paper.
                </li>
                <li className="text-base leading-relaxed">
                  <span className="font-semibold text-green-700">Corrigendum</span> – Where the author(s) notices a mistake we have not introduced.
                </li>
                <li className="text-base leading-relaxed">
                  <span className="font-semibold text-green-700">Expression of Concern</span> – Where there are issues that may affect the record&apos;s validity, such as suspected image manipulation, but the author(s) is not willing to publish a Corrigendum.
                </li>
                <li className="text-base leading-relaxed">
                  <span className="font-semibold text-green-700">Retraction</span> – Where major issues are affecting the validity of the scientific record, such as duplicate publication or proven plagiarism.
                </li>
              </ul>

              <p className="text-base leading-relaxed mb-6">
                In all such cases, our editorial team collaborates with the author(s) to determine the best option from available responses. If a third party raises the issue, all concerned are also informed.
              </p>

              <p className="text-base leading-relaxed mb-6">
                Errata, Corrigenda, Expressions of Concern, and Retractions are free to view and digitally linked to the original published article on our website and third-party websites that collect our metadata.
              </p>

              <p className="text-base leading-relaxed mb-6">
                If anyone suspects a post-publication issue, we request them to contact the editorial team of PAGB immediately, providing sufficient details to undertake an investigation.
              </p>

              <p className="text-base leading-relaxed p-4 bg-green-50 rounded-lg border-l-4 border-green-600">
                PAGB follows Committee on Publication Ethics (COPE) guidelines regarding complaints and appeals.
              </p>
            </article>
          </div>
        </div>
      </main>
    </div>
    <Footer />
    </>
  );
}
