'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Users, Search, Menu, X, ChevronDown, BookOpen, Award, Globe, ChevronLeft, ChevronRight, Phone, Mail } from 'lucide-react';

// Image slider component
const ImageSlider = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, currentIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      nextSlide();
    }
    if (touchEndX.current - touchStartX.current > 50) {
      prevSlide();
    }
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div 
      className="relative w-full h-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((image, index) => (
          <div key={index} className="w-full flex-shrink-0 h-full">
            <img 
              src={image} 
              alt={`Slide ${index + 1}`} 
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all focus:outline-none"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all focus:outline-none"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${currentIndex === index ? 'bg-white w-6' : 'bg-white bg-opacity-50'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

interface Article {
  title: string;
  author: string;
  date: string;
  description: string;
  published: string;
  pdfUrl: string;
  thumbnail: string;
}

interface Author {
  name: string;
  slug: string;
  count: number;
}

interface Stats {
  publishedArticles: number;
  activeAuthors: number;
  issuesPublished: number;
}

interface PolicyLink {
  slug: string;
  title: string;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [editorialDropdownOpen, setEditorialDropdownOpen] = useState<boolean>(false);
  const [policiesDropdownOpen, setPoliciesDropdownOpen] = useState<boolean>(false);

  const [stats, setStats] = useState<Stats>({
    publishedArticles: 0,
    activeAuthors: 0,
    issuesPublished: 0,
  });

  const initialArticles: Article[] = [
    {
      title: "Pakistan's National Security Policies",
      author: "Various Contributors",
      date: "2024",
      description: "A comprehensive analysis of Pakistan's national security framework, strategic challenges, and policy recommendations for safeguarding national interests.",
      published: "2024",
      pdfUrl: "/pdfs/PAGB%202024%20(1)%20___Pakistan%E2%80%99s%20National%20Security%20National%20Security%20Policies.pdf",
      thumbnail: "/images/thumbnails/article-1.jpg"
    },
    {
      title: "Afghan Refugees and The Principle of Non-Refoulement",
      author: "Various Contributors",
      date: "2024",
      description: "An examination of the Afghan refugee crisis and international legal principles governing refugee protection and non-refoulement.",
      published: "2024",
      pdfUrl: "/pdfs/PAGB%202024%20(2)___Afghan%20Refugees%20Afghan%20Refugees%20and%20The%20Principle%20of%20and%20The%20Principle%20of%20Non-Refoulement.pdf",
      thumbnail: "/images/thumbnails/article-2.jpg"
    },
    {
      title: "Pakistan-Afghanistan Relations: A Historical Perspective",
      author: "Various Contributors",
      date: "2024",
      description: "A historical analysis of Pakistan-Afghanistan bilateral relations, examining key events, challenges, and opportunities for regional cooperation.",
      published: "2024",
      pdfUrl: "/pdfs/PAGB%202024%20(4)___Pakistan-Afghanistan%20Relations%20Relations%20A%20Historical%20Perspective.pdf",
      thumbnail: "/images/thumbnails/article-4.jpg"
    },
    // {
    //   title: "Modi's Neighbourhood First Policy: Implications for Pakistan",
    //   author: "Various Contributors",
    //   date: "2024",
    //   description: "An assessment of India's neighbourhood-first diplomatic strategy and its strategic implications for Pakistan and regional stability.",
    //   published: "2024",
    //   pdfUrl: "/pdfs/PAGB%202024%20(5)___Modi%E2%80%99s%20Neighbourhood%20First%20Policy%20Implications%20for%20Pakistan.pdf",
    //   thumbnail: "/images/thumbnails/article-5.jpg"
    // },
    // // {
    //   title: "Character of Future Military Conflict in Subcontinent",
    //   author: "Various Contributors",
    //   date: "2024",
    //   description: "Exploring the evolving nature of warfare in South Asia, including emerging technologies, hybrid threats, and strategic doctrines.",
    //   published: "2024",
    //   pdfUrl: "/pdfs/PAGB%202024%20(6)___%20Character%20of%20Future%20Character%20Military%20Conflict%20in%20Subcontinent.pdf",
    //   thumbnail: "/images/thumbnails/article-6.jpg"
    // },
    // {
    //   title: "Unravelling the Intriguing Nexus: Socially Disruptive Proxies and Security Milieu of Pakistan",
    //   author: "Various Contributors",
    //   date: "2024",
    //   description: "An analysis of non-state actors, proxy warfare, and their impact on Pakistan's internal security environment.",
    //   published: "2024",
    //   pdfUrl: "/pdfs/PAGB%202024%20(7)___Unravelling%20the%20Intriguing%20Nexus%20Socially%20Disruptive%20Proxies%20%20and%20Security%20Milieu%20of%20Pakistan.pdf",
    //   thumbnail: "/images/thumbnails/article-7.jpg"
    // }
  ];

  const [authors, setAuthors] = useState<Author[]>([]);
  const [authorIndex, setAuthorIndex] = useState<number>(0);
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [policies, setPolicies] = useState<PolicyLink[]>([]);
  const articlesRef = useRef<HTMLDivElement | null>(null);

  // Fetch authors dynamically
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/list-authors');
        const data = await res.json();
        if (!cancelled && data?.authors) {
          setAuthors(data.authors);
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Fetch policies for navigation
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/policies');
        const data = await res.json();
        if (!cancelled && data?.policies) {
          setPolicies(data.policies as PolicyLink[]);
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Fetch stats
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/site-stats');
        const data = await res.json();
        if (!cancelled && data) {
          setStats({
            publishedArticles: Number(data.publishedArticles || 0),
            activeAuthors: Number(data.activeAuthors || 0),
            issuesPublished: Number(data.issuesPublished || 0),
          });
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Fetch random articles
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/random-articles?count=3');
        const data = await res.json();
        if (!cancelled && data?.files && Array.isArray(data.files) && data.files.length > 0) {
          setArticles(data.files);
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const scrollToSection = (sectionId: string) => {
    setEditorialDropdownOpen(false);
    setPoliciesDropdownOpen(false);
    setMobileMenuOpen(false);
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        try {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch {
          const top = element.offsetTop - 100;
          window.scrollTo({ top, behavior: 'smooth' });
        }
        setTimeout(() => {
          const cur = window.pageYOffset;
          const target = element.offsetTop - 100;
          if (Math.abs(cur - target) > 50) window.scrollTo(0, target);
        }, 1000);
      } else {
        window.location.hash = sectionId;
      }
    }, 100);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const loadIssue = async (folder: string) => {
    try {
      const res = await fetch(`/api/list-pdfs?folder=${encodeURIComponent(folder)}`);
      const data = await res.json();
      if (data.files && Array.isArray(data.files)) {
        setArticles(data.files);
        if (typeof window !== 'undefined') {
          const el = articlesRef.current;
          if (el) {
            const headerOffset = 90;
            const elementPosition = el.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = elementPosition - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          }
        }
      }
    } catch (err) {
      console.error('Failed to load issue', err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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
              <Link href="/" className="nav-link active">Home</Link>
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
                      {policies.length === 0 && (
                        <div className="px-4 py-2 text-sm text-gray-500">
                          Policies will be available soon.
                        </div>
                      )}
                      {policies.map((policy) => (
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
              <Link href="#footer" className="nav-link">Contact</Link>
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
                      {policies.length === 0 && (
                        <p className="py-1 text-sm text-gray-600">Policies will be available soon.</p>
                      )}
                      {policies.map((policy) => (
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
                <Link href="#footer" className="nav-link">Contact</Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden" style={{
        background: 'linear-gradient(90deg,rgba(26, 51, 32, 1) 17%, rgba(26, 51, 32, 1) 17%, rgba(25, 92, 17, 1) 52%, rgba(5, 56, 2, 1) 73%, rgba(10, 48, 4, 1) 88%)'
      }}>
        <div className="absolute inset-0">
          <ImageSlider 
            images={[
              "/images/_DSC7755.JPG",
              "/images/_DSC8067.JPG",
              "/images/5.jpg",
              "/images/DSC_2318.JPG",
              "/images/DSC_9542.JPG"
            ]} 
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 py-6 md:py-10 z-10" style={{
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}>
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white text-center" style={{
              fontFamily: 'Cambria, "Arial Bold", sans-serif',
              letterSpacing: '0.02em',
              fontWeight: '700',
              textTransform: 'uppercase',
              lineHeight: '1.1'
            }}>
              PAKISTAN ARMY GREEN BOOK
            </h1>
          </div>
        </div>
      </section>

      {/* Stats */}
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
            <div>
              <p className="text-sm text-gray-600 mt-6 font-bold">ISSN (Print): 2303-9973</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="relative" style={{
        backgroundImage: `url('/images/image.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}>
        <div className="absolute inset-0 bg-white" style={{opacity: 0.20}}></div>
        <div className="relative container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 pl-3 md:pl-6" ref={articlesRef} style={{ scrollMarginTop: 100 }}>
              <div className="mb-8">
                <h2 className="text-3xl font-black mb-2" style={{fontFamily: 'Arial, sans-serif', letterSpacing: '0.02em', fontWeight: '900'}}>
                  ARTICLES
                </h2>
              </div>
              <div className="space-y-8">
                {articles.map((article, index) => (
                  <article key={index} className="flex items-start space-x-8 pb-8 border-b border-gray-200 last:border-b-0">
                    <Link href={article.pdfUrl} target="_blank" className="flex-shrink-0 group ml-1 md:ml-2">
                      <div className="w-32 h-44 rounded shadow-lg overflow-hidden hover:shadow-xl transition-all hover:scale-105 relative bg-white">
                        <img src="/images/icon.png" alt={article.title} className="w-full h-full object-cover absolute inset-0" />
                        <div className="absolute inset-0 bg-orange opacity-0 group-hover:opacity-20 transition-opacity"></div>
                        <div className="absolute top-2 right-2 bg-orange rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <FileText className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </Link>
                    <div className="flex-1 pl-1 md:pl-2">
                      <Link href={article.pdfUrl} target="_blank">
                        <h3 className="text-xl font-bold mb-2 text-gray-900 hover:text-orange transition-colors" style={{fontFamily: 'Georgia, serif', lineHeight: '1.25', fontWeight: '700'}}>
                          {article.title}
                        </h3>
                      </Link>
                      <div className="mb-2">
                        <p className="font-bold text-sm text-gray-700" style={{fontFamily: 'Arial, sans-serif', letterSpacing: '0.02em', fontWeight: '700'}}>
                          {article.author}
                        </p>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed mb-3" style={{fontFamily: 'Arial, sans-serif'}}>
                        {article.description}
                      </p>
                      <Link href={article.pdfUrl} target="_blank" className="inline-flex items-center text-sm font-semibold text-orange hover:text-green transition-colors">
                        <FileText className="w-4 h-4 mr-1" /> Read Full Article (PDF)
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-orange-50 border-2 border-orange rounded p-6 mb-6">
                <div className="flex items-start space-x-2 mb-2">
                  <Award className="w-5 h-5 text-orange flex-shrink-0 mt-1" />
                  <h3 className="font-serif font-bold text-lg text-green">Call for Papers</h3>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  Submit your research on <strong>&#34;Future of Military Technology&#34;</strong>
                </p>
                <p className="text-xs text-gray-600 mb-3">Deadline: March 31, 2025</p>
                <Link href="https://ojs-trial.infinityfreeapp.com/ojs/index.php/pagb-v1i1/login" className="btn-secondary text-sm w-full inline-block text-center">Submit Now</Link>
              </div>
              <div className="mb-12">
                <h3 className="text-2xl font-bold mb-2" style={{color: '#5A6B4A', fontFamily: 'Arial, sans-serif', fontWeight: '700', letterSpacing: '0.02em'}}>
                  ARMY MAGAZINE
                </h3>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 pb-3 border-b-2 border-gray-300" style={{color: '#3A3A3A', fontFamily: 'Arial, sans-serif', fontWeight: '700', letterSpacing: '0.02em'}}>
                  OTHER ISSUES
                </h3>
                <div className="space-y-6 mt-8">
                  <button onClick={() => loadIssue('2024')} className="w-full text-left border border-gray-300 hover:shadow-xl transition-shadow" style={{backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)'}}>
                    <div className="flex">
                      <div className="w-40 flex-shrink-0 relative bg-gradient-to-br from-green-900 to-green-700 overflow-hidden">
                        <img src="/images/icon.png" alt="2024" className="w-full h-full object-cover opacity-60" />
                      </div>
                      <div className="flex-1 p-5">
                        <div className="text-sm text-gray-700 mb-2 font-semibold">2024 EDITION</div>
                        <h4 className="font-bold text-lg leading-tight" style={{color: '#E85D04'}}>PAKISTAN ARMY GREEN BOOK 2024 - COMPLETE ISSUE</h4>
                        <p className="text-xs text-gray-600 mt-2">18 Articles | 145 MB</p>
                      </div>
                    </div>
                  </button>
                  <button onClick={() => loadIssue('2021')} className="w-full text-left border border-gray-300 hover:shadow-xl transition-shadow" style={{backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)'}}>
                    <div className="flex">
                      <div className="w-40 flex-shrink-0 relative bg-gradient-to-br from-green-900 to-green-700 overflow-hidden">
                        <img src="/images/2021 title.png" alt="2021" className="w-full h-full object-cover opacity-60" />
                      </div>
                      <div className="flex-1 p-5">
                        <div className="text-sm text-gray-700 mb-2 font-semibold">2021 EDITION</div>
                        <h4 className="font-bold text-lg leading-tight" style={{color: '#E85D04'}}>PAKISTAN ARMY GREEN BOOK 2021 - COMPLETE ISSUE</h4>
                        <p className="text-xs text-gray-600 mt-2">Multiple Articles</p>
                      </div>
                    </div>
                  </button>
                  <div className="text-center pt-4">
                    <Link href="/archives" className="text-gray-800 font-semibold hover:text-orange transition-colors text-base flex items-center justify-center">
                      View All Issues & Articles <ChevronDown className="w-4 h-4 ml-1 rotate-[-90deg]"/>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links & Recent Issues */}
      {/* <section className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold mb-8" style={{color: '#5A6B4A', fontFamily: 'Georgia, serif', letterSpacing: '0.02em', fontWeight: '700'}}>QUICK LINKS</h2>
              <ul className="space-y-4">
                <li><Link href="/archives" className="flex items-center group"><div className="w-12 h-12 rounded-full bg-orange flex items-center justify-center mr-4"><Globe className="w-6 h-6 text-white" /></div><span className="text-lg text-gray-800 group-hover:text-orange">Browse Archives</span></Link></li>
                <li><Link href="/about" className="flex items-center group"><div className="w-12 h-12 rounded-full bg-orange flex items-center justify-center mr-4"><img src="/images/pagblogo.png" alt="PAGB Logo" className="w-6 h-6 object-contain" /></div><span className="text-lg text-gray-800 group-hover:text-orange">About PAGB</span></Link></li>
                <li><Link href="#footer" className="flex items-center group"><div className="w-12 h-12 rounded-full bg-orange flex items-center justify-center mr-4"><Users className="w-6 h-6 text-white" /></div><span className="text-lg text-gray-800 group-hover:text-orange">Contact Us</span></Link></li>
              </ul>
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-8" style={{color: '#5A6B4A', fontFamily: 'Georgia, serif', letterSpacing: '0.02em', fontWeight: '700'}}>RECENT ISSUES</h2>
              <ul className="space-y-4">
                <li className="border-b border-gray-300 pb-4"><Link href="/issue/2025-01" className="block hover:text-orange"><div className="text-sm text-gray-600 mb-1">January 2025</div><div className="text-lg font-semibold text-green">Vol. 15, Issue 1</div></Link></li>
                <li className="border-b border-gray-300 pb-4"><Link href="/issue/2024-12" className="block hover:text-orange"><div className="text-sm text-gray-600 mb-1">December 2024</div><div className="text-lg font-semibold text-green">Vol. 14, Issue 12</div></Link></li>
                <li className="border-b border-gray-300 pb-4"><Link href="/issue/2024-11" className="block hover:text-orange"><div className="text-sm text-gray-600 mb-1">November 2024</div><div className="text-lg font-semibold text-green">Vol. 14, Issue 11</div></Link></li>
                <li className="pt-2"><Link href="http://localhost:3000/current-issue" className="text-orange font-bold text-lg hover:underline">View All Issues</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </section> */}

      {/* Authors Section - FULLY UPDATED & DYNAMIC */}
      <section id="authors" className="bg-white border-t border-gray-200 py-12">
        <div className="container mx-auto px-4">
          <h2 className="section-heading text-center mb-8">Contributing Authors</h2>

          {authors.length === 0 ? (
            <p className="text-center text-gray-500 text-lg">Loading authors...</p>
          ) : (
            <div className="relative">
              <button
                aria-label="Previous"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition shadow-lg"
                onClick={() => setAuthorIndex(prev => Math.max(0, prev - 1))}
                disabled={authorIndex === 0}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                aria-label="Next"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition shadow-lg"
                onClick={() => setAuthorIndex(prev => Math.min(authors.length - 3, prev + 1))}
                disabled={authorIndex >= authors.length - 3}
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-12">
                {authors.slice(authorIndex, authorIndex + 3).map(author => (
                  <Link
                    key={author.slug}
                    href={`/authors/${author.slug}`}
                    className="block bg-white border border-gray-200 rounded-xl p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
                  >
                    <div className="w-24 h-24 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-5 font-serif text-4xl font-bold shadow-xl">
                      {author.count}
                    </div>
                    <h3 className="font-serif font-bold text-green-700 text-2xl group-hover:text-green-800 transition">
                      {author.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-4 opacity-0 group-hover:opacity-100 transition">
                      View all articles →
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Editorial Board */}
      <section id="editorial-board" className="bg-gray-50 border-t border-gray-200 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12" style={{color: '#3A3A3A', fontFamily: 'Georgia, serif'}}>Editorial Board</h2>
          <div className="max-w-6xl mx-auto space-y-12">
            <div id="leadership">
              <h3 className="text-2xl font-bold mb-6 text-green border-b-2 border-green pb-2">Leadership</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                  <div className="text-sm font-semibold text-orange mb-2">PATRON-IN-CHIEF</div>
                  <h4 className="text-xl font-bold text-gray-900 mb-1">Field Marshal Syed Asim Munir, NI(M), SJ</h4>
                  {/* <p className="text-gray-600">Chief of Army Staff</p> */}
                </div>
                <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                  <div className="text-sm font-semibold text-orange mb-2">PATRON</div>
                  <h4 className="text-xl font-bold text-gray-900 mb-1">Lieutenant General Muhammad Aamer Najam, HI (M)</h4>
                  <p className="text-gray-600">IGT&E</p>
                </div>
                <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                  <div className="text-sm font-semibold text-orange mb-2">Editor-in-Chief</div>
                  <h4 className="text-xl font-bold text-gray-t-gray-900 mb-1">Major General Muhammad Shahid Abro, HI (M)</h4>
                  <p className="text-gray-600">DG HRD Dte</p>
                </div>
              </div>
            </div>

            <div id="editorial-team">
              <h3 className="text-2xl font-bold mb-6 text-green border-b-2 border-green pb-2">Editorial Team</h3>
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm mb-4">
                <div className="text-sm font-semibold text-orange mb-2">EDITOR</div>
                <h4 className="text-xl font-bold text-gray-900">Brigadier Zahid Mehmood Awan</h4>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                <div className="text-sm font-semibold text-orange mb-4">ASSISTANT EDITORS</div>
                <div className="space-y-3">
                  <div className="border-l-4 border-green pl-4"><h5 className="font-bold text-gray-900">Brigadier Dr Shahid Yaqub Abbasi</h5><p className="text-sm text-gray-600">FGE&I Dte, Rawalpindi</p></div>
                  <div className="border-l-4 border-green pl-4"><h5 className="font-bold text-gray-900">Colonel Dr Sayyam Bin Saeed</h5><p className="text-sm text-gray-600">HRD Dte, GHQ</p></div>
                  <div className="border-l-4 border-green pl-4"><h5 className="font-bold text-gray-900">Lieutenant Colonel Dr Zillay Hussain Dar</h5><p className="text-sm text-gray-600">HRD Dte, (GSO-1 PAGB)</p></div>
                  <div className="border-l-4 border-green pl-4"><h5 className="font-bold text-gray-900">Lieutenant Col Dr Qasim Ali Shah</h5><p className="text-sm text-gray-600">ISPR, GHQ</p></div>
                  <div className="border-l-4 border-green pl-4"><h5 className="font-bold text-gray-900">Major Dr Muhammad Irfan</h5><p className="text-sm text-gray-600">Military College Jhelum</p></div>
                </div>
              </div>
            </div>

            <div id="advisory-board">
              <h3 className="text-2xl font-bold mb-6 text-green border-b-2 border-green pb-2">Advisory Board</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded p-4"><h5 className="font-bold text-gray-900">Major General Dr Muhammad Samrez Salik, HI (M), (Retd)</h5></div>
                <div className="bg-white border border-gray-200 rounded p-4"><h5 className="font-bold text-gray-900">Dr Zulfiqar Khan</h5><p className="text-sm text-gray-600">Professor/Dean Faculty of Contemporary Studies, NDU</p></div>
                <div className="bg-white border border-gray-200 rounded p-4"><h5 className="font-bold text-gray-900">Dr Zafar Iqbal Cheema</h5><p className="text-sm text-gray-600">President, Strategic Vision Institute</p></div>
                <div className="bg-white border border-gray-200 rounded p-4"><h5 className="font-bold text-gray-900">Dr Rizwana Karim Abbasi</h5><p className="text-sm text-gray-600">Professor International Relations, NUML</p></div>
                <div className="bg-white border border-gray-200 rounded p-4"><h5 className="font-bold text-gray-900">Dr Syed Waqas Ali Kausar</h5><p className="text-sm text-gray-600">Professor/HOD Government & Public Policy, NUML</p></div>
                <div className="bg-white border border-gray-200 rounded p-4"><h5 className="font-bold text-gray-900">Dr Shaheen Akhtar</h5><p className="text-sm text-gray-600">Professor International Relations, NDU</p></div>
                <div className="bg-white border border-gray-200 rounded p-4"><h5 className="font-bold text-gray-900">Dr Muhammad Sheharyar Khan</h5><p className="text-sm text-gray-600">Associate Professor International Relations, Iqra University</p></div>
                <div className="bg-white border border-gray-200 rounded p-4"><h5 className="font-bold text-gray-900">Dr Sumeera Imran</h5><p className="text-sm text-gray-600">Assistant Professor International Relations, NDU</p></div>
              </div>
            </div>

            <div id="peer-review">
              <h3 className="text-2xl font-bold mb-6 text-green border-b-2 border-green pb-2">Peer Review Committee</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded p-4"><h5 className="font-bold text-gray-900">Dr Lubna Abid Ali</h5><p className="text-sm text-gray-600">Dean Faculty of Contemporary Studies (FCS), NDU</p></div>
                <div className="bg-white border border-gray-200 rounded p-4"><h5 className="font-bold text-gray-900">Dr Maria Saifuddin Effendi</h5><p className="text-sm text-gray-600">Assistant Professor Peace & Conflict Studies, NDU</p></div>
                <div className="bg-white border border-gray-200 rounded p-4"><h5 className="font-bold text-gray-900">Brig Dr Saif Ur Rehman, TI (M), (Retd)</h5><p className="text-sm text-gray-600">Regional Director NUML, Peshawar</p></div>
                <div className="bg-white border border-gray-200 rounded p-4"><h5 className="font-bold text-gray-900">Dr Muhammad Bashir Khan</h5><p className="text-sm text-gray-600">Professor Govt & Public Policy, NDU</p></div>
                <div className="bg-white border border-gray-200 rounded p-4"><h5 className="font-bold text-gray-900">Dr Muhammad Riaz Shad</h5><p className="text-sm text-gray-600">Professor/Head of Department International Relations, NUML</p></div>
                <div className="bg-white border border-gray-200 rounded p-4"><h5 className="font-bold text-gray-900">Dr Asma Shakir Khawaja</h5><p className="text-sm text-gray-600">Executive Director, CISS AJ&K</p></div>
                <div className="bg-white border border-gray-200 rounded p-4"><h5 className="font-bold text-gray-900">Dr Rubina Waseem</h5><p className="text-sm text-gray-600">Department of Strategic Studies, NDU</p></div>
                <div className="bg-white border border-gray-200 rounded p-4"><h5 className="font-bold text-gray-900">Brig Dr Abdul Rauf</h5><p className="text-sm text-gray-600">Director Special Plans, C&IT Br, GHQ</p></div>
                <div className="bg-white border border-gray-200 rounded p-4"><h5 className="font-bold text-gray-900">Brig Dr Muhammad Farooq</h5><p className="text-sm text-gray-600">Director B Wing, HRD Dte, GHQ</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
                <li><Link href="/submission" className="text-gray-300 hover:text-white">Submission Guidelines</Link></li>
                <li>
                  <a 
                    href="#editorial-board" 
                    className="text-gray-300 hover:text-white cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById('editorial-board');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    Editorial Board
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-serif font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-gray-300 hover:text-white">About PAGB</Link></li>
                <li><Link href="/faq" className="text-gray-300 hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-serif font-bold mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start"><Globe className="w-4 h-4 mr-2 mt-0.5" /><span>Pakistan Army GHQ, Rawalpindi, Pakistan</span></li>
                <li className="flex items-start"><Mail className="w-4 h-4 mr-2 mt-0.5" /><span className="mr-2">email</span><a href="mailto:senduspagb@gmail.com" className="hover:text-white">senduspagb@gmail.com</a></li>
                <li className="flex items-start"><Phone className="w-4 h-4 mr-2 mt-0.5" /><span className="mr-2">phone</span><span>+92 (051) 5202339</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
              <p>© {new Date().getFullYear()} Pakistan Army Green Book. All rights reserved.</p>
              <div className="flex space-x-4 mt-4 md:mt-0">
                <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
                <span>|</span>
                <Link href="/terms" className="hover:text-white">Terms of Use</Link>
                <span>|</span>
                <Link href="/accessibility" className="hover:text-white">Accessibility</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}