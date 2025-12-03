'use client';

import Link from 'next/link';
import { BookOpen, Globe, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="footer" className="bg-[#002300] text-white py-12 border-t-4 border-orange">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="w-8 h-8" />
              <h3 className="text-lg font-serif font-bold">PAGB</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Pakistan Army Green Book - A premier platform for military research, strategic analysis, and professional development.
            </p>
          </div>
          <div>
            <h4 className="font-serif font-bold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/archives" className="text-gray-300 hover:text-white">Browse Archives</Link></li>
              <li><Link href="/current-issue" className="text-gray-300 hover:text-white">Current Issue</Link></li>
              <li><Link href="/policies/submission-guidelines" className="text-gray-300 hover:text-white">Submission Guidelines</Link></li>
              <li><Link href="/#editorial-board" className="text-gray-300 hover:text-white">Editorial Board</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-300 hover:text-white">About PAGB</Link></li>
              <li><Link href="/policies" className="text-gray-300 hover:text-white">Journal Policies</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif font-bold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start"><Globe className="w-4 h-4 mr-2 mt-0.5" /><span>Pakistan Army GHQ, Rawalpindi, Pakistan</span></li>
              <li className="flex items-start"><Mail className="w-4 h-4 mr-2 mt-0.5" /><a href="mailto:info@pagb.org.pk" className="hover:text-white">info@pagb.org.pk</a></li>
              <li className="flex items-start"><Phone className="w-4 h-4 mr-2 mt-0.5" /><span>+92 (051) 5202339</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} Pakistan Army Green Book. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="/policies/privacy-statement" className="hover:text-white">Privacy Policy</Link>
              <span>|</span>
              <Link href="/policies" className="hover:text-white">Terms of Use</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
