'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateIssuePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    volume: '',
    issueDate: '',
    issue: '',
    abstract: '',
    editorInChief: '',
    associateEditor: '',
    managingEditor: '',
    issnPrint: '',
    issnOnline: '',
    publisher: '',
    frequency: '',
    language: ''
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      // Create new issue object
      const newIssue = {
        id: Date.now().toString(),
        ...formData,
        createdBy: user?.id || 'admin',
        status: 'published',
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      // Get existing issues from localStorage
      const existingIssues = JSON.parse(localStorage.getItem('publishedIssues') || '[]');
      
      // Add new issue to the beginning of the array
      const updatedIssues = [newIssue, ...existingIssues];
      
      // Save back to localStorage
      localStorage.setItem('publishedIssues', JSON.stringify(updatedIssues));

      alert('Issue published successfully!');
      
      // Reset form
      setFormData({
        volume: '',
        issueDate: '',
        issue: '',
        abstract: '',
        editorInChief: '',
        associateEditor: '',
        managingEditor: '',
        issnPrint: '',
        issnOnline: '',
        publisher: '',
        frequency: '',
        language: ''
      });

      // Redirect to display page to see the published issue
      router.push('/administrator/current-issue/display');
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
      {/* Sidebar Navigation */}
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
            <li>
              <Link href="/administrator/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-green-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />
                </svg>
                <span>Home</span>
              </Link>
            </li>
            
            <li>
              <Link href="/administrator/current-issue" className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-green-600 text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                <span>Current Issue</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-green-600">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">{user?.name?.charAt(0) || 'A'}</span>
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name || 'Administrator'}</p>
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
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        <main className="max-w-6xl mx-auto">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Issue</h1>
            
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8">
              {/* Volume Field */}
              <div className="mb-6">
                <label htmlFor="volume" className="block text-sm font-medium text-gray-700 mb-2">
                  Volume Number <span className="text-red-500">*</span>
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
                  Issue Date <span className="text-red-500">*</span>
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
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z" />
                  </svg>
                </div>
              </div>

              {/* Issue Title Field */}
              <div className="mb-6">
                <label htmlFor="issue" className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Title <span className="text-red-500">*</span>
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
                  Abstract <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="abstract"
                  name="abstract"
                  value={formData.abstract}
                  onChange={handleInputChange}
                  placeholder="Write a brief abstract for this issue..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-vertical"
                  required
                />
              </div>

              {/* Editorial Board Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Editorial Board</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="editorInChief" className="block text-sm font-medium text-gray-700 mb-2">
                      Editor-in-Chief <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="editorInChief"
                      name="editorInChief"
                      value={formData.editorInChief}
                      onChange={handleInputChange}
                      placeholder="e.g., Gen. William Thompson"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="associateEditor" className="block text-sm font-medium text-gray-700 mb-2">
                      Associate Editor <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="associateEditor"
                      name="associateEditor"
                      value={formData.associateEditor}
                      onChange={handleInputChange}
                      placeholder="e.g., Dr. Margaret Davis"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="managingEditor" className="block text-sm font-medium text-gray-700 mb-2">
                      Managing Editor <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="managingEditor"
                      name="managingEditor"
                      value={formData.managingEditor}
                      onChange={handleInputChange}
                      placeholder="e.g., Col. James Wilson"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Publication Details Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Publication Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="issnPrint" className="block text-sm font-medium text-gray-700 mb-2">
                      ISSN (Print) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="issnPrint"
                      name="issnPrint"
                      value={formData.issnPrint}
                      onChange={handleInputChange}
                      placeholder="e.g., 1234-5678"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="issnOnline" className="block text-sm font-medium text-gray-700 mb-2">
                      ISSN (Online) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="issnOnline"
                      name="issnOnline"
                      value={formData.issnOnline}
                      onChange={handleInputChange}
                      placeholder="e.g., 9876-5432"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="publisher" className="block text-sm font-medium text-gray-700 mb-2">
                      Publisher <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="publisher"
                      name="publisher"
                      value={formData.publisher}
                      onChange={handleInputChange}
                      placeholder="e.g., Army Journal Publications"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="frequency"
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    >
                      <option value="">Select frequency</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Bi-annual">Bi-annual</option>
                      <option value="Annual">Annual</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                      Language <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="language"
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      placeholder="e.g., English"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>
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
