import Link from 'next/link';
import { BookOpen } from 'lucide-react';

const Section = ({ number, title, children }: { number: number; title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <div className="flex items-start">
      <div className="bg-green-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1 mr-3">
        {number}
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex-1">{title}</h2>
    </div>
    <div className="ml-11">
      {children}
    </div>
  </div>
);

const ListItem = ({ number, children }: { number: number; children: React.ReactNode }) => (
  <li className="flex mb-2">
    <span className="text-green-600 font-medium mr-2 w-6 text-right">{number}.</span>
    <span>{children}</span>
  </li>
);

export default function Accessibility() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-green-50">
      {/* Header */}
      <header className="bg-green-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold font-serif mb-2">Accessibility Statement</h1>
            <div className="h-1 w-20 bg-orange-500 rounded-full"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto border border-green-100">
          <div className="prose max-w-none text-gray-700">
            <Section number={1} title="Our Commitment to Accessibility">
              <p className="text-gray-700 leading-relaxed">
                Pakistan Army Green Book (PAGB) is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
              </p>
            </Section>

            <Section number={2} title="Conformance Status">
              <p className="text-gray-700 leading-relaxed">
                We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. These guidelines explain how to make web content more accessible for people with disabilities.
              </p>
            </Section>

            <Section number={3} title="Accessibility Features">
              <p className="text-gray-700 mb-4">Our website includes the following features:</p>
              <ul className="list-none pl-0 space-y-2">
                <ListItem number={1}>Keyboard navigation support</ListItem>
                <ListItem number={2}>Alternative text for images</ListItem>
                <ListItem number={3}>Responsive design for different screen sizes</ListItem>
                <ListItem number={4}>Clear and consistent navigation</ListItem>
                <ListItem number={5}>Adjustable text size (using browser zoom)</ListItem>
              </ul>
            </Section>

            <Section number={4} title="Feedback">
              <p className="text-gray-700 mb-4">
                We welcome your feedback on the accessibility of PAGB. Please let us know if you encounter accessibility barriers:
              </p>
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                <div className="flex items-center text-green-800 mb-2">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Email: <a href="mailto:senduspagb@gmail.com" className="text-green-700 hover:underline">senduspagb@gmail.com</a></span>
                </div>
                <div className="flex items-center text-green-800">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Phone: <a href="tel:+92515202339" className="text-green-700 hover:underline">+92 (051) 5202339</a></span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-4">
                We try to respond to feedback within 3-5 business days.
              </p>
            </Section>

            <Section number={5} title="Technical Specifications">
              <p className="text-gray-700 mb-4">
                The accessibility of PAGB relies on the following technologies:
              </p>
              <div className="grid grid-cols-2 gap-2 max-w-md">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <span className="block font-medium text-gray-800">HTML</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <span className="block font-medium text-gray-800">CSS</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <span className="block font-medium text-gray-800">JavaScript</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <span className="block font-medium text-gray-800">WAI-ARIA</span>
                </div>
              </div>
            </Section>

            <Section number={6} title="Limitations and Alternatives">
              <p className="text-gray-700 leading-relaxed">
                Despite our best efforts to ensure accessibility, some content may not yet be fully accessible. Please contact us if you encounter an issue.
              </p>
            </Section>

            <Section number={7} title="Assessment Approach">
              <p className="text-gray-700 leading-relaxed">
                PAGB assesses the accessibility of this website through self-evaluation and external tools.
              </p>
            </Section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-green-900 text-white py-8 border-t-4 border-orange-500">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <BookOpen className="w-6 h-6 mr-2 text-orange-400" />
              <span className="text-lg font-serif font-bold">Pakistan Army Green Book</span>
            </div>
            <p className="text-green-200 mb-6">© {new Date().getFullYear()} All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-green-300">
              <Link href="/privacy" className="hover:text-white hover:underline transition-colors px-2 py-1 rounded hover:bg-green-800">Privacy Policy</Link>
              <span className="text-green-600">|</span>
              <Link href="/terms" className="hover:text-white hover:underline transition-colors px-2 py-1 rounded hover:bg-green-800">Terms of Use</Link>
              <span className="text-green-600">|</span>
              <Link href="/accessibility" className="hover:text-white hover:underline transition-colors px-2 py-1 rounded hover:bg-green-800">Accessibility</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
