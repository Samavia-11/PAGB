'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X, ChevronDown } from 'lucide-react';

interface PolicyLink {
  slug: string;
  title: string;
}

const staticPolicies: PolicyLink[] = [
  { slug: 'publication-policy', title: 'Publication Policy' },
  { slug: 'editorial-policy', title: 'Editorial Policy' },
  { slug: 'peer-review-policy', title: 'Peer Review Policy' },
  { slug: 'open-access-journal-policy', title: 'Open Access Journal Policy' },
  { slug: 'plagiarism-policy', title: 'Plagiarism Policy' },
  { slug: 'complaint-policy', title: 'Complaint Policy' },
  { slug: 'repository-policy', title: 'Repository Policy' },
  { slug: 'privacy-statement', title: 'Privacy Statement' },
  { slug: 'disclaimer', title: 'Disclaimer' },
  { slug: 'processing-fee-subscription', title: 'Processing Fee & Subscription' },
  { slug: 'submission-guidelines', title: 'Submission Guidelines' },
];

export default function Header() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [editorialDropdownOpen, setEditorialDropdownOpen] = useState<boolean>(false);
  const [policiesDropdownOpen, setPoliciesDropdownOpen] = useState<boolean>(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const scrollToSection = (sectionId: string) => {
    setEditorialDropdownOpen(false);
    setPoliciesDropdownOpen(false);
    setMobileMenuOpen(false);
    // Navigate to home page with hash
    window.location.href = `/#${sectionId}`;
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="bg-[#002300] text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <span>senduspagb@gmail.com</span>
              <span className="hidden md:inline">+92 (051) 5202339</span>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="https://ojs-trial.infinityfreeapp.com/ojs/index.php/pagb-v1i1/login" className="hover:text-gray-300">Login</Link>
              <span>|</span>
              <Link href="https://ojs-trial.infinityfreeapp.com/ojs/index.php/pagb-v1i1/user/register?source=" className="hover:text-gray-300">Sign Up</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded flex items-center justify-center">
              <img src="/images/pagblogo.png" alt="PAGB Logo" className="w-20 h-20 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-green">PAGB</h1>
              <p className="text-xs text-gray-600">Pakistan Army Green Book</p>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center space-x-6">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/current-issue" className="nav-link">Current Issue</Link>
            <Link href="/archives" className="nav-link">Archives</Link>
            <Link href="/about" className="nav-link">About</Link>
            <div className="relative">
              <button
                onClick={() => {
                  setEditorialDropdownOpen(!editorialDropdownOpen);
                  setPoliciesDropdownOpen(false);
                }}
                className="nav-link flex items-center space-x-1 hover:text-green-700 transition-colors"
              >
                <span>Editorial</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${editorialDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {editorialDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <button onClick={() => scrollToSection('leadership')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Leadership
                    </button>
                    <button onClick={() => scrollToSection('editorial-team')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Editorial Team
                    </button>
                    <button onClick={() => scrollToSection('advisory-board')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Advisory Board
                    </button>
                    <button onClick={() => scrollToSection('peer-review')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Peer Review Committee
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => {
                  setPoliciesDropdownOpen(!policiesDropdownOpen);
                  setEditorialDropdownOpen(false);
                }}
                className="nav-link flex items-center space-x-1 hover:text-green-700 transition-colors"
              >
                <span>Journal Policies</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${policiesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {policiesDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  <div className="py-2">
                    {staticPolicies.map((policy) => (
                      <Link
                        key={policy.slug}
                        href={`/policies/${policy.slug}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {policy.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link href="/#footer" className="nav-link">Contact</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green focus:border-green transition-all"
                      autoFocus
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="ml-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Open search"
                >
                  <Search className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>
            <button
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t pt-4">
            <nav className="flex flex-col space-y-2">
              <Link href="/" className="nav-link">Home</Link>
              <Link href="/current-issue" className="nav-link">Current Issue</Link>
              <Link href="/archives" className="nav-link">Archives</Link>
              <Link href="/about" className="nav-link">About</Link>
              <div>
                <button
                  onClick={() => {
                    setEditorialDropdownOpen(!editorialDropdownOpen);
                    setPoliciesDropdownOpen(false);
                  }}
                  className="nav-link flex items-center justify-between w-full"
                >
                  <span>Editorial</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${editorialDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {editorialDropdownOpen && (
                  <div className="ml-4 mt-2 space-y-1">
                    <button onClick={() => scrollToSection('leadership')} className="block w-full text-left py-1 text-sm text-gray-600 hover:text-green-600">
                      Leadership
                    </button>
                    <button onClick={() => scrollToSection('editorial-team')} className="block w-full text-left py-1 text-sm text-gray-600 hover:text-green-600">
                      Editorial Team
                    </button>
                    <button onClick={() => scrollToSection('advisory-board')} className="block w-full text-left py-1 text-sm text-gray-600 hover:text-green-600">
                      Advisory Board
                    </button>
                    <button onClick={() => scrollToSection('peer-review')} className="block w-full text-left py-1 text-sm text-gray-600 hover:text-green-600">
                      Peer Review Committee
                    </button>
                  </div>
                )}
              </div>
              <div>
                <button
                  onClick={() => {
                    setPoliciesDropdownOpen(!policiesDropdownOpen);
                    setEditorialDropdownOpen(false);
                  }}
                  className="nav-link flex items-center justify-between w-full"
                >
                  <span>Journal Policies</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${policiesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {policiesDropdownOpen && (
                  <div className="ml-4 mt-2 space-y-1 max-h-64 overflow-y-auto">
                    {staticPolicies.map((policy) => (
                      <Link
                        key={policy.slug}
                        href={`/policies/${policy.slug}`}
                        className="block w-full text-left py-1 text-sm text-gray-600 hover:text-green-600"
                      >
                        {policy.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <Link href="/#footer" className="nav-link">Contact</Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
