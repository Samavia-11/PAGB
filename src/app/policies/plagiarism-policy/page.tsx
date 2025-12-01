'use client';

import Link from 'next/link';
import { BookOpen, ChevronLeft } from 'lucide-react';

export default function PlagiarismPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-green-50">
      <header className="bg-green-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2">
                Plagiarism Policy
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
{`Plagiarism, as defined by the Concise Oxford Dictionary, constitutes the appropriation and utilization of the intellectual property, writings, or inventions of another individual without proper acknowledgment, thereby presenting such work as one's own. This practice is categorically prohibited within academic contexts due to its nature as a breach of academic integrity and an act of intellectual theft that undermines the original contributions of authors.

The PAGB adheres rigorously to the plagiarism policy promulgated by the Higher Education Commission (HEC) and employs the Turnitin Originality Report software as a critical tool to uphold academic integrity and promote originality in scholarly work. Manuscripts submitted for publication are subject to strict scrutiny, with an overall similarity index not exceeding 19%, and a maximum allowable similarity of 5% from any single source.

The Editorial Board of the PAGB enforces a zero-tolerance stance towards any form of academic dishonesty, including but not limited to plagiarism, citation manipulation, and data falsification or fabrication, in any submitted manuscript. Authors bear full responsibility for maintaining ethical standards in research and publication. In instances where research misconduct is identified, the editorial team of the NDU Journal will adhere to the Committee on Publication Ethics (COPE) Guidelines—or equivalent frameworks—in addressing and resolving such allegations in a transparent and equitable manner.

**Use of AI Tools**

According to the Committee on Publication Ethics (COPE) Position Statement: "AI tools cannot meet the requirements for authorship as they cannot take responsibility for the submitted work... Authors who use AI tools in the writing of a manuscript, production of images or graphical elements of the paper, or in the collection and analysis of data, must be transparent in disclosing in the Materials and Methods (or similar section) of the paper how the AI tool was used and which tool was used. Authors are fully responsible for the content of their manuscript, even those parts produced by an AI tool, and are thus liable for any breach of publication ethics."`}
              </div>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}
