"use client";
import { useEffect, useMemo, useState } from 'react';

interface Article { id:number; title:string; status:string; created_at:string; updated_at:string; }

export default function AuthorDashboard(){
  const [user,setUser]=useState<any>(null);
  const [articles,setArticles]=useState<Article[]>([]);

  useEffect(()=>{
    const u = localStorage.getItem('user');
    if (u){
      const parsed = JSON.parse(u);
      setUser(parsed);
      load(parsed);
    }
  },[]);

  const load = async (u:any)=>{
    const res = await fetch('/api/articles', { headers: { 'x-user-id': String(u.id), 'x-user-role': 'author' } });
    const data = await res.json();
    setArticles(data.articles||[]);
  };

  const counts = useMemo(()=>{
    const c: Record<string, number> = { total:0, in_review:0, published:0, accepted:0 };
    c.total = articles.length;
    c.in_review = articles.filter(a=> ['submitted','under_review','with_editor'].includes(a.status)).length;
    c.published = articles.filter(a=> a.status==='published').length;
    c.accepted = articles.filter(a=> a.status==='accepted').length;
    return c;
  },[articles]);

  // Build data for charts
  const statusData = useMemo(()=>{
    const order = [
      { key:'submitted', label:'Submitted', color:'#3b82f6' },
      { key:'under_review', label:'Under Review', color:'#facc15' },
      { key:'reviewed', label:'Reviewed', color:'#a855f7' },
      { key:'with_editor', label:'Editor Review', color:'#f97316' },
      { key:'accepted', label:'Accepted', color:'#22c55e' },
      { key:'published', label:'Published', color:'#10b981' },
      { key:'rejected', label:'Rejected', color:'#ef4444' }
    ];
    const m: Record<string, number> = {};
    for (const a of articles) m[a.status] = (m[a.status]||0)+1;
    return order.map(o=> ({ ...o, value: m[o.key]||0 }));
  },[articles]);

  const yearlyData = useMemo(()=>{
    const now = new Date();
    const years = [now.getFullYear()-3, now.getFullYear()-2, now.getFullYear()-1, now.getFullYear()];
    const countsByYear: Record<number, number> = Object.fromEntries(years.map(y=>[y,0]));
    for (const a of articles) {
      const y = new Date(a.created_at).getFullYear();
      if (y in countsByYear) countsByYear[y] += 1;
    }
    return years.map(y=> ({ year: y, value: countsByYear[y]||0 }));
  },[articles]);

  if (!user) return <div className="p-6"><a href="/login" className="text-blue-600 underline">Login</a></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Author Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome back, {user?.username || 'author'}. Manage your manuscripts and track their progress.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded bg-blue-100 text-blue-700 flex items-center justify-center">📄</div>
            <div>
              <div className="text-gray-500 text-sm">Total Articles</div>
              <div className="text-2xl font-bold">{counts.total}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded bg-yellow-100 text-yellow-700 flex items-center justify-center">🕒</div>
            <div>
              <div className="text-gray-500 text-sm">In Review</div>
              <div className="text-2xl font-bold">{counts.in_review}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded bg-green-100 text-green-700 flex items-center justify-center">✅</div>
            <div>
              <div className="text-gray-500 text-sm">Published</div>
              <div className="text-2xl font-bold">{counts.published}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded bg-purple-100 text-purple-700 flex items-center justify-center">📈</div>
            <div>
              <div className="text-gray-500 text-sm">Accepted</div>
              <div className="text-2xl font-bold">{counts.accepted}</div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <h3 className="font-semibold mb-2 flex items-center gap-2">📊 <span>Status Distribution</span></h3>
            <div className="h-56 rounded-md border p-3">
              {(() => {
                const W=520, H=160, padL=36, padB=24, barW= (W-padL-20)/statusData.length - 8;
                const max=Math.max(1,...statusData.map(d=>d.value));
                return (
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
                    <g stroke="#e5e7eb" strokeWidth="1" opacity="0.9">
                      {Array.from({length:5}).map((_,i)=>{
                        const y = 10 + i*((H- padB - 20)/4);
                        return <line key={i} x1={padL} x2={W-10} y1={y} y2={y} />;
                      })}
                    </g>
                    {statusData.map((d,idx)=>{
                      const x = padL + idx*(barW+8) + 8;
                      const h = max? ((H-padB-20) * d.value)/max : 0;
                      const y = (H-padB-10) - h;
                      return (
                        <g key={d.key}>
                          <rect x={x} y={y} width={barW} height={h} fill={d.color} rx="3" />
                          <text x={x+barW/2} y={H-6} textAnchor="middle" fontSize="9" fill="#64748b">{d.label.split(' ')[0]}</text>
                          <text x={x+barW/2} y={y-4} textAnchor="middle" fontSize="10" fill="#0f172a">{d.value}</text>
                        </g>
                      );
                    })}
                    <text x={4} y={12} fontSize="10" fill="#64748b">Count</text>
                  </svg>
                );
              })()}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <h3 className="font-semibold mb-2 flex items-center gap-2">📈 <span>Yearly Publications</span></h3>
            <div className="h-56 rounded-md border p-3">
              {(() => {
                const W=520, H=160, padL=36, padB=26, padR=10;
                const max=Math.max(1,...yearlyData.map(d=>d.value));
                const step=(W-padL-padR)/(Math.max(1, yearlyData.length-1));
                return (
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
                    <g stroke="#e5e7eb" strokeWidth="1" opacity="0.9">
                      {Array.from({length:5}).map((_,i)=>{
                        const y = 10 + i*((H- padB - 20)/4);
                        return <line key={i} x1={padL} x2={W-padR} y1={y} y2={y} />;
                      })}
                    </g>
                    <polyline
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="2"
                      points={yearlyData.map((d,i)=>{
                        const x = padL + i*step;
                        const y = (H-padB-10) - ((H-padB-20)*d.value/max);
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                    {yearlyData.map((d,i)=>{
                      const x = padL + i*step;
                      const y = (H-padB-10) - ((H-padB-20)*d.value/max);
                      return (
                        <g key={d.year}>
                          <circle cx={x} cy={y} r="3" fill="#0284c7" />
                          <text x={x} y={H-6} textAnchor="middle" fontSize="10" fill="#64748b">{d.year}</text>
                        </g>
                      );
                    })}
                  </svg>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <h3 className="font-semibold mb-3">Quick Actions</h3>
          <div className="flex gap-3">
            <a href="/Author/submit" className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-sky-600 text-white shadow-sm">
              <span className="inline-block w-2 h-2 rounded-full bg-white/80" />
              Submit New Article
            </a>
            <a href="/DOCUMENTATION_INDEX" className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 text-slate-700 border">
              <span className="inline-block w-2 h-2 rounded-full bg-slate-500/60" />
              View Submission Guidelines
            </a>
          </div>
        </div>

        {/* My Articles */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="p-4">
            <h3 className="font-semibold">My Articles</h3>
          </div>
          <div className="border-t">
            <div className="hidden md:grid grid-cols-12 text-xs text-gray-500 px-4 py-2 bg-slate-50">
              <div className="col-span-6">Title</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Submitted</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            <div className="divide-y">
              {articles.length===0 && (
                <div className="p-10 text-center text-gray-500">
                  <div className="text-5xl mb-2">🗂️</div>
                  <div className="font-medium">No articles yet</div>
                  <div className="text-sm mb-4">Get started by submitting your first article to the journal.</div>
                  <a href="/Author/submit" className="inline-block px-4 py-2 bg-blue-600 text-white rounded">Submit Your First Article</a>
                </div>
              )}
              {articles.map(a=> (
                <div key={a.id} className="p-3 md:grid md:grid-cols-12 flex flex-col gap-2 items-start md:items-center">
                  <div className="md:col-span-6 font-semibold truncate">{a.title}</div>
                  <div className="md:col-span-2 text-sm capitalize">{a.status.replace('_',' ')}</div>
                  <div className="md:col-span-2 text-sm text-gray-500">{new Date(a.created_at).toLocaleDateString()}</div>
                  <div className="md:col-span-2 md:text-right">
                    {a.status==='draft' && <a className="px-3 py-1 border rounded mr-2" href={`/Author/drafts/${a.id}`}>Edit</a>}
                    <a className="px-3 py-1 border rounded" href="/dashboard">Open</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
