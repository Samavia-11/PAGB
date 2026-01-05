'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import {
  FileText,
  Clock,
  ArrowRight,
  Users,
  Inbox,
  History,
  Send,
} from 'lucide-react';

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
}

interface Submission {
  id: number;
  title: string;
  author_name: string;
  author_id?: number;
  submitted_at: string;
  status: 'new' | 'revision' | 'external_review' | 'author_reply';
  abstract?: string;
  keywords?: string;
  authors?: any[];
  last_reply?: string;
}

const ArticleManagementPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState<'new' | 'revision' | 'external_review' | 'author_reply'>('new');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadMockSubmissions();
    
    // Listen for new submissions
    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('editor_submissions');
      channel.onmessage = () => {
        loadMockSubmissions(); // Reload when new submissions arrive
      };
    }

    return () => {
      if (channel) channel.close();
    };
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user.role !== 'editor') {
          router.push('/');
          return;
        }
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (e) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadMockSubmissions = () => {
    // Load real submissions from localStorage
    const realSubmissions = JSON.parse(localStorage.getItem('editor_submissions') || '[]') as Submission[];
    console.log('Real submissions loaded:', realSubmissions);
    
    // Load saved replies
    const savedReplies = JSON.parse(localStorage.getItem('authorReplies') || '[]') as {id:number,reply:string}[];
    
    // Add mock submissions for demo purposes
    const mock: Submission[] = [
      {
        id: 1,
        title: 'Innovative Battlefield Medicine',
        author_name: 'Samavia Khan',
        submitted_at: '2025-09-25',
        status: 'new',
      },
      {
        id: 2,
        title: 'Drone Swarm Coordination Algorithms',
        author_name: 'Alex Lee',
        submitted_at: '2025-09-20',
        status: 'revision',
      },
      {
        id: 3,
        title: 'Satellite Imaging for Reconnaissance',
        author_name: 'Maria Anders',
        submitted_at: '2025-09-18',
        status: 'external_review',
      },
    ];
    
    // Merge real submissions with mock submissions
    const allSubmissions = [...realSubmissions, ...mock];
    console.log('All submissions after merge:', allSubmissions);
    
    // Update submissions with saved replies
    const updatedSubmissions = allSubmissions.map(sub => {
      const reply = savedReplies.find(r => r.id === sub.id);
      return reply ? { ...sub, last_reply: reply.reply } : sub;
    });
    
    console.log('Final submissions:', updatedSubmissions);
    setSubmissions(updatedSubmissions);
  };

  const filtered = submissions.filter((s) => s.status === activeTab);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-academic-50">
        Loading...
      </div>
    );
  }

  const tabButton = (
    label: string,
    type: 'new' | 'revision' | 'external_review' | 'author_reply',
    icon: JSX.Element,
  ) => (
    <button
      onClick={() => setActiveTab(type)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border  ${
        activeTab === type
          ? 'bg-primary-600 text-white border-primary-600'
          : 'bg-white border-academic-300 text-academic-700 hover:bg-academic-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <Layout user={user}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif text-academic-900">
          Article Management
        </h1>
        <p className="text-academic-600 mt-1">
          Filter and manage author submissions efficiently.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 mb-6">
        {tabButton('New Submissions', 'new', <Inbox className="w-4 h-4" />)}
        {tabButton('Editorial Role (Revisions)', 'revision', <History className="w-4 h-4" />)}
        {tabButton('External (Reviewers)', 'external_review', <Users className="w-4 h-4" />)}
        {tabButton('Reply from Author', 'author_reply', <Send className="w-4 h-4" />)}
      </div>

      {/* Table */}
      <div className="bg-white border border-academic-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-academic-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase">
                  Submitted
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-academic-200">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-academic-50">
                  <td className="px-6 py-4 text-sm font-medium text-academic-900">
                    {s.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-academic-700">
                    {s.author_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-academic-500">
                    {new Date(s.submitted_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        sessionStorage.setItem('selectedSubmission', JSON.stringify(s));
                        router.push(`/dashboard/editor/article-management/${s.id}`);
                      }}
                      className="text-primary-600 hover:text-primary-700 flex items-center text-sm font-medium"
                    >
                      Reply <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-academic-500">
                    No submissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default ArticleManagementPage;
