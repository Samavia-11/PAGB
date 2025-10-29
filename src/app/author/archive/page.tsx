"use client";
import { useEffect, useState } from 'react';

interface Article { id:number; title:string; status:string; updated_at:string; }

export default function ArchivePage(){
  const [user,setUser]=useState<any>(null);
  const [items,setItems]=useState<Article[]>([]);

  useEffect(()=>{
    const u = localStorage.getItem('user');
    if (u){
      const parsed = JSON.parse(u);
      setUser(parsed);
      fetchItems(parsed);
    }
  },[]);

  const fetchItems = async (u:any) => {
    // Archive = all non-draft authored by user
    const res = await fetch('/api/articles', { headers: { 'x-user-id': String(u.id), 'x-user-role': 'author' }});
    const data = await res.json();
    const arr: Article[] = (data.articles||[]).filter((a:Article)=> a.status !== 'draft');
    setItems(arr);
  };

  if (!user) return <div className="p-6"><a className="text-blue-600 underline" href="/login">Login</a></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Archive</h1>
      <div className="bg-white rounded shadow divide-y">
        {items.length===0 && <div className="p-6 text-gray-500">No archived articles yet</div>}
        {items.map(a=> (
          <div key={a.id} className="p-4 flex justify-between items-center">
            <div>
              <div className="font-semibold">{a.title}</div>
              <div className="text-xs text-gray-500">{a.status}</div>
            </div>
            <a href={`/dashboard`} className="px-3 py-1 border rounded">View</a>
          </div>
        ))}
      </div>
    </div>
  );
}
