'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

const YearlyPublicationsPage = () => {
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
    labels: analytics.yearlyPublications.map(item => item.year.toString()),
    datasets: [
      {
        label: 'Published Articles',
        data: analytics.yearlyPublications.map(item => item.count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 8
      }
    ]
  };

  const totalPublished = analytics.yearlyPublications.reduce((sum, item) => sum + item.count, 0);
  const avgPerYear = analytics.yearlyPublications.length > 0 
    ? (totalPublished / analytics.yearlyPublications.length).toFixed(1) 
    : '0';

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
          <TrendingUp className="w-8 h-8 text-primary-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-academic-900 font-serif">Yearly Publications</h1>
            <p className="text-academic-600 mt-1">Publication trends over the years</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-academic-200">
          <div className="text-sm text-academic-600 mb-1">Total Published</div>
          <div className="text-3xl font-bold text-primary-600">{totalPublished}</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-academic-200">
          <div className="text-sm text-academic-600 mb-1">Years Active</div>
          <div className="text-3xl font-bold text-primary-600">{analytics.yearlyPublications.length}</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-academic-200">
          <div className="text-sm text-academic-600 mb-1">Average per Year</div>
          <div className="text-3xl font-bold text-primary-600">{avgPerYear}</div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-8 mb-8">
        <h3 className="text-lg font-semibold text-academic-900 mb-6">Publication Trends</h3>
        <div style={{ height: '400px' }}>
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'top',
                  labels: {
                    font: {
                      size: 14
                    }
                  }
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `Published: ${context.parsed.y} articles`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                    font: {
                      size: 12
                    }
                  },
                  title: {
                    display: true,
                    text: 'Number of Articles',
                    font: {
                      size: 14,
                      weight: 'bold'
                    }
                  }
                },
                x: {
                  ticks: {
                    font: {
                      size: 12
                    }
                  },
                  title: {
                    display: true,
                    text: 'Year',
                    font: {
                      size: 14,
                      weight: 'bold'
                    }
                  }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Yearly Breakdown Table */}
      <div className="bg-white rounded-lg shadow-sm border border-academic-200 overflow-hidden">
        <div className="p-6 border-b border-academic-200">
          <h3 className="text-lg font-semibold text-academic-900">Yearly Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-academic-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Articles Published
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-academic-500 uppercase tracking-wider">
                  Percentage of Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-academic-200">
              {analytics.yearlyPublications.map((item) => {
                const percentage = totalPublished > 0 ? ((item.count / totalPublished) * 100).toFixed(1) : '0';
                return (
                  <tr key={item.year} className="hover:bg-academic-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-academic-900">{item.year}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-academic-900">{item.count}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm text-academic-900 mr-2">{percentage}%</div>
                        <div className="w-32 bg-academic-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default YearlyPublicationsPage;
