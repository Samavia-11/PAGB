"use client";
import { useEffect, useState } from 'react';

interface Article { id:number; title:string; status:string; updated_at:string; }

export default function DraftsPage(){
  const [user,setUser]=useState<any>(null);
  const [drafts,setDrafts]=useState<Article[]>([]);

  useEffect(()=>{
    const u = localStorage.getItem('user');
    if (u){
      const parsed = JSON.parse(u);
      setUser(parsed);
      fetchDrafts(parsed);
    }
  },[]);

  const fetchDrafts = async (u:any) => {
    const res = await fetch('/api/articles?status=draft', { headers: { 'x-user-id': String(u.id), 'x-user-role': 'author' }});
    const data = await res.json();
    setDrafts(data.articles||[]);
  };

  if (!user) return <div className="p-6"><a href="/login" className="text-blue-600 underline">Login</a></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Draft Articles</h1>
        <a href="/Author/submit" className="px-3 py-2 bg-blue-600 text-white rounded">Submit New</a>
      </div>
      <div className="bg-white rounded shadow divide-y">
        {drafts.length===0 && <div className="p-6 text-gray-500">No drafts yet</div>}
        {drafts.map(a=> (
          <div key={a.id} className="p-4 flex justify-between items-center">
            <div>
              <div className="font-semibold">{a.title}</div>
              <div className="text-xs text-gray-500">Updated {new Date(a.updated_at).toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
              <a className="px-3 py-1 border rounded" href={`/Author/drafts/${a.id}`}>Edit</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
