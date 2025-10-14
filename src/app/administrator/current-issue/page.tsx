'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateNewIssue() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [homeDropdown, setHomeDropdown] = useState(false);
  const [mediaDropdown, setMediaDropdown] = useState(false);
  const [aboutDropdown, setAboutDropdown] = useState(false);
  const [formData, setFormData] = useState({
    volume: '',
    issueDate: '',
    issue: '',
    abstract: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'administrator') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          createdBy: user.id,
          status: 'published',
          publishedAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        alert('Issue published successfully!');
        setFormData({
          volume: '',
          issueDate: '',
          issue: '',
          abstract: ''
        });
        router.push('/administrator/dashboard');
      } else {
        alert('Failed to publish issue. Please try again.');
      }
    } catch (error) {
      console.error('Error publishing issue:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/administrator/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Navigation - Fixed/Sticky */}
      <div className="w-64 bg-green-700 text-white flex flex-col fixed h-full overflow-y-auto">
        {/* Logo Section */}
        <div className="p-6 border-b border-green-600">
          <div className="flex items-center space-x-3">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <span className="text-xl font-bold">PAGB Journal</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {/* Home with Dropdown */}
            <li>
              <div>
                <button 
                  onClick={() => setHomeDropdown(!homeDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />
                    </svg>
                    <span>Home</span>
                  </div>
                  <svg className={`w-4 h-4 transform transition-transform ${homeDropdown ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                  </svg>
                </button>
                {homeDropdown && (
                  <div className="ml-6 mt-2 space-y-1">
                    <Link href="/administrator/journal" className="block px-4 py-2 text-sm text-green-200 hover:text-white hover:bg-green-600 rounded transition-colors">
                      Journal
                    </Link>
                    <Link href="/administrator/featured-authors" className="block px-4 py-2 text-sm text-green-200 hover:text-white hover:bg-green-600 rounded transition-colors">
                      Featured Authors
                    </Link>
                  </div>
                )}
              </div>
            </li>
            
            <li>
              <Link href="/administrator/current-issue" className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-green-600 text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                <span>Current Issue</span>
              </Link>
            </li>
            
            <li>
              <Link href="/administrator/archives" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-green-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3,3H21V7H3V3M4,8H20V21H4V8M9.5,11A0.5,0.5 0 0,0 9,11.5V13H15V11.5A0.5,0.5 0 0,0 14.5,11H9.5Z" />
                </svg>
                <span>Archives</span>
              </Link>
            </li>
            
            <li>
              <Link href="/administrator/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-green-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z" />
                </svg>
                <span>Dashboard</span>
              </Link>
            </li>
            
            <li>
              <Link href="/administrator/user-requests" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-green-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16,4C18.11,4 19.99,5.89 19.99,8C19.99,10.11 18.11,12 16,12C13.89,12 12,10.11 12,8C12,5.89 13.89,4 16,4M16,14C20.42,14 24,15.79 24,18V20H8V18C8,15.79 11.58,14 16,14M6,6V9H4V6H1V4H4V1H6V4H9V6H6M6,13V16H4V13H1V11H4V8H6V11H9V13H6Z" />
                </svg>
                <span>User Requests</span>
              </Link>
            </li>
            
            <li>
              <Link href="/administrator/authors" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-green-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                </svg>
                <span>Authors</span>
              </Link>
            </li>

            {/* Media with Dropdown */}
            <li>
              <div>
                <button 
                  onClick={() => setMediaDropdown(!mediaDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3,3H21V7H3V3M4,8H20V21H4V8M9.5,11A0.5,0.5 0 0,0 9,11.5V13H15V11.5A0.5,0.5 0 0,0 14.5,11H9.5Z" />
                    </svg>
                    <span>Media</span>
                  </div>
                  <svg className={`w-4 h-4 transform transition-transform ${mediaDropdown ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                  </svg>
                </button>
                {mediaDropdown && (
                  <div className="ml-6 mt-2 space-y-1">
                    <Link href="/administrator/media/news" className="block px-4 py-2 text-sm text-green-200 hover:text-white hover:bg-green-600 rounded transition-colors">
                      News
                    </Link>
                    <Link href="/administrator/media/events" className="block px-4 py-2 text-sm text-green-200 hover:text-white hover:bg-green-600 rounded transition-colors">
                      Events
                    </Link>
                    <Link href="/administrator/media/gallery" className="block px-4 py-2 text-sm text-green-200 hover:text-white hover:bg-green-600 rounded transition-colors">
                      Gallery
                    </Link>
                    <Link href="/administrator/media/publications" className="block px-4 py-2 text-sm text-green-200 hover:text-white hover:bg-green-600 rounded transition-colors">
                      Publications
                    </Link>
                  </div>
                )}
              </div>
            </li>
            
            <li>
              <Link href="/administrator/careers" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-green-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                </svg>
                <span>Careers</span>
              </Link>
            </li>

            {/* About with Dropdown */}
            <li>
              <div>
                <button 
                  onClick={() => setAboutDropdown(!aboutDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" />
                    </svg>
                    <span>About</span>
                  </div>
                  <svg className={`w-4 h-4 transform transition-transform ${aboutDropdown ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                  </svg>
                </button>
                {aboutDropdown && (
                  <div className="ml-6 mt-2 space-y-1">
                    <Link href="/administrator/about/mission" className="block px-4 py-2 text-sm text-green-200 hover:text-white hover:bg-green-600 rounded transition-colors">
                      Our Mission
                    </Link>
                    <Link href="/administrator/about/contact" className="block px-4 py-2 text-sm text-green-200 hover:text-white hover:bg-green-600 rounded transition-colors">
                      Contact Information
                    </Link>
                  </div>
                )}
              </div>
            </li>
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-green-600">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold">A</span>
            </div>
            <div>
              <p className="text-sm font-medium">Administrator User</p>
              <p className="text-xs text-green-200">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-green-200 hover:text-white transition-colors text-sm ml-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Top Header */}
        <header className="bg-green-600 text-white px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                <span className="text-lg font-medium">PAGB Journal</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles, authors, keywords..."
                  className="w-80 px-4 py-2 pl-10 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-white text-sm border-0"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <select className="bg-white text-gray-700 px-3 py-1.5 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-white appearance-none pr-8">
                  <option>Forest</option>
                </select>
                <svg className="absolute right-2 top-2 w-4 h-4 text-gray-500 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                </svg>
              </div>
              <button className="p-2 hover:bg-green-500 rounded transition-colors">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21" />
                </svg>
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Administrator User</span>
                <button className="p-1 hover:bg-green-500 rounded transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Create New Issue Form */}
        <main className="flex-1 p-6 bg-gray-100">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Issue</h1>
            
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8">
              {/* Volume Field */}
              <div className="mb-6">
                <label htmlFor="volume" className="block text-sm font-medium text-gray-700 mb-2">
                  Volume
                </label>
                <input
                  type="text"
                  id="volume"
                  name="volume"
                  value={formData.volume}
                  onChange={handleInputChange}
                  placeholder="e.g., 16"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              {/* Issue Date Field */}
              <div className="mb-6">
                <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="issueDate"
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleInputChange}
                    placeholder="dd/mm/yyyy"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10"
                    required
                  />
                  <svg className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z" />
                  </svg>
                </div>
              </div>

              {/* Issue Title Field */}
              <div className="mb-6">
                <label htmlFor="issue" className="block text-sm font-medium text-gray-700 mb-2">
                  Issue
                </label>
                <input
                  type="text"
                  id="issue"
                  name="issue"
                  value={formData.issue}
                  onChange={handleInputChange}
                  placeholder="Write the issue title here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              {/* Abstract Field */}
              <div className="mb-8">
                <label htmlFor="abstract" className="block text-sm font-medium text-gray-700 mb-2">
                  Abstract
                </label>
                <textarea
                  id="abstract"
                  name="abstract"
                  value={formData.abstract}
                  onChange={handleInputChange}
                  placeholder="Write a brief abstract for this issue..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Issue'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
