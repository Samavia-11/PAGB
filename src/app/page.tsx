'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FileText, Users, Calendar, TrendingUp, PenTool, ArrowRight, Sparkles } from 'lucide-react';

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

interface RealTimeStats {
  publishedArticles: number;
  activeAuthors: number;
  issuesPublished: number;
  monthlyReaders: number;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [realTimeStats, setRealTimeStats] = useState<RealTimeStats>({
    publishedArticles: 397,
    activeAuthors: 94,
    issuesPublished: 21,
    monthlyReaders: 3071
  });
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Simulate real-time stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setIsUpdating(true);
      
      setRealTimeStats(prev => ({
        publishedArticles: prev.publishedArticles + Math.floor(Math.random() * 2),
        activeAuthors: prev.activeAuthors + (Math.random() > 0.7 ? 1 : 0),
        issuesPublished: prev.issuesPublished,
        monthlyReaders: prev.monthlyReaders + Math.floor(Math.random() * 10)
      }));

      setTimeout(() => setIsUpdating(false), 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title> PAGB - Advancing   Knowledge Through Academic Excellence</title>
        <meta name="description" content="A premier platform for   research, strategic analysis, and professional development." />
        <link rel="icon" href="/favicon.ico" />
      </Head>


      {/* Hero Header */}
      <header className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(147,197,253,0.2),transparent_50%)]"></div>

        <div className="relative container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-white/20">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
              Academic Excellence Since 2005
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent leading-tight">
               PAGB
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Advancing   Knowledge Through Academic Excellence
            </p>
            <div className="text-base text-blue-200 space-y-2 mb-10 max-w-2xl mx-auto">
              <p>• A premier platform for   research, strategic analysis, and professional development</p>
              <p>• Featuring scholarly discussions and debates by the defense community</p>
            </div>
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/login"
                className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-full hover:from-emerald-600 hover:to-blue-700 hover:scale-105 transition-all duration-300 font-semibold text-lg shadow-xl hover:shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-2">
                  <PenTool className="w-5 h-5" />
                  <span>Want to Publish Your Paper/Article?</span>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
              </Link>
              
              <Link 
                href="/browse"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-full hover:bg-white/20 hover:scale-105 transition-all duration-300 font-semibold text-lg"
              >
                Browse Articles
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-gray-50 to-transparent"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full -translate-y-48 translate-x-48 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full translate-y-32 -translate-x-32 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-blue-300/5 rounded-full animate-bounce"></div>
      </header>

      {/* Real-Time Stats Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md ${isUpdating ? 'ring-2 ring-blue-300 shadow-lg' : ''}`}>
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className={`text-2xl font-bold text-gray-900 transition-all duration-500 ${isUpdating ? 'scale-110' : ''}`}>
                  {realTimeStats.publishedArticles}
                </p>
                <p className="text-gray-600">Published Articles</p>
              </div>
            </div>
          </div>
          
          <div className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md ${isUpdating ? 'ring-2 ring-green-300 shadow-lg' : ''}`}>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className={`text-2xl font-bold text-gray-900 transition-all duration-500 ${isUpdating ? 'scale-110' : ''}`}>
                  {realTimeStats.activeAuthors}
                </p>
                <p className="text-gray-600">Active Authors</p>
              </div>
            </div>
          </div>
          
          <div className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md ${isUpdating ? 'ring-2 ring-purple-300 shadow-lg' : ''}`}>
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className={`text-2xl font-bold text-gray-900 transition-all duration-500 ${isUpdating ? 'scale-110' : ''}`}>
                  {realTimeStats.issuesPublished}
                </p>
                <p className="text-gray-600">Issues Published</p>
              </div>
            </div>
          </div>
          
          <div className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md ${isUpdating ? 'ring-2 ring-orange-300 shadow-lg' : ''}`}>
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className={`text-2xl font-bold text-gray-900 transition-all duration-500 ${isUpdating ? 'scale-110' : ''}`}>
                  {realTimeStats.monthlyReaders.toLocaleString()}
                </p>
                <p className="text-gray-600">Monthly Readers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Articles */}
          <div className="lg:col-span-2">
            {/* Current Issue */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Issue</h2>
              <p className="text-sm text-gray-600 mb-6">Volume 15, Issue 1 - January 2025</p>

              <div className="space-y-6">
                {articles.map((article, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      By <span className="font-medium">{article.author}</span>
                    </p>
                    <p className="text-gray-700 mb-3">{article.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Published: {article.published}</span>
                      <Link href="#" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                        Read More →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <button className="px-8 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium">
                  View Complete Issue
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            {/* Search Articles */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Search Articles</h3>
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Keywords, authors, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Browse Archives
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-blue-600 hover:text-blue-800 hover:underline">
                    About the Journal
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Announcements */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Announcements</h3>
              <div className="space-y-4">
                <div className="pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
                  <h4 className="font-semibold text-gray-900 mb-1">Call for Papers</h4>
                  <p className="text-sm text-gray-600">
                    Submit your research on &quot;Future of   Technology&quot; - Deadline: March 31, 2025
                  </p>
                </div>
                <div className="pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
                  <h4 className="font-semibold text-gray-900 mb-1">New Review Process</h4>
                  <p className="text-sm text-gray-600">
                    Updated peer-review process for faster publication
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Authors */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Authors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {authors.map((author, index) => (
              <div key={index} className="text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-blue-600">{author.number}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{author.name}</h3>
                <p className="text-sm text-gray-600">{author.rank}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-6">
            <div>
              <h3 className="text-lg font-bold mb-3"> PAGB</h3>
              <p className="text-gray-400 text-sm">
                Advancing   knowledge through academic excellence and scholarly discourse.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Archives</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Submission Guidelines</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Editorial Board</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Email: editor@armyjournal.org</li>
                <li>Phone: (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()}  PAGB. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
