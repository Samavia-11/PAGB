'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RepositoryPolicyPage() {
  return (
    <>
    <Header />
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-green-50">
      <header className="bg-green-800 text-white py-4">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold font-serif">
            Repository Policy
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
                Author(s) can deposit his/her work (submitted, accepted, and published versions) in an institutional or other repository/website without embargo. However, the Author(s) is advised to refrain from posting manuscripts during the submission/publishing process as it may affect the Turnitin Similarity Index. Author(s) should also clearly attribute PAGB as the original source of publication and provide accurate citation details when posting, reusing, or distributing published Open Access research papers elsewhere. The URL/DOI of the published article should be mentioned when posting to any repository.
              </p>

              <h2 className="text-xl font-bold text-green-800 mt-8 mb-4 border-b border-green-200 pb-2">
                Reproducing Published Material from other Publishers
              </h2>
              <p className="text-base leading-relaxed mb-6">
                PAGB does not publish material from other publications without permission. Author(s) must obtain permission to reproduce any printed material which does not fall into the public domain or for which he/she does not hold the copyright. The copyright holder may give instructions to be followed; otherwise, follow the style (shown below) to be mentioned at the end of the caption of the Table, Figure, Scheme, etc.
              </p>

              <div className="p-4 bg-gray-100 rounded-lg border-l-4 border-gray-500 italic text-base">
                &quot;Reproduced with permission from [author], [book/journal title]; published by [publisher], [year].&quot;
              </div>
            </article>
          </div>
        </div>
      </main>
    </div>
    <Footer />
    </>
  );
}
