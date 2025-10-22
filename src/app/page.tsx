'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Users, Search, Menu, X, ChevronDown, BookOpen, Award, Globe } from 'lucide-react';

interface Article {
  title: string;
  author: string;
  date: string;
  description: string;
  published: string;
}

interface Author {
  number: number;
  name: string;
  rank: string;
}

interface Stats {
  publishedArticles: number;
  activeAuthors: number;
  issuesPublished: number;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  
  const stats: Stats = {
    publishedArticles: 397,
    activeAuthors: 94,
    issuesPublished: 21
  };

  const articles: Article[] = [
    {
      title: "Modern   Strategy in Digital Warfare",
      author: "Lt. Col. John D. Smith (Retd.)",
      date: "January 15, 2025",
      description: "This paper examines the evolution of   strategy in the context of digital warfare and cyber operations in modern   organizations.",
      published: "1/15/2025"
    },
    {
      title: "Leadership Development in Contemporary Armed Forces",
      author: "Maj. Gen. Emily R. Chen (Retd.)",
      date: "January 10, 2025",
      description: "An analysis of leadership training programs and their effectiveness across different   organizations.",
      published: "1/10/2025"
    },
    {
      title: "Logistics and Supply Chain Management in   Operations",
      author: "Col. Robert Martinez",
      date: "January 5, 2025",
      description: "Exploring modern logistics challenges and supply chain optimization in complex operational environments.",
      published: "1/5/2025"
    }
  ];

  const authors: Author[] = [
    { number: 15, name: "Lt. Col. John Smith", rank: "Lieutenant Colonel" },
    { number: 53, name: "Dr. Sarah Johnson", rank: "Professor of   History" },
    { number: 82, name: "Maj. Gen. Robert Carter", rank: "Major General (Retd.)" }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality would be implemented here
    console.log('Searching for:', searchQuery);
  };


  return (
    <div className="min-h-screen bg-white">
      {/* Institutional Header Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        {/* Top Bar */}
        <div className="bg-green text-white py-2">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center space-x-4">
                <span>📧 editor@pagb.army.mil</span>
                <span className="hidden md:inline">📞 +92 (051) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Link href="/login" className="hover:text-gray-300">Login</Link>
                <span>|</span>
                <Link href="/signup" className="hover:text-gray-300">Sign Up</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green rounded flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-green">PAGB</h1>
                <p className="text-xs text-gray-600">Pakistan Army Green Book</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Link href="/" className="nav-link active">Home</Link>
              <Link href="/current-issue" className="nav-link">Current Issue</Link>
              <Link href="/archives" className="nav-link">Archives</Link>
              <Link href="/about" className="nav-link">About</Link>
              <Link href="/submission" className="nav-link">Submit Article</Link>
              <Link href="/contact" className="nav-link">Contact</Link>
            </nav>

            {/* Search & Mobile Menu */}
            <div className="flex items-center space-x-4">
              {/* Expandable Search Bar */}
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

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t pt-4">
              <nav className="flex flex-col space-y-2">
                <Link href="/" className="nav-link">Home</Link>
                <Link href="/current-issue" className="nav-link">Current Issue</Link>
                <Link href="/archives" className="nav-link">Archives</Link>
                <Link href="/about" className="nav-link">About</Link>
                <Link href="/submission" className="nav-link">Submit Article</Link>
                <Link href="/contact" className="nav-link">Contact</Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section with Green Gradient, Military Image, and Text at Bottom */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden" style={{
        background: 'linear-gradient(90deg,rgba(26, 51, 32, 1) 17%, rgba(26, 51, 32, 1) 17%, rgba(25, 92, 17, 1) 52%, rgba(5, 56, 2, 1) 73%, rgba(10, 48, 4, 1) 88%);'
      }}>
        {/* Military Image - Centered with Increased Height */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-full" style={{width: '60%', maxWidth: '800px'}}>
            <img 
              src="/images/shanahan-1.webp" 
              alt="Military Personnel"
              className="w-full h-full object-cover object-center"
              style={{objectFit: 'cover'}}
            />
          </div>
        </div>
        
        {/* Text at Bottom with Glassy Transparent Overlay */}
        <div className="absolute bottom-0 left-0 right-0 py-6 md:py-10 z-10" style={{
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}>
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white text-center" style={{
              fontFamily: 'Impact, "Arial Bold", sans-serif',
              letterSpacing: '0.02em',
              fontWeight: '700',
              textTransform: 'uppercase',
              lineHeight: '1.1'
            }}>
              2024-2025 ARMY GREEN BOOK
            </h1>
          </div>
        </div>
      </section>

      {/* Content Bar with Link */}
      <section className="bg-orange-50 border-b-2 border-orange py-6">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Link href="/complete-issue" className="text-2xl font-bold text-orange hover:text-orange-dark transition-colors inline-block">
              VIEW THE ENTIRE 2024-2025 GREEN BOOK HERE
            </Link>
          </div>
        </div>
      </section>

      {/* Simple Stats Bar */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-center">
            <div>
              <p className="text-3xl font-bold text-green">{stats.publishedArticles}</p>
              <p className="text-sm text-gray-600">Published Articles</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green">{stats.activeAuthors}</p>
              <p className="text-sm text-gray-600">Contributing Authors</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green">{stats.issuesPublished}</p>
              <p className="text-sm text-gray-600">Issues Published</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content with Background Image */}
      <div className="relative" style={{
        backgroundImage: `url('/images/image.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}>
        {/* Light overlay for readability */}
        <div className="absolute inset-0 bg-white" style={{opacity: 0.20}}></div>
        
        <div className="relative container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Articles */}
          <div className="lg:col-span-2">
            {/* ARTICLES Header - AUSA Style */}
            <div className="mb-8">
              <h2 className="text-5xl font-black mb-2" style={{fontFamily: 'Arial, sans-serif', letterSpacing: '0.02em', fontWeight: '900'}}>
                ARTICLES
              </h2>
            </div>

            {/* Article List - AUSA Style */}
            <div className="space-y-8">
              {articles.map((article, index) => (
                <article key={index} className="flex items-start space-x-4 pb-8 border-b border-gray-200 last:border-b-0">
                  {/* Article Thumbnail */}
                  <div className="flex-shrink-0 w-28 h-20 bg-gray-200 overflow-hidden">
                    <img 
                      src={`https://images.unsplash.com/photo-1552519507-ac02dcb43829?w=200&h=150&fit=crop&crop=center`}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Article Content */}
                  <div className="flex-1">
                    <Link href={`/article/${index + 1}`}>
                      <h3 className="text-3xl font-bold mb-2 text-green hover:text-orange transition-colors" style={{fontFamily: 'Georgia, serif', lineHeight: '1.3', fontWeight: '700'}}>
                        {article.title}
                      </h3>
                    </Link>
                    <div className="mb-2">
                      <p className="font-bold text-base" style={{fontFamily: 'Arial Narrow, Arial, sans-serif', letterSpacing: '0.02em', fontWeight: '700'}}>
                        {article.author}
                      </p>
                    </div>
                    <p className="text-gray-700 text-base leading-relaxed" style={{fontFamily: 'Arial, sans-serif'}}>
                      {article.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            {/* Call for Papers - Highlighted */}
            <div className="bg-orange-50 border-2 border-orange rounded p-6 mb-6">
              <div className="flex items-start space-x-2 mb-2">
                <Award className="w-5 h-5 text-orange flex-shrink-0 mt-1" />
                <h3 className="font-serif font-bold text-lg text-green">Call for Papers</h3>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                Submit your research on <strong>&quot;Future of Military Technology&quot;</strong>
              </p>
              <p className="text-xs text-gray-600 mb-3">
                Deadline: March 31, 2025
              </p>
              <Link href="/submission" className="btn-secondary text-sm w-full inline-block text-center">
                Submit Now
              </Link>
            </div>

            {/* ARMY MAGAZINE */}
            <div className="mb-12">
              <h3 className="text-4xl font-bold mb-2" style={{
                color: '#5A6B4A', 
                fontFamily: 'Arial, sans-serif', 
                fontWeight: '700',
                letterSpacing: '0.02em'
              }}>
                ARMY MAGAZINE
              </h3>
            </div>

            {/* Other Issues */}
            <div>
              <h3 className="text-4xl font-bold mb-2 pb-3 border-b-2 border-gray-300" style={{
                color: '#3A3A3A', 
                fontFamily: 'Arial, sans-serif', 
                fontWeight: '700',
                letterSpacing: '0.02em'
              }}>
                OTHER ISSUES
              </h3>
              
              <div className="space-y-6 mt-8">
                {/* Issue Card 1 */}
                <Link href="/issue/2025-10" className="block border border-gray-300 hover:shadow-xl transition-shadow" style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(4px)'
                }}>
                  <div className="flex">
                    {/* Magazine Cover with Image */}
                    <div className="w-40 flex-shrink-0 relative bg-gradient-to-br from-green-900 to-green-700 overflow-hidden">
                      <img 
                        src="/images/shanahan-1.webp" 
                        alt="Green Book October 2025"
                        className="w-full h-full object-cover opacity-60"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                        <div className="text-yellow-400 font-black text-3xl mb-2" style={{fontFamily: 'Impact, sans-serif', textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>
                          ARMY
                        </div>
                        <div className="text-white font-black text-xl leading-tight text-center" style={{fontFamily: 'Impact, sans-serif', textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>
                          GREEN<br/>BOOK
                        </div>
                      </div>
                    </div>
                    
                    {/* Text Content */}
                    <div className="flex-1 p-5">
                      <div className="text-sm text-gray-700 mb-2 font-semibold">OCTOBER 2025</div>
                      <h4 className="font-bold text-lg leading-tight" style={{color: '#E85D04'}}>
                        ARMY MAGAZINE VOL. 75, NO. 10, OCTOBER 2025 - THE GREEN BOOK
                      </h4>
                    </div>
                  </div>
                </Link>

                {/* Issue Card 2 */}
                <Link href="/issue/2025-09" className="block border border-gray-300 hover:shadow-xl transition-shadow" style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(4px)'
                }}>
                  <div className="flex">
                    {/* Magazine Cover with Image */}
                    <div className="w-40 flex-shrink-0 relative bg-gradient-to-br from-green-800 to-green-600 overflow-hidden">
                      <img 
                        src="/images/shanahan-1.webp" 
                        alt="Green Book September 2025"
                        className="w-full h-full object-cover opacity-60"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                        <div className="text-yellow-400 font-black text-3xl mb-2" style={{fontFamily: 'Impact, sans-serif', textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>
                          ARMY
                        </div>
                        <div className="text-white font-black text-xl leading-tight text-center" style={{fontFamily: 'Impact, sans-serif', textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>
                          GREEN<br/>BOOK
                        </div>
                      </div>
                    </div>
                    
                    {/* Text Content */}
                    <div className="flex-1 p-5">
                      <div className="text-sm text-gray-700 mb-2 font-semibold">SEPTEMBER 2025</div>
                      <h4 className="font-bold text-lg leading-tight" style={{color: '#E85D04'}}>
                        ARMY MAGAZINE VOL. 75, NO. 9, SEPTEMBER 2025
                      </h4>
                    </div>
                  </div>
                </Link>

                {/* View All Link */}
                <div className="text-center pt-4">
                  <Link href="/archives" className="text-gray-800 font-semibold hover:text-orange transition-colors text-base flex items-center justify-center">
                    View All Issues <ChevronDown className="w-4 h-4 ml-1 rotate-[-90deg]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Quick Links & Recent Issues Section - Below Articles */}
      <section className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Quick Links */}
            <div>
              <h2 className="text-4xl font-bold mb-8" style={{color: '#5A6B4A', fontFamily: 'Georgia, serif', letterSpacing: '0.02em', fontWeight: '700'}}>
                QUICK LINKS
              </h2>
              <ul className="space-y-4">
                <li>
                  <Link href="/archives" className="flex items-center group">
                    <div className="w-12 h-12 rounded-full bg-orange flex items-center justify-center mr-4 flex-shrink-0">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-lg text-gray-800 group-hover:text-orange transition-colors">Browse Archives</span>
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="flex items-center group">
                    <div className="w-12 h-12 rounded-full bg-orange flex items-center justify-center mr-4 flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-lg text-gray-800 group-hover:text-orange transition-colors">About PAGB</span>
                  </Link>
                </li>
                <li>
                  <Link href="/submission" className="flex items-center group">
                    <div className="w-12 h-12 rounded-full bg-orange flex items-center justify-center mr-4 flex-shrink-0">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-lg text-gray-800 group-hover:text-orange transition-colors">Submission Guidelines</span>
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="flex items-center group">
                    <div className="w-12 h-12 rounded-full bg-orange flex items-center justify-center mr-4 flex-shrink-0">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-lg text-gray-800 group-hover:text-orange transition-colors">Contact Us</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Recent Issues */}
            <div>
              <h2 className="text-4xl font-bold mb-8" style={{color: '#5A6B4A', fontFamily: 'Georgia, serif', letterSpacing: '0.02em', fontWeight: '700'}}>
                RECENT ISSUES
              </h2>
              <ul className="space-y-4">
                <li className="border-b border-gray-300 pb-4">
                  <Link href="/issue/2025-01" className="block hover:text-orange transition-colors">
                    <div className="text-sm text-gray-600 mb-1">January 2025</div>
                    <div className="text-lg font-semibold text-green">Vol. 15, Issue 1</div>
                  </Link>
                </li>
                <li className="border-b border-gray-300 pb-4">
                  <Link href="/issue/2024-12" className="block hover:text-orange transition-colors">
                    <div className="text-sm text-gray-600 mb-1">December 2024</div>
                    <div className="text-lg font-semibold text-green">Vol. 14, Issue 12</div>
                  </Link>
                </li>
                <li className="border-b border-gray-300 pb-4">
                  <Link href="/issue/2024-11" className="block hover:text-orange transition-colors">
                    <div className="text-sm text-gray-600 mb-1">November 2024</div>
                    <div className="text-lg font-semibold text-green">Vol. 14, Issue 11</div>
                  </Link>
                </li>
                <li className="pt-2">
                  <Link href="/archives" className="text-orange font-bold text-lg hover:underline">
                    View All Issues →
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Authors - Simplified */}
      <section className="bg-white border-t border-gray-200 py-12">
        <div className="container mx-auto px-4">
          <h2 className="section-heading text-center mb-8">Contributing Authors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {authors.map((author, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-20 h-20 bg-green text-white rounded-full flex items-center justify-center mx-auto mb-4 font-serif text-2xl">
                  {author.number}
                </div>
                <h3 className="font-serif font-bold text-green mb-1">{author.name}</h3>
                <p className="text-sm text-gray-600">{author.rank}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Institutional Footer */}
      <footer className="bg-green text-white py-12 border-t-4 border-orange">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* About Section */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="w-8 h-8" />
                <h3 className="text-lg font-serif font-bold">PAGB</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Pakistan Army Green Book - A premier platform for military research, strategic analysis, and professional development.
              </p>
            </div>
            
            {/* Resources */}
            <div>
              <h4 className="font-serif font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/archives" className="text-gray-300 hover:text-white transition-colors">Browse Archives</Link></li>
                <li><Link href="/current-issue" className="text-gray-300 hover:text-white transition-colors">Current Issue</Link></li>
                <li><Link href="/submission" className="text-gray-300 hover:text-white transition-colors">Submission Guidelines</Link></li>
                <li><Link href="/editorial-board" className="text-gray-300 hover:text-white transition-colors">Editorial Board</Link></li>
                <li><Link href="/peer-review" className="text-gray-300 hover:text-white transition-colors">Peer Review Process</Link></li>
              </ul>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-serif font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors">About PAGB</Link></li>
                <li><Link href="/authors" className="text-gray-300 hover:text-white transition-colors">For Authors</Link></li>
                <li><Link href="/reviewers" className="text-gray-300 hover:text-white transition-colors">For Reviewers</Link></li>
                <li><Link href="/faq" className="text-gray-300 hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            
            {/* Contact Information */}
            <div>
              <h4 className="font-serif font-bold mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start">
                  <Globe className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Pakistan Army GHQ, Rawalpindi, Pakistan</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📧</span>
                  <a href="mailto:editor@pagb.army.mil" className="hover:text-white transition-colors">
                    editor@pagb.army.mil
                  </a>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📞</span>
                  <span>+92 (051) 123-4567</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-gray-700 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
              <p>© {new Date().getFullYear()} Pakistan Army Green Book. All rights reserved.</p>
              <div className="flex space-x-4 mt-4 md:mt-0">
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <span>|</span>
                <Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
                <span>|</span>
                <Link href="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
