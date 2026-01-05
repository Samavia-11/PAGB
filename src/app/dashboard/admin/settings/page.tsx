'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft, Settings, Save } from 'lucide-react';

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
}

interface JournalSettings {
  // General Settings
  journalName: string;
  journalAbbreviation: string;
  issn: string;
  eissn: string;
  publisher: string;
  contactEmail: string;
  websiteUrl: string;
  
  // Submission Settings
  allowSubmissions: boolean;
  requireAbstract: boolean;
  minAbstractWords: number;
  maxAbstractWords: number;
  requireKeywords: boolean;
  minKeywords: number;
  maxKeywords: number;
  allowedFileTypes: string;
  maxFileSize: number;
  
  // Review Settings
  reviewType: 'single-blind' | 'double-blind' | 'open';
  reviewDeadlineDays: number;
  minReviewersPerArticle: number;
  maxReviewersPerArticle: number;
  
  // Publication Settings
  articlesPerIssue: number;
  issuesPerYear: number;
  currentVolume: number;
  currentIssue: number;
  publicationFrequency: string;
}

const JournalSettingsPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<JournalSettings>({
    journalName: 'Army Journal of Military Research',
    journalAbbreviation: 'AJMR',
    issn: '1234-5678',
    eissn: '8765-4321',
    publisher: 'Military Academic Press',
    contactEmail: 'editor@armyjournal.com',
    websiteUrl: 'https://armyjournal.com',
    
    allowSubmissions: true,
    requireAbstract: true,
    minAbstractWords: 150,
    maxAbstractWords: 300,
    requireKeywords: true,
    minKeywords: 3,
    maxKeywords: 6,
    allowedFileTypes: '.pdf, .doc, .docx',
    maxFileSize: 10,
    
    reviewType: 'double-blind',
    reviewDeadlineDays: 21,
    minReviewersPerArticle: 2,
    maxReviewersPerArticle: 3,
    
    articlesPerIssue: 8,
    issuesPerYear: 4,
    currentVolume: 15,
    currentIssue: 2,
    publicationFrequency: 'Quarterly'
  });
  
  const router = useRouter();

  useEffect(() => {
    checkAuth();
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

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

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
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/admin')}
          className="flex items-center text-primary-600 hover:text-primary-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Settings className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-academic-900 font-serif">Journal Settings</h1>
              <p className="text-academic-600 mt-1">Configure journal information and policies</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* General Information */}
        <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
          <h2 className="text-xl font-semibold text-academic-900 mb-4">General Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-academic-700 mb-2">
                Journal Name
              </label>
              <input
                type="text"
                value={settings.journalName}
                onChange={(e) => setSettings({ ...settings, journalName: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-academic-700 mb-2">
                Abbreviation
              </label>
              <input
                type="text"
                value={settings.journalAbbreviation}
                onChange={(e) => setSettings({ ...settings, journalAbbreviation: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-academic-700 mb-2">
                ISSN (Print)
              </label>
              <input
                type="text"
                value={settings.issn}
                onChange={(e) => setSettings({ ...settings, issn: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-academic-700 mb-2">
                eISSN (Online)
              </label>
              <input
                type="text"
                value={settings.eissn}
                onChange={(e) => setSettings({ ...settings, eissn: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-academic-700 mb-2">
                Publisher
              </label>
              <input
                type="text"
                value={settings.publisher}
                onChange={(e) => setSettings({ ...settings, publisher: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-academic-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-academic-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={settings.websiteUrl}
                onChange={(e) => setSettings({ ...settings, websiteUrl: e.target.value })}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Submission Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
          <h2 className="text-xl font-semibold text-academic-900 mb-4">Submission Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowSubmissions"
                checked={settings.allowSubmissions}
                onChange={(e) => setSettings({ ...settings, allowSubmissions: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-academic-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="allowSubmissions" className="ml-2 text-sm text-academic-700">
                Allow new submissions
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireAbstract"
                  checked={settings.requireAbstract}
                  onChange={(e) => setSettings({ ...settings, requireAbstract: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-academic-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="requireAbstract" className="ml-2 text-sm text-academic-700">
                  Require abstract
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireKeywords"
                  checked={settings.requireKeywords}
                  onChange={(e) => setSettings({ ...settings, requireKeywords: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-academic-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="requireKeywords" className="ml-2 text-sm text-academic-700">
                  Require keywords
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">
                  Min Abstract Words
                </label>
                <input
                  type="number"
                  value={settings.minAbstractWords}
                  onChange={(e) => setSettings({ ...settings, minAbstractWords: parseInt(e.target.value) })}
                  className="form-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">
                  Max Abstract Words
                </label>
                <input
                  type="number"
                  value={settings.maxAbstractWords}
                  onChange={(e) => setSettings({ ...settings, maxAbstractWords: parseInt(e.target.value) })}
                  className="form-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">
                  Min Keywords
                </label>
                <input
                  type="number"
                  value={settings.minKeywords}
                  onChange={(e) => setSettings({ ...settings, minKeywords: parseInt(e.target.value) })}
                  className="form-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">
                  Max Keywords
                </label>
                <input
                  type="number"
                  value={settings.maxKeywords}
                  onChange={(e) => setSettings({ ...settings, maxKeywords: parseInt(e.target.value) })}
                  className="form-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">
                  Allowed File Types
                </label>
                <input
                  type="text"
                  value={settings.allowedFileTypes}
                  onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value })}
                  className="form-input"
                  placeholder=".pdf, .doc, .docx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">
                  Max File Size (MB)
                </label>
                <input
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings({ ...settings, maxFileSize: parseInt(e.target.value) })}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Review Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
          <h2 className="text-xl font-semibold text-academic-900 mb-4">Review Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-academic-700 mb-2">
                Review Type
              </label>
              <select
                value={settings.reviewType}
                onChange={(e) => setSettings({ ...settings, reviewType: e.target.value as any })}
                className="form-input"
              >
                <option value="single-blind">Single-Blind</option>
                <option value="double-blind">Double-Blind</option>
                <option value="open">Open Review</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-academic-700 mb-2">
                Review Deadline (Days)
              </label>
              <input
                type="number"
                value={settings.reviewDeadlineDays}
                onChange={(e) => setSettings({ ...settings, reviewDeadlineDays: parseInt(e.target.value) })}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-academic-700 mb-2">
                Min Reviewers per Article
              </label>
              <input
                type="number"
                value={settings.minReviewersPerArticle}
                onChange={(e) => setSettings({ ...settings, minReviewersPerArticle: parseInt(e.target.value) })}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-academic-700 mb-2">
                Max Reviewers per Article
              </label>
              <input
                type="number"
                value={settings.maxReviewersPerArticle}
                onChange={(e) => setSettings({ ...settings, maxReviewersPerArticle: parseInt(e.target.value) })}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Publication Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
          <h2 className="text-xl font-semibold text-academic-900 mb-4">Publication Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-academic-700 mb-2">
                Articles per Issue
              </label>
              <input
                type="number"
                value={settings.articlesPerIssue}
                onChange={(e) => setSettings({ ...settings, articlesPerIssue: parseInt(e.target.value) })}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-academic-700 mb-2">
                Issues per Year
              </label>
              <input
                type="number"
                value={settings.issuesPerYear}
                onChange={(e) => setSettings({ ...settings, issuesPerYear: parseInt(e.target.value) })}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-academic-700 mb-2">
                Current Volume
              </label>
              <input
                type="number"
                value={settings.currentVolume}
                onChange={(e) => setSettings({ ...settings, currentVolume: parseInt(e.target.value) })}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-academic-700 mb-2">
                Current Issue
              </label>
              <input
                type="number"
                value={settings.currentIssue}
                onChange={(e) => setSettings({ ...settings, currentIssue: parseInt(e.target.value) })}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-academic-700 mb-2">
                Publication Frequency
              </label>
              <select
                value={settings.publicationFrequency}
                onChange={(e) => setSettings({ ...settings, publicationFrequency: e.target.value })}
                className="form-input"
              >
                <option value="Monthly">Monthly</option>
                <option value="Bi-Monthly">Bi-Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Semi-Annual">Semi-Annual</option>
                <option value="Annual">Annual</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JournalSettingsPage;
