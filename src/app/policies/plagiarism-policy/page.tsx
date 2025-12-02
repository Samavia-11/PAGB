'use client';

import Link from 'next/link';
import { BookOpen, ChevronLeft } from 'lucide-react';

export default function PlagiarismPolicyPage() {
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
                Plagiarism Policy
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
                Plagiarism, as defined by the Concise Oxford Dictionary, constitutes the appropriation and utilization of the intellectual property, writings, or inventions of another individual without proper acknowledgment, thereby presenting such work as one&apos;s own. This practice is categorically prohibited within academic contexts due to its nature as a breach of academic integrity and an act of intellectual theft that undermines the original contributions of authors.
              </p>

              <p className="text-base leading-relaxed mb-6">
                The PAGB adheres rigorously to the plagiarism policy promulgated by the Higher Education Commission (HEC) and employs the Turnitin Originality Report software as a critical tool to uphold academic integrity and promote originality in scholarly work. Manuscripts submitted for publication are subject to strict scrutiny, with an overall similarity index not exceeding 19%, and a maximum allowable similarity of 5% from any single source.
              </p>

              <p className="text-base leading-relaxed mb-6">
                The Editorial Board of the PAGB enforces a zero-tolerance stance towards any form of academic dishonesty, including but not limited to plagiarism, citation manipulation, and data falsification or fabrication, in any submitted manuscript. Authors bear full responsibility for maintaining ethical standards in research and publication. In instances where research misconduct is identified, the editorial team of the PAGB Journal will adhere to the Committee on Publication Ethics (COPE) Guidelines—or equivalent frameworks—in addressing and resolving such allegations in a transparent and equitable manner.
              </p>

              <h2 className="text-xl font-bold text-green-800 mt-8 mb-4 border-b border-green-200 pb-2">
                Use of AI Tools
              </h2>
              <p className="text-base leading-relaxed p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                According to the Committee on Publication Ethics (COPE) Position Statement: &quot;AI tools cannot meet the requirements for authorship as they cannot take responsibility for the submitted work... Authors who use AI tools in the writing of a manuscript, production of images or graphical elements of the paper, or in the collection and analysis of data, must be transparent in disclosing in the Materials and Methods (or similar section) of the paper how the AI tool was used and which tool was used. Authors are fully responsible for the content of their manuscript, even those parts produced by an AI tool, and are thus liable for any breach of publication ethics.&quot;
              </p>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}
