'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft, PieChart as PieChartIcon } from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
}

interface AnalyticsData {
  statusDistribution: Record<string, number>;
  yearlyPublications: { year: number; count: number }[];
}

const StatusDistributionPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    statusDistribution: {},
    yearlyPublications: []
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadAnalytics();
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

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
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

  const chartData = {
    labels: [
      'Submissions',
      'With Editor',
      'With Reviewer',
      'In Publication'
    ],
    datasets: [
      {
        label: 'Articles',
        data: [
          analytics.statusDistribution['submitted'] || 0,
          analytics.statusDistribution['editor_review'] || 0,
          analytics.statusDistribution['under_review'] || 0,
          (analytics.statusDistribution['accepted'] || 0) + (analytics.statusDistribution['published'] || 0)
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(34, 197, 94, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  const totalArticles = Object.values(analytics.statusDistribution).reduce((a, b) => a + b, 0);

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
        <div className="flex items-center">
          <PieChartIcon className="w-8 h-8 text-primary-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-academic-900 font-serif">Status Distribution</h1>
            <p className="text-academic-600 mt-1">Article workflow status overview</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-lg">
              <Pie
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        font: {
                          size: 13
                        }
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.parsed || 0;
                          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                          return `${label}: ${value} (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Statistics Table */}
          <div>
            <h3 className="text-base font-semibold text-academic-900 mb-3">Detailed Breakdown</h3>
            <div className="space-y-2">
              {[
                { label: 'Submissions', key: 'submitted', color: 'bg-blue-500' },
                { label: 'With Editor', key: 'editor_review', color: 'bg-purple-500' },
                { label: 'With Reviewer', key: 'under_review', color: 'bg-yellow-500' },
                { label: 'In Publication', keys: ['accepted', 'published'], color: 'bg-green-500' }
              ].map((item) => {
                const count = item.keys 
                  ? item.keys.reduce((sum, key) => sum + (analytics.statusDistribution[key] || 0), 0)
                  : analytics.statusDistribution[item.key] || 0;
                const percentage = totalArticles > 0 ? ((count / totalArticles) * 100).toFixed(1) : '0';
                return (
                  <div key={item.label} className="flex items-center justify-between p-3 bg-academic-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded ${item.color} mr-2`}></div>
                      <span className="text-sm text-academic-900 font-medium">{item.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-academic-900">{count}</div>
                      <div className="text-xs text-academic-600">{percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-primary-900 font-semibold">Total Articles</span>
                <span className="text-xl font-bold text-primary-900">{totalArticles}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StatusDistributionPage;
