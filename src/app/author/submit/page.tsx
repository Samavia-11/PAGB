"use client";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface AuthorInput { name: string; email: string; role: 'Main Author' | 'Co-Author'; contact?: string; affiliation: string; }

export default function SubmitArticlePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState<AuthorInput[]>([{ name: '', email: '', role: 'Main Author', contact: '', affiliation: '' }]);

  // Manuscript block
  const [articleType, setArticleType] = useState('');
  const [abstractText, setAbstractText] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [keywordList, setKeywordList] = useState<string[]>([]);
  const [articleContent, setArticleContent] = useState('');
  const [fileName, setFileName] = useState('');

  // Declarations block
  const [coverLetter, setCoverLetter] = useState('');
  const [conflict, setConflict] = useState('');
  const [funding, setFunding] = useState('');
  const [disclaimer, setDisclaimer] = useState('');
  const [ethicsOk, setEthicsOk] = useState(false);
  const [licenseOk, setLicenseOk] = useState(false);
  const [coverLetterFileName, setCoverLetterFileName] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) {
      setUser(JSON.parse(u));
      // Load draft data if editing
      if (editId) {
        setIsEditing(true);
        loadDraftData(editId, JSON.parse(u));
      }
    }
  }, [editId]);

  const loadDraftData = async (draftId: string, user: any) => {
    try {
      const res = await fetch(`/api/articles/${draftId}`, {
        headers: { 'x-user-id': String(user.id), 'x-user-role': 'author' }
      });
      if (!res.ok) throw new Error('Failed to load draft');
      
      const data = await res.json();
      const article = data.article;
      
      // Populate form fields
      setTitle(article.title || '');
      
      // Parse content if it exists
      if (article.content) {
        try {
          const content = JSON.parse(article.content);
          
          // Set authors
          if (content.authors && Array.isArray(content.authors)) {
            setAuthors(content.authors);
          }
          
          // Set manuscript data
          if (content.manuscript) {
            const ms = content.manuscript;
            setArticleType(ms.articleType || '');
            setAbstractText(ms.abstractText || '');
            setKeywordList(ms.keywordList || []);
            setArticleContent(ms.articleContent || '');
            setFileName(ms.fileName || '');
            
            // Set declarations
            setCoverLetter(ms.coverLetter || '');
            setConflict(ms.conflict || '');
            setFunding(ms.funding || '');
            setDisclaimer(ms.disclaimer || '');
            setEthicsOk(ms.ethicsOk || false);
            setLicenseOk(ms.licenseOk || false);
            setCoverLetterFileName(ms.coverLetterFileName || '');
          }
        } catch (e) {
          console.error('Error parsing article content:', e);
        }
      }
    } catch (error) {
      console.error('Error loading draft:', error);
      alert('Failed to load draft data');
    }
  };

  const addAuthor = () => setAuthors(a => [...a, { name: '', email: '', role: 'Co-Author', contact: '', affiliation: '' }]);
  const updateAuthor = (idx: number, field: keyof AuthorInput, value: string) => setAuthors(a => a.map((x,i)=> i===idx ? { ...x, [field]: value } as any : x));
  const removeAuthor = (idx: number) => setAuthors(a => a.filter((_,i)=>i!==idx));

  const validateAffiliations = () => authors.every(a => a.affiliation && a.affiliation.trim().length>0);
  const nonEmptyCoauthor = (a: AuthorInput) => !!(a.name?.trim() || a.email?.trim() || a.contact?.trim() || a.affiliation?.trim());
  const filteredAuthors = () => {
    const main = authors[0];
    const rest = authors.slice(1).filter(nonEmptyCoauthor);
    return [main, ...rest];
  };
  const validateSubmit = () => {
    const main = authors[0];
    if (!main.name?.trim()) return 'Main author name is required';
    if (!main.email?.trim()) return 'Main author email is required';
    if (!main.contact?.trim()) return 'Main author contact number is required';
    if (!main.affiliation?.trim()) return 'Main author affiliation is required';
    // Co-authors optional: if present, enforce their required fields
    for (const a of authors.slice(1)) {
      if (nonEmptyCoauthor(a)) {
        if (!a.name?.trim()) return 'Co-author name is required';
        if (!a.email?.trim()) return 'Co-author email is required';
        if (!a.affiliation?.trim()) return 'Co-author affiliation is required';
      }
    }
    if (!articleType) return 'Article type is required';
    if (!abstractText.trim()) return 'Abstract is required';
    if (!articleContent.trim()) return 'Article content is required';
    if (!keywordList.length) return 'At least one keyword is required';
    if (!coverLetter.trim()) return 'Cover letter is required (write None if none)';
    if (!conflict.trim()) return 'Conflict of Interest is required (write None if none)';
    if (!funding.trim()) return 'Funding Statement is required (write None if none)';
    if (!disclaimer.trim()) return 'Disclaimer is required (write None if none)';
    if (!ethicsOk || !licenseOk) return 'Please accept the declarations before submitting.';
    return '';
  };

  // Keyword helpers
  const addKeywordsFromString = (str: string) => {
    const parts = str
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    if (parts.length) setKeywordList(prev => Array.from(new Set([...prev, ...parts])));
  };
  const handleKeywordsChange = (v: string) => {
    if (v.includes(',')) {
      const tokens = v.split(',');
      const last = tokens.pop() || '';
      addKeywordsFromString(tokens.join(','));
      setKeywordsInput(last);
    } else {
      setKeywordsInput(v);
    }
  };
  const handleKeywordsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && keywordsInput.trim()) {
      e.preventDefault();
      addKeywordsFromString(keywordsInput);
      setKeywordsInput('');
    } else if (e.key === 'Backspace' && !keywordsInput && keywordList.length) {
      setKeywordList(prev => prev.slice(0, prev.length - 1));
    }
  };
  const removeKeyword = (i: number) => setKeywordList(prev => prev.filter((_, idx) => idx !== i));

  const saveDraft = async () => {
    if (!user) return alert('Login required');
    if (!validateAffiliations()) return alert('Affiliation is mandatory for all authors and co-authors.');
    setSaving(true);
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `/api/articles/${editId}` : '/api/articles';
      
      const res = await fetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          title,
          content: JSON.stringify({
            authors: filteredAuthors(),
            manuscript: {
              articleType,
              abstractText,
              keywordList,
              articleContent,
              fileName,
              coverLetter,
              conflict,
              funding,
              disclaimer,
              ethicsOk,
              licenseOk,
              coverLetterFileName
            }
          }),
          author_id: user.id
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      alert(isEditing ? 'Draft updated' : 'Draft saved');
      
      if (isEditing) {
        router.push('/author/drafts');
      } else {
        router.push(`/author/submit?edit=${data.id}`);
      }
    } catch (e:any) { alert(e.message || 'Failed to save draft'); }
    finally { setSaving(false); }
  };

  const submitNow = async () => {
    if (!user) return alert('Login required');
    if (!title) return alert('Title is required');
    const v = validateSubmit();
    if (v) return alert(v);
    
    setSaving(true);
    try {
      let articleId = editId;
      
      // If editing, update the existing draft, otherwise create new
      if (isEditing) {
        const res = await fetch(`/api/articles/${editId}`, { 
          method: 'PUT', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({
            title,
            content: JSON.stringify({
              authors: filteredAuthors(),
              manuscript: {
                articleType,
                abstractText,
                keywordList,
                articleContent,
                fileName,
                coverLetter,
                conflict,
                funding,
                disclaimer,
                ethicsOk,
                licenseOk,
                coverLetterFileName
              }
            }),
            author_id: user.id
          })
        });
        if (!res.ok) throw new Error('Failed to update draft');
      } else {
        // Create new article
        const res = await fetch('/api/articles', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({
            title,
            content: JSON.stringify({
              authors: filteredAuthors(),
              manuscript: {
                articleType,
                abstractText,
                keywordList,
                articleContent,
                fileName,
                coverLetter,
                conflict,
                funding,
                disclaimer,
                ethicsOk,
                licenseOk,
                coverLetterFileName
              }
            }),
            author_id: user.id
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create');
        articleId = data.id;
      }

      // Submit workflow
      await fetch(`/api/articles/${articleId}/workflow`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          action: 'submit', from_user_id: user.id, from_role: 'author'
        })
      });
      alert('Article submitted');
      router.push('/author/dashboard');
    } catch (e:any) { alert(e.message || 'Failed to submit'); }
    finally { setSaving(false); }
  };

  if (!user) return (
    <div className="p-6"><a className="text-blue-600 underline" href="/login">Login to continue</a></div>
  );

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold">{isEditing ? 'Edit Article' : 'Submit New Article'}</h1>
      
      <div className="bg-blue-50 border border-blue-200 p-4 rounded">
        <h2 className="font-semibold mb-2">Submission Guidelines</h2>
        <ul className="list-disc ml-6 text-sm">
          <li>Ensure the title clearly reflects the content.</li>
          <li>Abstract should summarize main findings.</li>
          <li>Upload only allowed file types.</li>
          <li>Mark one author as Main Author with valid contacts.</li>
          <li>Accept the license agreement before submitting.</li>
        </ul>
      </div>

      <div className="bg-white rounded shadow p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium">Article Title *</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
        </div>

        <details className="border rounded" open>
          <summary className="px-4 py-3 cursor-pointer font-medium">Authors & Affiliation</summary>
          <div className="p-4 space-y-3">
            {/* Main Author row (no dropdown) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-start">
              <input placeholder="Author" value={authors[0]?.name||''} onChange={e=>updateAuthor(0,'name',e.target.value)} className="border rounded px-2 py-1" />
              <input placeholder="Email" value={authors[0]?.email||''} onChange={e=>updateAuthor(0,'email',e.target.value)} className="border rounded px-2 py-1" />
              <input disabled value="Main Author" className="border rounded px-2 py-1 bg-gray-50 text-gray-700" />
              <input placeholder="Contact Number" value={authors[0]?.contact||''} onChange={e=>updateAuthor(0,'contact',e.target.value)} className="border rounded px-2 py-1" />
            </div>
            <div>
              <input placeholder="Affiliation (required)" value={authors[0]?.affiliation||''} onChange={e=>updateAuthor(0,'affiliation',e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
            </div>

            {/* Additional authors with dropdown */}
            {authors.slice(1).map((a,idx)=> {
              const realIndex = idx + 1;
              return (
                <div key={realIndex} className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-start">
                    <input placeholder="Author" value={a.name} onChange={e=>updateAuthor(realIndex,'name',e.target.value)} className="border rounded px-2 py-1" />
                    <input placeholder="Email" value={a.email} onChange={e=>updateAuthor(realIndex,'email',e.target.value)} className="border rounded px-2 py-1" />
                    <select value={a.role} onChange={e=>updateAuthor(realIndex,'role',e.target.value as any)} className="border rounded px-2 py-1">
                      <option>Co-Author</option>
                      <option>Main Author</option>
                    </select>
                    <input placeholder="Contact Number" value={a.contact||''} onChange={e=>updateAuthor(realIndex,'contact',e.target.value)} className="border rounded px-2 py-1" />
                    <div className="flex items-center justify-end">
                      <button type="button" onClick={()=>removeAuthor(realIndex)} className="text-red-600 text-sm">Remove</button>
                    </div>
                  </div>
                  <div>
                    <input placeholder="Affiliation (required)" value={a.affiliation} onChange={e=>updateAuthor(realIndex,'affiliation',e.target.value)} className="w-full border rounded px-3 py-2" />
                  </div>
                </div>
              );
            })}

            <button type="button" onClick={addAuthor} className="px-3 py-1 bg-gray-100 rounded border">+ Add Author</button>
          </div>
        </details>

        <details className="border rounded" open>
          <summary className="px-4 py-3 cursor-pointer font-medium">Manuscript</summary>
          <div className="p-4 space-y-3">
            <select value={articleType} onChange={(e)=>setArticleType(e.target.value)} className="border rounded px-3 py-2">
              <option value="">Select Article Type</option>
              <option value="original_research">Original Research</option>
              <option value="review">Review</option>
              <option value="short_communication">Short Communication</option>
            </select>
            <input value={abstractText} onChange={(e)=>setAbstractText(e.target.value)} placeholder="Abstract" className="w-full border rounded px-3 py-2" />
            <div className="w-full border rounded px-2 py-1">
              <div className="flex flex-wrap gap-2">
                {keywordList.map((k, i) => (
                  <span key={i} className="flex items-center gap-1 bg-green-100 text-green-900 rounded px-2 py-0.5 text-xs">
                    <a href={`/?q=${encodeURIComponent(k)}`} className="underline decoration-dotted">{k}</a>
                    <button type="button" onClick={() => removeKeyword(i)} className="text-green-900/70 hover:text-green-900">×</button>
                  </span>
                ))}
                <input
                  value={keywordsInput}
                  onChange={(e)=>handleKeywordsChange(e.target.value)}
                  onKeyDown={handleKeywordsKeyDown}
                  placeholder="Keywords (type a word and press , or Enter)"
                  className="flex-1 min-w-[160px] px-1 py-1 text-sm focus:outline-none"
                />
              </div>
            </div>
            <textarea value={articleContent} onChange={(e)=>setArticleContent(e.target.value)} placeholder="Article Content" className="w-full border rounded px-3 py-2 min-h-[140px]" />
            <div className="flex items-center gap-3">
              <label className="inline-block px-4 py-2 border rounded bg-gray-100 text-gray-800 cursor-pointer hover:bg-gray-200">
                Choose File
                <input
                  type="file"
                  accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e)=>{
                    const f = e.target.files && e.target.files[0];
                    if (f && !/\.(docx?|DOCX?)$/.test(f.name)) {
                      alert('Please upload a Word file (.doc or .docx)');
                      (e.target as HTMLInputElement).value = '';
                      return;
                    }
                    setFileName(f ? f.name : '');
                  }}
                />
              </label>
              <span className="text-sm text-gray-700">{fileName || 'No file chosen'}</span>
            </div>
          </div>
        </details>

        <details className="border rounded" open>
          <summary className="px-4 py-3 cursor-pointer font-medium">Declarations</summary>
          <div className="p-4 space-y-3">
            <label className="block text-sm font-medium">Cover Letter</label>
            <input value={coverLetter} onChange={(e)=>setCoverLetter(e.target.value)} placeholder="if none write none to declear " className="w-full border rounded px-3 py-2" />
            <div className="flex items-center gap-3">
              <label className="inline-block px-4 py-2 border rounded bg-gray-100 text-gray-800 cursor-pointer hover:bg-gray-200">
                Choose File
                <input
                  type="file"
                  accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e)=>{
                    const f = e.target.files && e.target.files[0];
                    if (f && !/\.(docx?|DOCX?)$/.test(f.name)) {
                      alert('Please upload a Word file (.doc or .docx)');
                      (e.target as HTMLInputElement).value = '';
                      return;
                    }
                    setCoverLetterFileName(f ? f.name : '');
                  }}
                />
              </label>
              <span className="text-sm text-gray-700">{coverLetterFileName || 'No file chosen'}</span>
            </div>
            <label className="block text-sm font-medium">Conflict of Interest</label>
            <input value={conflict} onChange={(e)=>setConflict(e.target.value)} placeholder="if none write none to declear " className="w-full border rounded px-3 py-2" />
            <label className="block text-sm font-medium">Funding Statement</label>
            <input value={funding} onChange={(e)=>setFunding(e.target.value)} placeholder="if none write none to declear " className="w-full border rounded px-3 py-2" />
            <label className="block text-sm font-medium">Disclaimer</label>
            <input value={disclaimer} onChange={(e)=>setDisclaimer(e.target.value)} placeholder="if none write none to declear " className="w-full border rounded px-3 py-2" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ethicsOk} onChange={(e)=>setEthicsOk(e.target.checked)} /> I confirm that this work complies with ethical guidelines.</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={licenseOk} onChange={(e)=>setLicenseOk(e.target.checked)} /> I agree to the copyright and license terms.</label>
          </div>
        </details>

        <div className="flex gap-3 pt-2">
          <button
            disabled={saving}
            onClick={() => {
              const v = validateSubmit();
              if (v) {
                setErrorText(v);
                setErrorOpen(true);
                return;
              }
              setConfirmOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
          >
            {isEditing ? 'Update & Submit' : 'Submit Article'}
          </button>
          <button disabled={saving} onClick={saveDraft} className="px-4 py-2 bg-gray-200 rounded">
            {isEditing ? 'Update Draft' : 'Save Draft'}
          </button>
          <a href="/author/dashboard" className="px-4 py-2 bg-gray-100 rounded border">Cancel</a>
        </div>
      </div>
      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmOpen(false)} />
          <div className="relative bg-white rounded shadow-lg w-full max-w-md mx-4 p-5">
            <h3 className="text-lg font-semibold mb-1">{isEditing ? 'Update & Submit Article' : 'Submit Article'}</h3>
            <p className="text-sm text-gray-700 mb-4">Are you sure you want to {isEditing ? 'update and submit' : 'submit'} the article?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmOpen(false)} className="px-4 py-2 rounded border bg-gray-50">No</button>
              <button onClick={() => { setConfirmOpen(false); submitNow(); }} className="px-4 py-2 rounded bg-blue-600 text-white">Yes, Submit</button>
            </div>
          </div>
        </div>
      )}
      {/* Error Modal */}
      {errorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setErrorOpen(false)} />
          <div className="relative bg-white rounded shadow-lg w-full max-w-md mx-4 p-5">
            <h3 className="text-lg font-semibold mb-1">Missing Information</h3>
            <p className="text-sm text-gray-700 mb-4">{errorText}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setErrorOpen(false)} className="px-4 py-2 rounded bg-blue-600 text-white">OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
