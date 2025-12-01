'use client';

import Link from 'next/link';
import { BookOpen, ChevronLeft } from 'lucide-react';

export default function PeerReviewPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-green-50">
      <header className="bg-green-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2">
                Peer Review Policy
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
{`PAGB operates as a double-blind peer-reviewed journal, ensuring the impartial evaluation of manuscripts by qualified reviewers and experts in the relevant field, both nationally and internationally. These reviewers are external to the journal's editorial board and the publishing institute, in strict compliance with the Higher Education Commission (HEC) of Pakistan's Journals and Publications Policy. All reviewers are expected to adhere to the ethical standards outlined in the Committee on Publication Ethics (COPE) Ethical Guidelines for Peer Reviewer(s).

Following an initial editorial assessment at PAGB, manuscripts deemed suitable are forwarded to reviewers with specialized expertise in the relevant research domains. The role of the reviewer is to assess the manuscript's originality, validity, and overall significance to the field. Reviewers provide a comprehensive evaluation of the manuscript's quality and offer a clear recommendation to the editorial team regarding whether the manuscript should be accepted, revised, or rejected.

Reviewers are required to disclose any conflict of interest that could potentially bias their assessment, whether positively or negatively. Timely submission of the review report is essential; however, reviewers may request an extension if necessary by notifying the editor promptly.

The double-blind review process of peer review that is a fundamental scientific publication process is adopted by PAGB. PAGB conducts an internal peer review of the submitted manuscripts to evaluate originality of manuscript, scope and content etc. Manuscripts found unsuitable for publication with reference to poor structure, writing or topics are rejected at this initial stage of peer review. Manuscripts that require any revision after internal review are returned for required amendments. Manuscript found suitable following internal review/revision by editor assigned are forwarded for at least two external reviews.

The identities of both reviewers and authors are concealed from each other throughout the review. To facilitate this, authors must ensure that their manuscripts are prepared in such a way that they do not reveal their identities to reviewers, either directly or indirectly. Please therefore ensure that the following items are not present in your submission and are provided as separate file with title of "Title Page". It should include:

- Manuscript title
- Article category, abstract word count, manuscript word count
- All authors' names and affiliations
- Complete address for the corresponding author, including an e-mail address
- Acknowledgments

**Confidentiality and Anonymity**

- The content of the manuscript must be treated as strictly confidential by the reviewers.
- Authors' identities are withheld from reviewers throughout the review process to maintain anonymity and prevent bias.
- Likewise, the identities of the reviewers are not disclosed to the authors, ensuring a fair and unbiased evaluation.

This rigorous double-blind peer review process upholds the integrity and quality of scholarly publishing at PAGB, fostering trust and credibility within the academic community.`}
              </div>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}
