'use client';

import Link from 'next/link';
import { BookOpen, ChevronLeft } from 'lucide-react';

export default function PeerReviewPolicyPage() {
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
                Peer Review Policy
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
                PAGB operates as a double-blind peer-reviewed journal, ensuring the impartial evaluation of manuscripts by qualified reviewers and experts in the relevant field, both nationally and internationally. These reviewers are external to the journal&apos;s editorial board and the publishing institute, in strict compliance with the Higher Education Commission (HEC) of Pakistan&apos;s Journals and Publications Policy. All reviewers are expected to adhere to the ethical standards outlined in the Committee on Publication Ethics (COPE) Ethical Guidelines for Peer Reviewer(s).
              </p>

              <p className="text-base leading-relaxed mb-6">
                Following an initial editorial assessment at PAGB, manuscripts deemed suitable are forwarded to reviewers with specialized expertise in the relevant research domains. The role of the reviewer is to assess the manuscript&apos;s originality, validity, and overall significance to the field. Reviewers provide a comprehensive evaluation of the manuscript&apos;s quality and offer a clear recommendation to the editorial team regarding whether the manuscript should be accepted, revised, or rejected.
              </p>

              <p className="text-base leading-relaxed mb-6">
                Reviewers are required to disclose any conflict of interest that could potentially bias their assessment, whether positively or negatively. Timely submission of the review report is essential; however, reviewers may request an extension if necessary by notifying the editor promptly.
              </p>

              <p className="text-base leading-relaxed mb-6">
                The double-blind review process of peer review that is a fundamental scientific publication process is adopted by PAGB. PAGB conducts an internal peer review of the submitted manuscripts to evaluate originality of manuscript, scope and content etc. Manuscripts found unsuitable for publication with reference to poor structure, writing or topics are rejected at this initial stage of peer review. Manuscripts that require any revision after internal review are returned for required amendments. Manuscript found suitable following internal review/revision by editor assigned are forwarded for at least two external reviews.
              </p>

              <p className="text-base leading-relaxed mb-4">
                The identities of both reviewers and authors are concealed from each other throughout the review. To facilitate this, authors must ensure that their manuscripts are prepared in such a way that they do not reveal their identities to reviewers, either directly or indirectly. Please therefore ensure that the following items are not present in your submission and are provided as separate file with title of &quot;Title Page&quot;. It should include:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-6 text-base">
                <li>Manuscript title</li>
                <li>Article category, abstract word count, manuscript word count</li>
                <li>All authors&apos; names and affiliations</li>
                <li>Complete address for the corresponding author, including an e-mail address</li>
                <li>Acknowledgments</li>
              </ul>

              <h2 className="text-xl font-bold text-green-800 mt-8 mb-4 border-b border-green-200 pb-2">
                Confidentiality and Anonymity
              </h2>
              <ul className="list-disc list-inside space-y-2 mb-6 text-base">
                <li>The content of the manuscript must be treated as strictly confidential by the reviewers.</li>
                <li>Authors&apos; identities are withheld from reviewers throughout the review process to maintain anonymity and prevent bias.</li>
                <li>Likewise, the identities of the reviewers are not disclosed to the authors, ensuring a fair and unbiased evaluation.</li>
              </ul>

              <p className="text-base leading-relaxed mt-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-600">
                This rigorous double-blind peer review process upholds the integrity and quality of scholarly publishing at PAGB, fostering trust and credibility within the academic community.
              </p>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}
