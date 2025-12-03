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

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-green-50">
      {/* Header */}
      <header className="bg-green-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold font-serif mb-2">Privacy Policy</h1>
            <div className="h-1 w-20 bg-orange-500 rounded-full"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto border border-green-100">
          <div className="prose max-w-none text-gray-700">
            <Section number={1} title="Introduction">
              <p className="text-gray-700 leading-relaxed">
                Welcome to the Pakistan Army Green Book (PAGB) website. We respect your privacy and are committed to protecting your personal data.
              </p>
            </Section>

            <Section number={2} title="Information We Collect">
              <p className="text-gray-700 mb-4">We may collect and process the following data about you:</p>
              <ul className="list-none pl-0 space-y-2">
                <ListItem number={1}>Personal identification information (Name, email address, phone number, etc.)</ListItem>
                <ListItem number={2}>Demographic information</ListItem>
                <ListItem number={3}>IP address and browser information</ListItem>
                <ListItem number={4}>Pages you visit and resources you access</ListItem>
              </ul>
            </Section>

            <Section number={3} title="How We Use Your Information">
              <p className="text-gray-700 mb-4">We use your information to:</p>
              <ul className="list-none pl-0 space-y-2">
                <ListItem number={1}>Process and manage your account</ListItem>
                <ListItem number={2}>Improve our website and services</ListItem>
                <ListItem number={3}>Send you relevant updates and information</ListItem>
                <ListItem number={4}>Respond to your inquiries</ListItem>
              </ul>
            </Section>

            <Section number={4} title="Data Security">
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.
              </p>
            </Section>

            <Section number={5} title="Your Rights">
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-none pl-0 space-y-2">
                <ListItem number={1}>Access your personal data</ListItem>
                <ListItem number={2}>Request correction of your personal data</ListItem>
                <ListItem number={3}>Request erasure of your personal data</ListItem>
                <ListItem number={4}>Object to processing of your personal data</ListItem>
                <ListItem number={5}>Request restriction of processing</ListItem>
              </ul>
            </Section>

            <Section number={6} title="Changes to This Policy">
              <p className="text-gray-700 leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page.
              </p>
            </Section>

            <Section number={7} title="Contact Us">
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this privacy policy, please contact us at:
              </p>
              <div className="bg-green-50 p-4 rounded-lg mt-4 border-l-4 border-green-600">
                <div className="flex items-center text-green-800 mb-2">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Email: <a href="mailto:info@pagb.org.pk" className="text-green-700 hover:underline">info@pagb.org.pk</a></span>
                </div>
                <div className="flex items-center text-green-800">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Phone: <a href="tel:+92515202339" className="text-green-700 hover:underline">+92 (051) 5202339</a></span>
                </div>
              </div>
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
