'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { showNotification } from '@/utils/notifications';

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
}

type SelectedArticle = {
  tempId: string;
  title: string;
  authorName: string;
  manuscriptFile: File;
  coverFile: File | null;
};

export default function AdminCreatePublicationPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [bookTitle, setBookTitle] = useState('');
  const [editionYear, setEditionYear] = useState(String(new Date().getFullYear()));
  const [bookCover, setBookCover] = useState<File | null>(null);
  const [bookCoverPickerKey, setBookCoverPickerKey] = useState(0);

  const [selectedArticles, setSelectedArticles] = useState<SelectedArticle[]>([]);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingTitle, setPendingTitle] = useState('');
  const [pendingAuthorName, setPendingAuthorName] = useState('');
  const [pendingManuscript, setPendingManuscript] = useState<File | null>(null);
  const [pendingCover, setPendingCover] = useState<File | null>(null);
  const [pendingManuscriptPickerKey, setPendingManuscriptPickerKey] = useState(0);
  const [pendingCoverPickerKey, setPendingCoverPickerKey] = useState(0);

  const [submitting, setSubmitting] = useState(false);

  const isPdfFile = (file: File | null) => {
    if (!file) return false;
    const ext = '.' + String(file.name || '').split('.').pop()?.toLowerCase();
    return ext === '.pdf';
  };

  const isImageFile = (file: File | null) => {
    if (!file) return false;
    const ext = '.' + String(file.name || '').split('.').pop()?.toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (data.user?.role !== 'administrator') {
          router.push('/');
          return;
        }
        setUser(data.user);
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  const addArticle = () => {
    const title = pendingTitle.trim();
    const authorName = pendingAuthorName.trim();
    if (!pendingManuscript) {
      showNotification.warning('Please choose the article PDF file.');
      return;
    }
    if (!title) {
      showNotification.warning('Please enter the article title.');
      return;
    }
    if (!authorName) {
      showNotification.warning('Please enter the author name.');
      return;
    }

    setSelectedArticles((prev) => [
      ...prev,
      {
        tempId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title,
        authorName,
        manuscriptFile: pendingManuscript,
        coverFile: pendingCover,
      },
    ]);

    setPickerOpen(false);
    setPendingTitle('');
    setPendingAuthorName('');
    setPendingManuscript(null);
    setPendingCover(null);
    setPendingManuscriptPickerKey((k) => k + 1);
    setPendingCoverPickerKey((k) => k + 1);
  };

  const removeArticle = (tempId: string) => {
    setSelectedArticles((prev) => prev.filter((p) => p.tempId !== tempId));
  };

  const createBook = async () => {
    if (!user?.id) return;

    const t = bookTitle.trim();
    const year = Number(editionYear);
    if (!t) {
      showNotification.warning('Please enter a book title.');
      return;
    }
    if (!Number.isFinite(year) || year < 1900 || year > 3000) {
      showNotification.warning('Please enter a valid edition year.');
      return;
    }
    if (selectedArticles.length === 0) {
      showNotification.warning('Please add at least one article.');
      return;
    }

    if (bookCover && !isImageFile(bookCover)) {
      showNotification.warning('Book cover must be an image file (JPG, PNG, GIF, WEBP).');
      return;
    }

    for (const s of selectedArticles) {
      if (!s.manuscriptFile) {
        showNotification.warning('Each article must have a PDF file.');
        return;
      }

      if (!isPdfFile(s.manuscriptFile)) {
        showNotification.warning('Each article manuscript must be a PDF file.');
        return;
      }

      if (s.coverFile && !isImageFile(s.coverFile)) {
        showNotification.warning('Article cover must be an image file (JPG, PNG, GIF, WEBP).');
        return;
      }
      if (!s.title.trim()) {
        showNotification.warning('Each article must have a title.');
        return;
      }
      if (!s.authorName.trim()) {
        showNotification.warning('Each article must have an author name.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const createdArticleIds: number[] = [];
      for (const s of selectedArticles) {
        const fd = new FormData();
        fd.set('authorId', String(user.id));
        fd.set('title', s.title.trim());
        fd.set('abstract', s.title.trim());
        fd.set('authors', JSON.stringify([{ name: s.authorName.trim() }]));
        fd.set('status', 'accepted');
        fd.set('manuscript', s.manuscriptFile);

        const res = await fetch('/api/articles', {
          method: 'POST',
          headers: {
            'x-user-id': String(user.id),
            'x-user-role': 'administrator',
          },
          body: fd,
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error || 'Failed to create an article');
        }

        const newId = Number(data?.article?.id);
        if (!Number.isFinite(newId) || newId <= 0) {
          throw new Error('Invalid article id returned from server');
        }
        createdArticleIds.push(newId);
      }

      const formData = new FormData();
      formData.set('title', t);
      formData.set('editionYear', String(year));
      formData.set(
        'articleIds',
        JSON.stringify(createdArticleIds)
      );
      formData.set(
        'articleMeta',
        JSON.stringify(
          createdArticleIds.map((id, idx) => ({
            articleId: id,
            title: selectedArticles[idx]?.title || `Article #${id}`,
          }))
        )
      );

      if (bookCover) {
        formData.set('cover', bookCover);
      }

      for (let i = 0; i < selectedArticles.length; i++) {
        const s = selectedArticles[i];
        const id = createdArticleIds[i];
        if (id && s?.coverFile) {
          formData.set(`articleCover_${id}`, s.coverFile);
        }
      }

      const res = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'x-user-id': String(user.id),
          'x-user-role': 'administrator',
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to create publication');
      }

      showNotification.success('Publication created successfully. You can publish it from the Publish page.');
      router.push('/dashboard/admin/publish');
    } catch (e: any) {
      console.error(e);
      showNotification.error(e?.message || 'Failed to create publication');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Publication</h1>
            <p className="text-gray-600 mt-1">Create a new book/issue by selecting multiple articles.</p>
          </div>
          <button type="button" className="btn-secondary" onClick={() => router.push('/dashboard/admin/publish')}>
            Back
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-semibold text-gray-900 mb-2">Book Title</label>
              <input
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="e.g., 2026 Army Green Book"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-900 mb-2">Edition Year</label>
              <input
                type="number"
                value={editionYear}
                onChange={(e) => setEditionYear(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="e.g., 2026"
              />
            </div>
          </div>

          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-bold text-gray-900">Book Cover</div>
                <div className="text-sm text-gray-600 mt-1">Choose an image (PNG/JPG and other image formats).</div>
              </div>
              {bookCover ? (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setBookCover(null);
                    setBookCoverPickerKey((k) => k + 1);
                  }}
                >
                  Remove
                </button>
              ) : null}
            </div>

            <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="btn-primary inline-flex items-center justify-center cursor-pointer">
                Choose File
                <input
                  key={bookCoverPickerKey}
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp"
                  onChange={(e) => setBookCover(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              <div className="text-sm text-gray-700">
                {bookCover ? bookCover.name : 'No file chosen'}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-gray-700">
              Selected Articles: <strong>{selectedArticles.length}</strong>
            </div>
            <button type="button" className="btn-primary" onClick={() => setPickerOpen(true)}>
              Add Article
            </button>
          </div>

          {selectedArticles.length === 0 ? (
            <div className="text-gray-600">No articles selected yet.</div>
          ) : (
            <div className="space-y-4">
              {selectedArticles.map((s) => (
                <div key={s.tempId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {s.title}
                      </div>
                      <div className="text-xs text-gray-700 mt-2">
                        Author Name: <span className="font-semibold">{s.authorName}</span>
                      </div>
                      <div className="text-xs text-gray-700 mt-1">
                        PDF File: <span className="font-semibold">{s.manuscriptFile?.name || 'None'}</span>
                      </div>
                      <div className="text-xs text-gray-700 mt-1">
                        Cover Page: <span className="font-semibold">{s.coverFile ? s.coverFile.name : 'None'}</span>
                      </div>
                    </div>
                    <button type="button" className="btn-secondary" onClick={() => removeArticle(s.tempId)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => router.push('/dashboard/admin/publish')} disabled={submitting}>
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={createBook} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Publication'}
            </button>
          </div>
        </div>

        {pickerOpen ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Add Article</h2>
                  <div className="text-sm text-gray-600 mt-1">Upload a PDF and enter details, then click Done.</div>
                </div>
                <button type="button" onClick={() => setPickerOpen(false)} className="text-gray-500 hover:text-gray-700">
                  ×
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Article PDF</label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <label className="btn-primary inline-flex items-center justify-center cursor-pointer">
                        Choose File
                        <input
                          key={pendingManuscriptPickerKey}
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => setPendingManuscript(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </label>
                      <div className="text-sm text-gray-700">
                        {pendingManuscript ? pendingManuscript.name : 'No file chosen'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Article Cover Page</label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <label className="btn-primary inline-flex items-center justify-center cursor-pointer">
                        Choose File
                        <input
                          key={pendingCoverPickerKey}
                          type="file"
                          accept=".jpg,.jpeg,.png,.gif,.webp"
                          onChange={(e) => setPendingCover(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </label>
                      <div className="text-sm text-gray-700">
                        {pendingCover ? pendingCover.name : 'No file chosen'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Title</label>
                    <input
                      value={pendingTitle}
                      onChange={(e) => setPendingTitle(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                      placeholder="Enter article title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Author Name</label>
                    <input
                      value={pendingAuthorName}
                      onChange={(e) => setPendingAuthorName(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                      placeholder="Enter author name"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setPickerOpen(false);
                      setPendingTitle('');
                      setPendingAuthorName('');
                      setPendingManuscript(null);
                      setPendingCover(null);
                      setPendingManuscriptPickerKey((k) => k + 1);
                      setPendingCoverPickerKey((k) => k + 1);
                    }}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={addArticle}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
