'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Issue {
  id: string;
  volume: string;
  issue: string;
  issueDate: string;
  abstract: string;
  editorInChief: string;
  associateEditor: string;
  managingEditor: string;
  issnPrint: string;
  issnOnline: string;
  publisher: string;
  frequency: string;
  language: string;
  status: string;
  publishedAt: string;
  createdAt: string;
}

export default function CurrentIssueDisplay() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [homeDropdown, setHomeDropdown] = useState(false);

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
    loadIssues();

    // Set up real-time updates - check for new issues every 2 seconds
    const interval = setInterval(() => {
      loadIssues();
    }, 2000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [router]);

  const loadIssues = () => {
    try {
      const publishedIssues = JSON.parse(localStorage.getItem('publishedIssues') || '[]');
      setIssues(publishedIssues); // Load all published issues
    } catch (error) {
      console.error('Error loading issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const handleDownloadPDF = (issue: Issue) => {
    // Create a PDF-like content for the issue
    const pdfContent = `
PAGB Journal - Volume ${issue.volume}, Issue ${issue.issue}
Published: ${formatDate(issue.issueDate)}

ABSTRACT
${issue.abstract}

EDITORIAL BOARD
Editor-in-Chief: ${issue.editorInChief}
Associate Editor: ${issue.associateEditor}
Managing Editor: ${issue.managingEditor}

PUBLICATION DETAILS
ISSN (Print): ${issue.issnPrint}
ISSN (Online): ${issue.issnOnline}
Publisher: ${issue.publisher}
Frequency: ${issue.frequency}
Language: ${issue.language}

Published At: ${new Date(issue.publishedAt).toLocaleString()}
    `;

    // Create a blob and download it
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PAGB_Journal_Vol${issue.volume}_Issue${issue.issue}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleViewOnline = (issue: Issue) => {
    // Create a new window/tab with the issue content
    const issueContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PAGB Journal - Volume ${issue.volume}, Issue ${issue.issue}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        .header { background: #16a34a; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .section { margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .section h3 { color: #16a34a; margin-top: 0; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 600px) { .grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>PAGB Journal</h1>
        <h2>Volume ${issue.volume}, Issue ${issue.issue}</h2>
        <p>Published: ${formatDate(issue.issueDate)}</p>
    </div>
    
    <div class="section">
        <h3>Abstract</h3>
        <p>${issue.abstract}</p>
    </div>
    
    <div class="grid">
        <div class="section">
            <h3>Editorial Board</h3>
            <p><strong>Editor-in-Chief:</strong> ${issue.editorInChief}</p>
            <p><strong>Associate Editor:</strong> ${issue.associateEditor}</p>
            <p><strong>Managing Editor:</strong> ${issue.managingEditor}</p>
        </div>
        
        <div class="section">
            <h3>Publication Details</h3>
            <p><strong>ISSN:</strong> ${issue.issnPrint} (Print), ${issue.issnOnline} (Online)</p>
            <p><strong>Publisher:</strong> ${issue.publisher}</p>
            <p><strong>Frequency:</strong> ${issue.frequency}</p>
            <p><strong>Language:</strong> ${issue.language}</p>
        </div>
    </div>
    
    <div class="section">
        <h3>Publication Information</h3>
        <p><strong>Published At:</strong> ${new Date(issue.publishedAt).toLocaleString()}</p>
        <p><strong>Created At:</strong> ${new Date(issue.createdAt).toLocaleString()}</p>
    </div>
</body>
</html>
    `;

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(issueContent);
      newWindow.document.close();
    }
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
      {/* Sidebar Navigation - Same as your existing sidebar */}
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
              <Link href="/administrator/current-issue/display" className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-green-600 text-white">
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

            <li>
              <Link href="/administrator/about" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-green-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" />
                </svg>
                <span>About</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-green-600">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">A</span>
            </div>
            <div>
              <p className="text-sm font-medium">administrator</p>
              <p className="text-xs text-green-200">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-green-200 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
            </svg>
            <span className="text-sm">Logout</span>
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
                <span className="text-sm font-medium">{user?.name || 'administrator'}</span>
                <button 
                  onClick={handleLogout}
                  className="p-1 hover:bg-green-500 rounded transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Display Content */}
        <main className="flex-1 p-8 bg-gray-100">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Published Issues</h1>
          <p className="text-gray-600">View all published journal issues (latest first)</p>
        </div>

        {/* Issues List */}
        {issues.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Issues Published</h2>
            <p className="text-gray-600 mb-6">There are no published issues yet. Create a new issue to get started.</p>
            <button
              onClick={() => router.push('/administrator/current-issue/form')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Create New Issue
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {issues.map((issue, index) => (
              <div key={issue.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Issue Header */}
                <div className="bg-green-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        Volume {issue.volume}, Issue {issue.issue}
                      </h2>
                      <div className="flex items-center space-x-4 text-green-100">
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z" />
                          </svg>
                          <span>{formatDate(issue.issueDate)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
                          </svg>
                          <span>Published</span>
                        </span>
                      </div>
                    </div>
                    {index === 0 && (
                      <div className="bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium">
                        Latest Issue
                      </div>
                    )}
                  </div>
                  <p className="mt-4 text-green-100 leading-relaxed">
                    {issue.abstract}
                  </p>
                </div>

                {/* Issue Information */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Editorial Board */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Editorial Board</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium text-green-700">Editor-in-Chief:</span>
                          <span className="ml-2 text-gray-700">{issue.editorInChief}</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-700">Associate Editor:</span>
                          <span className="ml-2 text-gray-700">{issue.associateEditor}</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-700">Managing Editor:</span>
                          <span className="ml-2 text-gray-700">{issue.managingEditor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Publication Details */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Publication Details</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium text-green-700">ISSN:</span>
                          <span className="ml-2 text-gray-700">{issue.issnPrint} (Print), {issue.issnOnline} (Online)</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-700">Publisher:</span>
                          <span className="ml-2 text-gray-700">{issue.publisher}</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-700">Frequency:</span>
                          <span className="ml-2 text-gray-700">{issue.frequency}</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-700">Language:</span>
                          <span className="ml-2 text-gray-700">{issue.language}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Issue Actions */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex space-x-4">
                      <button 
                        onClick={() => handleDownloadPDF(issue)}
                        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                        <span>Download PDF</span>
                      </button>
                      <button 
                        onClick={() => handleViewOnline(issue)}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                        </svg>
                        <span>View Online</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </main>
      </div>
    </div>
  );
}
