"use client";
import { useEffect, useMemo, useState } from 'react';
import { FileText, CheckCircle, Clock, Send, PlusCircle, Eye, BarChart3, TrendingUp, MessageSquare } from 'lucide-react';

interface Article { 
  id: number; 
  title: string; 
  status: string; 
  created_at: string; 
  updated_at: string; 
}


export default function AuthorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) {
      const parsed = JSON.parse(u);
      setUser(parsed);
      load(parsed);
    }
  }, []);

  const load = async (u: any) => {
    const res = await fetch('/api/articles', { 
      headers: { 'x-user-id': String(u.id), 'x-user-role': 'author' } 
    });
    const data = await res.json();
    setArticles(data.articles || []);
  };


  const counts = useMemo(() => {
    const c: Record<string, number> = { total: 0, in_review: 0, published: 0, accepted: 0 };
    c.total = articles.length;
    c.in_review = articles.filter(a => ['submitted', 'under_review', 'with_editor'].includes(a.status)).length;
    c.published = articles.filter(a => a.status === 'published').length;
    c.accepted = articles.filter(a => a.status === 'accepted').length;
    return c;
  }, [articles]);

  // Build data for charts
  const statusData = useMemo(() => {
    const order = [
      { key: 'submitted', label: 'Submitted', color: '#3b82f6' },
      { key: 'under_review', label: 'Under Review', color: '#facc15' },
      { key: 'reviewed', label: 'Reviewed', color: '#a855f7' },
      { key: 'with_editor', label: 'Editor Review', color: '#f97316' },
      { key: 'accepted', label: 'Accepted', color: '#22c55e' },
      { key: 'published', label: 'Published', color: '#10b981' },
      { key: 'rejected', label: 'Rejected', color: '#ef4444' }
    ];
    const m: Record<string, number> = {};
    for (const a of articles) m[a.status] = (m[a.status] || 0) + 1;
    return order.map(o => ({ ...o, value: m[o.key] || 0 }));
  }, [articles]);

  const yearlyData = useMemo(() => {
    const now = new Date();
    const years = [now.getFullYear() - 3, now.getFullYear() - 2, now.getFullYear() - 1, now.getFullYear()];
    const countsByYear: Record<number, number> = Object.fromEntries(years.map(y => [y, 0]));
    for (const a of articles) {
      const y = new Date(a.created_at).getFullYear();
      if (y in countsByYear) countsByYear[y] += 1;
    }
    return years.map(y => ({ year: y, value: countsByYear[y] || 0 }));
  }, [articles]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500',
      submitted: 'bg-blue-500',
      under_review: 'bg-yellow-500',
      with_editor: 'bg-purple-500',
      published: 'bg-green-500',
      rejected: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Please Login</h2>
        <a href="/login" className="text-blue-600 hover:underline">Go to Login</a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">PAGB Author Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div>
              <p className="font-semibold">{user?.username || 'Author'}</p>
              <p className="text-sm capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-gray-500 text-sm">Total Articles</div>
              <div className="text-2xl font-bold">{counts.total}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-yellow-100 text-yellow-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-gray-500 text-sm">In Review</div>
              <div className="text-2xl font-bold">{counts.in_review}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-green-100 text-green-700 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-gray-500 text-sm">Published</div>
              <div className="text-2xl font-bold">{counts.published}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-purple-100 text-purple-700 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="text-gray-500 text-sm">Accepted</div>
              <div className="text-2xl font-bold">{counts.accepted}</div>
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Status Distribution
            </h3>
            <div className="h-56 rounded-md border p-3">
              {(() => {
                const W = 520, H = 160, padL = 36, padB = 24, barW = (W - padL - 20) / statusData.length - 8;
                const max = Math.max(1, ...statusData.map(d => d.value));
                return (
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
                    <g stroke="#e5e7eb" strokeWidth="1" opacity="0.9">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const y = 10 + i * ((H - padB - 20) / 4);
                        return <line key={i} x1={padL} x2={W - 10} y1={y} y2={y} />;
                      })}
                    </g>
                    {statusData.map((d, idx) => {
                      const x = padL + idx * (barW + 8) + 8;
                      const h = max ? ((H - padB - 20) * d.value) / max : 0;
                      const y = (H - padB - 10) - h;
                      return (
                        <g key={d.key}>
                          <rect x={x} y={y} width={barW} height={h} fill={d.color} rx="3" />
                          <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="9" fill="#64748b">{d.label.split(' ')[0]}</text>
                          <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="10" fill="#0f172a">{d.value}</text>
                        </g>
                      );
                    })}
                    <text x={4} y={12} fontSize="10" fill="#64748b">Count</text>
                  </svg>
                );
              })()}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Yearly Publications
            </h3>
            <div className="h-56 rounded-md border p-3">
              {(() => {
                const W = 520, H = 160, padL = 36, padB = 26, padR = 10;
                const max = Math.max(1, ...yearlyData.map(d => d.value));
                const step = (W - padL - padR) / (Math.max(1, yearlyData.length - 1));
                return (
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
                    <g stroke="#e5e7eb" strokeWidth="1" opacity="0.9">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const y = 10 + i * ((H - padB - 20) / 4);
                        return <line key={i} x1={padL} x2={W - padR} y1={y} y2={y} />;
                      })}
                    </g>
                    <polyline
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="2"
                      points={yearlyData.map((d, i) => {
                        const x = padL + i * step;
                        const y = (H - padB - 10) - ((H - padB - 20) * d.value / max);
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                    {yearlyData.map((d, i) => {
                      const x = padL + i * step;
                      const y = (H - padB - 10) - ((H - padB - 20) * d.value / max);
                      return (
                        <g key={d.year}>
                          <circle cx={x} cy={y} r="3" fill="#0284c7" />
                          <text x={x} y={H - 6} textAnchor="middle" fontSize="10" fill="#64748b">{d.year}</text>
                        </g>
                      );
                    })}
                  </svg>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Articles Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              My Articles
            </h2>
            <a
              href="/Author/submit"
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Submit New
            </a>
          </div>
          <div className="space-y-4">
            {articles.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium mb-2">No articles yet</p>
                <p className="text-sm mb-4">Get started by submitting your first article to the journal.</p>
                <a
                  href="/Author/submit"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Submit Your First Article
                </a>
              </div>
            ) : (
              articles.map(article => (
                <div key={article.id} className="border-b pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold">{article.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Submitted: {new Date(article.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(article.status)}`}>
                        {article.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <a
                      href={`/author/articles/${article.id}`}
                      className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </a>
                    <a
                      href={`/author/articles/${article.id}/chat`}
                      className="flex items-center px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Chat
                    </a>
                    {article.status === 'draft' && (
                      <a
                        href={`/author/drafts/${article.id}`}
                        className="flex items-center px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                      >
                        Edit
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
