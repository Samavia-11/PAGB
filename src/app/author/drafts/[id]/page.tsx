"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface AuthorInput { name: string; email: string; role: 'Main Author' | 'Co-Author'; contact?: string; affiliation: string; }

export default function EditDraftPage(){
  const params = useParams();
  const router = useRouter();
  const [user,setUser]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [articleId,setArticleId]=useState<number>();
  const [title,setTitle]=useState('');
  const [manuscript,setManuscript]=useState('');
  const [authors,setAuthors]=useState<AuthorInput[]>([{name:'',email:'',role:'Main Author',contact:'',affiliation:''}]);

  useEffect(()=>{
    const u = localStorage.getItem('user');
    if (u){ setUser(JSON.parse(u)); }
  },[]);

  useEffect(()=>{ if (params && (params as any).id) loadDraft(Number((params as any).id)); },[params]);

  const loadDraft = async (id:number)=>{
    setLoading(true);
    const res = await fetch(`/api/articles/${id}`);
    const data = await res.json();
    setArticleId(id);
    setTitle(data.article?.title||'');
    try {
      const content = data.article?.content ? JSON.parse(data.article.content) : {};
      setManuscript(content.manuscript||'');
      setAuthors(content.authors||[{name:'',email:'',role:'Main Author',contact:'',affiliation:''}]);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const updateAuthor = (idx:number, field:keyof AuthorInput, value:string)=> setAuthors(a=> a.map((x,i)=> i===idx ? { ...x, [field]: value } as any : x));
  const addAuthor = ()=> setAuthors(a=> [...a, {name:'',email:'',role:'Co-Author',contact:'',affiliation:''}]);
  const removeAuthor = (idx:number)=> setAuthors(a=> a.filter((_,i)=>i!==idx));
  const validateAffiliations = () => authors.every(a => a.affiliation && a.affiliation.trim().length>0);

  const save = async ()=>{
    if (!validateAffiliations()) return alert('Affiliation is mandatory for all authors and co-authors.');
    const res = await fetch(`/api/articles/${articleId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title, content: JSON.stringify({ manuscript, authors }) })});
    if (!res.ok) return alert('Failed to save');
    alert('Saved');
  };

  const submit = async ()=>{
    if (!validateAffiliations()) return alert('Affiliation is mandatory for all authors and co-authors.');
    await save();
    await fetch(`/api/articles/${articleId}/workflow`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'submit', from_user_id: user?.id, from_role: 'author' })});
    alert('Submitted');
    router.push('/author/dashboard');
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Edit Draft</h1>
      <div className="bg-white rounded shadow p-5 space-y-3">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
        </div>
        <details className="border rounded">
          <summary className="px-4 py-3 cursor-pointer font-medium">Authors & Affiliation</summary>
          <div className="p-4 space-y-3">
            {authors.map((a,idx)=> (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-start">
                <input placeholder="Author" value={a.name} onChange={e=>updateAuthor(idx,'name',e.target.value)} className="border rounded px-2 py-1" />
                <input placeholder="Email" value={a.email} onChange={e=>updateAuthor(idx,'email',e.target.value)} className="border rounded px-2 py-1" />
                <select value={a.role} onChange={e=>updateAuthor(idx,'role',e.target.value as any)} className="border rounded px-2 py-1">
                  <option>Main Author</option>
                  <option>Co-Author</option>
                </select>
                <input placeholder="Contact Number" value={a.contact||''} onChange={e=>updateAuthor(idx,'contact',e.target.value)} className="border rounded px-2 py-1" />
                <input placeholder="Affiliation (required)" value={a.affiliation} onChange={e=>updateAuthor(idx,'affiliation',e.target.value)} className="border rounded px-2 py-1" />
                {authors.length>1 && (
                  <button type="button" onClick={()=>removeAuthor(idx)} className="text-red-600 text-sm">Remove</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addAuthor} className="px-3 py-1 bg-gray-100 rounded border">+ Add Author</button>
          </div>
        </details>
        <div>
          <label className="block text-sm font-medium">Manuscript</label>
          <textarea value={manuscript} onChange={e=>setManuscript(e.target.value)} className="w-full border rounded px-3 py-2 min-h-[160px]" />
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="px-4 py-2 bg-gray-200 rounded">Save</button>
          <button onClick={submit} className="px-4 py-2 bg-blue-600 text-white rounded">Submit</button>
          <a href="/author/drafts" className="px-4 py-2 border rounded">Back</a>
        </div>
      </div>
    </div>
  );
}
