'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { 
  Users, 
  Search, 
  Mail, 
  BookOpen, 
  Award, 
  MapPin,
  Calendar,
  Filter,
  ChevronDown
} from 'lucide-react';

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
}

interface Author {
  id: number;
  name: string;
  email: string;
  affiliation: string;
  specialization: string[];
  publications_count: number;
  latest_publication: string;
  bio: string;
  location: string;
  joined_date: string;
}

const AuthorsPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadAuthors();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.user.role !== 'administrator') {
          router.push('/');
          return;
        }
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadAuthors = async () => {
    // Mock data for authors
    const mockAuthors: Author[] = [
      {
        id: 1,
        name: "Col. John Smith",
        email: "j.smith@military.edu",
        affiliation: "U.S. Army War College",
        specialization: ["Military Strategy", "Digital Warfare", "Leadership"],
        publications_count: 15,
        latest_publication: "Modern Military Strategy in Digital Warfare",
        bio: "Colonel Smith is a distinguished military strategist with over 20 years of experience in defense planning and digital warfare operations.",
        location: "Carlisle, PA",
        joined_date: "2020-03-15"
      },
      {
        id: 2,
        name: "Dr. Sarah Johnson",
        email: "s.johnson@techdefense.org",
        affiliation: "Defense Technology Institute",
        specialization: ["Cybersecurity", "Information Warfare", "Technology"],
        publications_count: 12,
        latest_publication: "Cybersecurity Frameworks for Military Networks",
        bio: "Dr. Johnson is a leading expert in military cybersecurity with extensive research in network defense and threat analysis.",
        location: "Washington, DC",
        joined_date: "2019-08-22"
      },
      {
        id: 3,
        name: "Maj. Gen. Robert Davis",
        email: "r.davis@leadership.mil",
        affiliation: "Joint Staff College",
        specialization: ["Leadership", "Crisis Management", "Joint Operations"],
        publications_count: 8,
        latest_publication: "Leadership Development in Contemporary Armed Forces",
        bio: "Major General Davis has served in various leadership roles and specializes in crisis management and joint military operations.",
        location: "Norfolk, VA",
        joined_date: "2021-01-10"
      },
      {
        id: 4,
        name: "Dr. Michael Chen",
        email: "m.chen@logistics.edu",
        affiliation: "Military Logistics University",
        specialization: ["Logistics", "Supply Chain", "Operations Research"],
        publications_count: 10,
        latest_publication: "Logistics Optimization in Joint Operations",
        bio: "Dr. Chen is a renowned expert in military logistics and supply chain optimization with a focus on joint operations efficiency.",
        location: "Fort Lee, VA",
        joined_date: "2020-11-05"
      },
      {
        id: 5,
        name: "Lt. Col. Maria Rodriguez",
        email: "m.rodriguez@training.mil",
        affiliation: "Advanced Training Command",
        specialization: ["Training", "Professional Development", "Leadership"],
        publications_count: 6,
        latest_publication: "Advanced Training Methodologies for Special Forces",
        bio: "Lieutenant Colonel Rodriguez specializes in advanced military training programs and professional development initiatives.",
        location: "Fort Bragg, NC",
        joined_date: "2022-02-18"
      }
    ];
    setAuthors(mockAuthors);
  };

  const filteredAuthors = authors.filter(author => {
    const matchesSearch = author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         author.affiliation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         author.specialization.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSpecialization = selectedSpecialization === 'all' || 
                                 author.specialization.includes(selectedSpecialization);
    
    return matchesSearch && matchesSpecialization;
  });

  const allSpecializations = Array.from(new Set(authors.flatMap(author => author.specialization))).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-academic-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-academic-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-academic-900 font-serif mb-4">Authors Directory</h1>
        <p className="text-academic-600 max-w-3xl">
          Discover our community of distinguished military professionals, researchers, and subject matter experts 
          who contribute to advancing our knowledge and professional development.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-academic-400" />
              <input
                type="text"
                placeholder="Search authors by name, affiliation, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 form-input"
              />
            </div>
          </div>

          {/* Specialization Filter */}
          <div className="relative">
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="form-input pr-8 appearance-none min-w-[200px]"
            >
              <option value="all">All Specializations</option>
              {allSpecializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-academic-400 pointer-events-none" />
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 pt-4 border-t border-academic-200">
          <p className="text-sm text-academic-600">
            Showing {filteredAuthors.length} of {authors.length} authors
          </p>
        </div>
      </div>

      {/* Authors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAuthors.map((author) => (
          <div key={author.id} className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
            {/* Author Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-xl font-bold text-primary-700">
                    {author.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-academic-900">{author.name}</h3>
                  <p className="text-academic-600 text-sm">{author.affiliation}</p>
                  <div className="flex items-center text-academic-500 text-sm mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{author.location}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                  {author.publications_count} Publications
                </div>
              </div>
            </div>

            {/* Bio */}
            <p className="text-academic-700 text-sm mb-4 line-clamp-3">{author.bio}</p>

            {/* Specializations */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-academic-700 mb-2">Specializations:</h4>
              <div className="flex flex-wrap gap-2">
                {author.specialization.map((spec, idx) => (
                  <span
                    key={idx}
                    className="bg-primary-50 text-primary-700 px-2 py-1 rounded text-xs font-medium"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Latest Publication */}
            <div className="mb-4 p-3 bg-academic-50 rounded-lg">
              <h4 className="text-sm font-medium text-academic-700 mb-1">Latest Publication:</h4>
              <p className="text-sm text-academic-600">{author.latest_publication}</p>
            </div>

            {/* Stats and Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-academic-200">
              <div className="flex items-center text-sm text-academic-500">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Joined {new Date(author.joined_date).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2">
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
                  <Mail className="w-3 h-3 mr-1" />
                  Contact
                </button>
                <button className="text-academic-600 hover:text-academic-700 text-sm font-medium flex items-center">
                  <BookOpen className="w-3 h-3 mr-1" />
                  Publications
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No results */}
      {filteredAuthors.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-academic-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-academic-900 mb-2">No authors found</h3>
          <p className="text-academic-500 mb-6">
            Try adjusting your search terms or filters to find what you&apos;re looking for.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSpecialization('all');
            }}
            className="btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Author Statistics */}
      <div className="mt-12 bg-white rounded-lg shadow-sm border border-academic-200 p-8">
        <h2 className="text-2xl font-bold text-academic-900 font-serif mb-6">Author Community Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">{authors.length}</div>
            <div className="text-academic-600">Total Authors</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {authors.reduce((sum, author) => sum + author.publications_count, 0)}
            </div>
            <div className="text-academic-600">Total Publications</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {allSpecializations.length}
            </div>
            <div className="text-academic-600">Specialization Areas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {Array.from(new Set(authors.map(a => a.affiliation))).length}
            </div>
            <div className="text-academic-600">Institutions</div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuthorsPage;
