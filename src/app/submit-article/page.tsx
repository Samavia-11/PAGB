'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Upload, FileText, Save, Send, AlertCircle, ChevronDown, ChevronUp, XCircle } from 'lucide-react';
import { showNotification } from '@/utils/notifications';

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
  email?: string;
}

interface AuthorEntry {
  name: string;
  email: string;
  role: string;
  contact?: string; // Added contact number
}

interface ArticleForm {
  title: string;
  abstract: string;
  keywords: string;
  content: string;
  authors: AuthorEntry[];
  affiliation: string;
  articleType: string;
  coverLetter: string;
  conflicts: string;
  funding: string;
  ethics: boolean;
  licenseAgreement: boolean;
  manuscriptFile: File | null;
}

type ArticleStatus = 'submitted' | 'under_review' | 'reviewed' | 'editor_review' | 'accepted' | 'published' | 'rejected';

interface StoredArticle {
  id: number;
  title: string;
  abstract: string;
  status: ArticleStatus | 'draft';
  submission_date: string;
  last_updated: string;
  // Store additional form data for editing
  keywords?: string;
  content?: string;
  authors?: AuthorEntry[];
  affiliation?: string;
  articleType?: string;
  author_id?: number;
  editorComments?: string;
  reviewerComments?: string;
  reviewedBy?: string;
  reviewedDate?: string;
  manuscriptFileName?: string;
  editorAttachment?: string;
  editorAttachmentName?: string;
  funding?: string;
  ethics?: boolean;
  licenseAgreement?: boolean;
}

interface EditorSubmission {
  id: number;
  title: string;
  author_name: string;
  author_id: number;
  submitted_at: string;
  status: 'new' | 'revision' | 'external_review' | 'author_reply';
  abstract: string;
  keywords?: string;
  authors?: AuthorEntry[];
  last_reply?: string;
}

const storageKeyForUser = (userId: number) => `articles:${userId}`;

const readArticlesFromStorage = (userId: number): StoredArticle[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKeyForUser(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredArticle[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeArticlesToStorage = (userId: number, articles: StoredArticle[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(storageKeyForUser(userId), JSON.stringify(articles));
  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel('articles');
    channel.postMessage({ type: 'updated', userId });
    channel.close();
  }
};

// Editor submissions storage
const editorSubmissionsKey = 'editor_submissions';

const readEditorSubmissions = (): EditorSubmission[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(editorSubmissionsKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as EditorSubmission[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeEditorSubmissions = (submissions: EditorSubmission[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(editorSubmissionsKey, JSON.stringify(submissions));
  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel('editor_submissions');
    channel.postMessage({ type: 'updated' });
    channel.close();
  }
};

const SubmitArticlePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'info' | 'error' | 'success'; text: string } | null>(null);
  const [formData, setFormData] = useState<ArticleForm>({
    title: '',
    abstract: '',
    keywords: '',
    content: '',
    authors: [{ name: '', email: '', role: 'Main Author', contact: '' }],
    affiliation: '',
    articleType: '',
    coverLetter: '',
    conflicts: '',
    funding: '',
    ethics: false,
    licenseAgreement: false,
    manuscriptFile: null,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ArticleForm | 'authorsContact', string>>>({});
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    authors: true,
    manuscript: false,
    declarations: false,
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const router = useRouter();

  const sanitizeNoSpecialChars = (value: string) => String(value || '').replace(/[^A-Za-z0-9\s\r\n.,!?@()\-]+/g, '');
  const sanitizeAlnumSpaces = (value: string) => String(value || '').replace(/[^A-Za-z0-9\s]+/g, '');
  const sanitizeLettersSpaces = (value: string) => String(value || '').replace(/[^A-Za-z\s]+/g, '');
  const digitsOnly = (value: string) => String(value || '').replace(/\D/g, '');

  const showMessage = (type: 'info' | 'error' | 'success', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      // Initialize keywords from formData if it exists
      if (formData.keywords) {
        setKeywords(formData.keywords.split(',').map(k => k.trim()).filter(k => k));
      }
      
      // Check if editing existing article
      const urlParams = new URLSearchParams(window.location.search);
      const editId = urlParams.get('edit');
      if (editId) {
        setIsEditMode(true);
        setEditingArticleId(parseInt(editId));
        loadArticleForEdit(parseInt(editId));
      }
    }
  }, [user]);

  const loadArticleForEdit = (articleId: number) => {
    // Load from all articles (including drafts) for editing
    const allArticles = JSON.parse(localStorage.getItem(`articles:${user!.id}`) || '[]');
    const articleToEdit = allArticles.find((a: StoredArticle) => a.id === articleId);

    if (articleToEdit) {
      // If it's a draft, allow editing anytime
      if (articleToEdit.status === 'draft') {
        setIsEditingDraft(true);
        setFormData(prev => ({
          ...prev,
          title: articleToEdit.title,
          abstract: articleToEdit.abstract,
          keywords: articleToEdit.keywords || prev.keywords,
          content: articleToEdit.content || prev.content,
          authors: articleToEdit.authors || prev.authors,
          affiliation: articleToEdit.affiliation || prev.affiliation,
          articleType: articleToEdit.articleType || prev.articleType,
        }));
        console.log('Loaded draft for edit:', articleToEdit);
      } else {
        // For submitted articles, check time window
        const submissionTime = new Date(articleToEdit.submission_date);
        const now = new Date();
        const hoursDiff = (now.getTime() - submissionTime.getTime()) / (1000 * 60 * 60);

        if (hoursDiff <= 3) {
          setFormData(prev => ({
            ...prev,
            title: articleToEdit.title,
            abstract: articleToEdit.abstract,
            keywords: articleToEdit.keywords || prev.keywords,
            content: articleToEdit.content || prev.content,
            authors: articleToEdit.authors || prev.authors,
            affiliation: articleToEdit.affiliation || prev.affiliation,
            articleType: articleToEdit.articleType || prev.articleType,
          }));
          console.log('Loaded article for edit:', articleToEdit);
        } else {
          alert('Edit window has expired (3 hours after submission)');
          router.push('/dashboard/author');
        }
      }
    } else {
      alert('Article not found');
      router.push('/dashboard/author');
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.user.role !== 'author') {
          router.push('/');
          return;
        }
        setUser(data.user);
        setFormData((prev) => ({
          ...prev,
          authors: [
            {
              name: '',
              email: '',
              role: 'Main Author',
              contact: '',
            },
          ],
        }));
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

  const hasValidMainAuthor = (authors: AuthorEntry[] = formData.authors) =>
    authors.some((a) => a.role === 'Main Author' && a.name.trim() && a.email.trim());

  const hasMainAuthorWithContact = (authors: AuthorEntry[] = formData.authors) =>
    authors.some((a) => a.role === 'Main Author' && a.name.trim() && a.email.trim() && a.contact?.trim() && digitsOnly(a.contact || '').length === 11);

  const handleKeywordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeAlnumSpaces(e.target.value);
    console.log('handleKeywordInputChange:', sanitized);
    setKeywordInput(sanitized);
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      const keyword = keywordInput.trim();
      if (keyword && !keywords.includes(keyword)) {
        setKeywords([...keywords, keyword]);
        setFormData({ ...formData, keywords: [...keywords, keyword].join(', ') });
      }
      setKeywordInput('');
    }
  };

  const removeKeyword = (indexToRemove: number) => {
    const newKeywords = keywords.filter((_, index) => index !== indexToRemove);
    setKeywords(newKeywords);
    setFormData({ ...formData, keywords: newKeywords.join(', ') });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    console.log('handleInputChange:', { name, value, type, checked });
    let nextValue: any = type === 'checkbox' ? checked : value;
    if (name === 'title') {
      nextValue = sanitizeAlnumSpaces(value);
    } else if (name === 'abstract' || name === 'coverLetter' || name === 'conflicts' || name === 'funding') {
      nextValue = sanitizeNoSpecialChars(value);
    } else if (name === 'affiliation') {
      nextValue = sanitizeLettersSpaces(value);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
    if (errors[name as keyof ArticleForm]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleAuthorChange = (index: number, field: keyof AuthorEntry, value: string) => {
    console.log('handleAuthorChange:', { index, field, value });
    const updated = [...formData.authors];
    
    let nextValue = value;
    if (field === 'name') {
      nextValue = sanitizeLettersSpaces(value);
    } else if (field === 'contact') {
      nextValue = digitsOnly(value).slice(0, 11);
    }
    
    // If changing role to Main Author, ensure only one main author exists
    if (field === 'role' && value === 'Main Author') {
      // Set all others to Co-Author first
      updated.forEach((author, i) => {
        if (i !== index) {
          author.role = 'Co-Author';
        }
      });
    }
    
    updated[index] = { ...updated[index], [field]: nextValue };
    setFormData({ ...formData, authors: updated });

    if (!hasValidMainAuthor(updated)) {
      setErrors((prev) => ({
        ...prev,
        authors: 'Please select at least one Main Author with name and email.',
      }));
    } else if (!hasMainAuthorWithContact(updated)) {
      setErrors((prev) => ({
        ...prev,
        authorsContact: 'Main Author must have a contact number.',
      }));
    } else {
      setErrors((prev) => ({ ...prev, authors: '', authorsContact: '' }));
    }
  };

  const addAuthor = () => {
    setFormData({
      ...formData,
      authors: [...formData.authors, { name: '', email: '', role: 'Co-Author', contact: '' }],
    });
  };

  const removeAuthor = (index: number) => {
    const updated = formData.authors.filter((_, i) => i !== index);
    setFormData({ ...formData, authors: updated });

    if (!hasValidMainAuthor(updated)) {
      setErrors((prev) => ({
        ...prev,
        authors: 'Please select at least one Main Author with name and email.',
      }));
    } else if (!hasMainAuthorWithContact(updated)) {
      setErrors((prev) => ({
        ...prev,
        authorsContact: 'Main Author must have a contact number.',
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleFileChange:', e.target.files);
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = '.' + String(file.name || '').split('.').pop()?.toLowerCase();
    if (ext !== '.doc' && ext !== '.docx') {
      const errorMessage = 'Only DOC/DOCX files are allowed';
      showNotification.error(errorMessage);
      setErrors((prev) => ({ ...prev, manuscriptFile: errorMessage }));
      setFormData({ ...formData, manuscriptFile: null });
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      const errorMessage = 'File too large. Maximum size is 10MB';
      showNotification.error(errorMessage);
      setErrors((prev) => ({ ...prev, manuscriptFile: errorMessage }));
      setFormData({ ...formData, manuscriptFile: null });
      e.target.value = '';
      return;
    }

    setErrors((prev) => ({ ...prev, manuscriptFile: '' }));
    setFormData({ ...formData, manuscriptFile: file });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ArticleForm | 'authorsContact' | 'affiliation', string>> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.abstract.trim()) newErrors.abstract = 'Abstract is required';
    if (!formData.keywords.trim()) newErrors.keywords = 'Keywords are required';
    if (!formData.articleType.trim()) newErrors.articleType = 'Article type is required';
    if (!formData.affiliation.trim()) newErrors.affiliation = 'Institutional affiliation is required';
    if (!hasValidMainAuthor()) newErrors.authors = 'Please select a valid Main Author';
    if (!hasMainAuthorWithContact()) newErrors.authorsContact = 'Main Author must have a contact number (exactly 11 digits).';
    if (!formData.manuscriptFile) newErrors.manuscriptFile = 'Main manuscript file is required';
    if (!formData.licenseAgreement) newErrors.licenseAgreement = 'You must accept the license agreement';

    setErrors(newErrors);
    
    // Show popup for any errors
    const errorMessages = Object.values(newErrors);
    if (errorMessages.length > 0) {
      showMessage('error', `Please fix the following errors:\n${errorMessages.join('\n')}`);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (!user) throw new Error('Not authenticated');
      
      // Get all articles (including drafts) for editing
      const allArticles = JSON.parse(localStorage.getItem(`articles:${user.id}`) || '[]') as StoredArticle[];
      const existing = readArticlesFromStorage(user.id); // Only non-drafts for regular operations

      if (isEditMode && editingArticleId) {
        // Check if we're editing a draft or a submitted article
        const articleToEdit = allArticles.find(a => a.id === editingArticleId);
        
        if (articleToEdit && articleToEdit.status === 'draft') {
          // Converting draft to submitted article
          console.log('Converting draft to submission:', articleToEdit);
          const now = new Date();
          const submitForm = new FormData();
          submitForm.append('authorId', String(user.id));
          submitForm.append('title', formData.title);
          submitForm.append('abstract', formData.abstract);
          submitForm.append('keywords', formData.keywords);
          submitForm.append('content', formData.content);
          submitForm.append('authors', JSON.stringify(formData.authors || []));
          submitForm.append('affiliation', formData.affiliation);
          submitForm.append('articleType', formData.articleType);
          submitForm.append('status', 'submitted');
          if (formData.manuscriptFile) {
            submitForm.append('manuscript', formData.manuscriptFile);
          }

          const createResponse = await fetch('/api/articles', {
            method: 'POST',
            headers: {
              'x-user-id': String(user.id),
              'x-user-role': 'author',
            },
            body: submitForm,
          });

          if (!createResponse.ok) {
            const err = await createResponse.json().catch(() => ({}));
            throw new Error(err?.details?.message || err?.error || 'Failed to submit article');
          }

          const createdData = await createResponse.json();
          const created = createdData.article as any;

          const storedSubmittedArticle: StoredArticle = {
            id: created.id,
            title: created.title,
            abstract: created.abstract,
            status: created.status,
            submission_date: created.submission_date,
            last_updated: created.last_updated,
            keywords: created.keywords,
            content: created.content,
            authors: created.authors || formData.authors,
            affiliation: created.affiliation,
            articleType: created.article_type,
            author_id: created.author_id,
            manuscriptFileName: created.manuscript_file_name || formData.manuscriptFile?.name,
          };

          const updatedArticles = allArticles.filter(article => article.id !== editingArticleId);
          writeArticlesToStorage(user.id, [storedSubmittedArticle, ...updatedArticles]);
          console.log('Draft submitted and saved to DB + storage');
          
          // Send to editor dashboard
          const mainAuthor = formData.authors.find(a => a.role === 'Main Author') || formData.authors[0];
          const editorSubmission: EditorSubmission = {
            id: created.id,
            title: formData.title,
            author_name: mainAuthor.name || user.full_name || user.username,
            author_id: user.id,
            submitted_at: now.toISOString(),
            status: 'new',
            abstract: formData.abstract,
            keywords: formData.keywords,
            authors: formData.authors,
          };
          
          const editorSubmissions = readEditorSubmissions();
          writeEditorSubmissions([editorSubmission, ...editorSubmissions]);
          console.log('Draft converted to submission and sent to editor dashboard:', editorSubmission);
        } else {
          // Update existing submitted article
          const updatedArticles = allArticles.map(article => 
            article.id === editingArticleId 
              ? {
                  ...article,
                  title: formData.title,
                  abstract: formData.abstract,
                  keywords: formData.keywords,
                  content: formData.content,
                  authors: formData.authors,
                  affiliation: formData.affiliation,
                  articleType: formData.articleType,
                  last_updated: new Date().toISOString(),
                }
              : article
          );
          writeArticlesToStorage(user.id, updatedArticles);
          console.log('Article updated, navigating to dashboard...');
        }
        
        // Use window.location for more reliable navigation
        window.location.href = '/dashboard/author';
      } else {
        // Create new article and send to editor
        const now = new Date();
        const submitForm = new FormData();
        submitForm.append('authorId', String(user.id));
        submitForm.append('title', formData.title);
        submitForm.append('abstract', formData.abstract);
        submitForm.append('keywords', formData.keywords);
        submitForm.append('content', formData.content);
        submitForm.append('authors', JSON.stringify(formData.authors || []));
        submitForm.append('affiliation', formData.affiliation);
        submitForm.append('articleType', formData.articleType);
        submitForm.append('status', 'submitted');
        if (formData.manuscriptFile) {
          submitForm.append('manuscript', formData.manuscriptFile);
        }

        const createResponse = await fetch('/api/articles', {
          method: 'POST',
          headers: {
            'x-user-id': String(user.id),
            'x-user-role': 'author',
          },
          body: submitForm,
        });

        if (!createResponse.ok) {
          const err = await createResponse.json().catch(() => ({}));
          throw new Error(err?.details?.message || err?.error || 'Failed to submit article');
        }

        const createdData = await createResponse.json();
        const created = createdData.article as any;

        const newArticle: StoredArticle = {
          id: created.id,
          title: created.title,
          abstract: created.abstract,
          status: created.status,
          submission_date: created.submission_date,
          last_updated: created.last_updated,
          keywords: created.keywords,
          content: created.content,
          authors: created.authors || formData.authors,
          affiliation: created.affiliation,
          articleType: created.article_type,
          author_id: created.author_id,
          manuscriptFileName: created.manuscript_file_name || formData.manuscriptFile?.name,
        };

        writeArticlesToStorage(user.id, [newArticle, ...existing]);
        
        // Send to editor dashboard
        const mainAuthor = formData.authors.find(a => a.role === 'Main Author') || formData.authors[0];
        const editorSubmission: EditorSubmission = {
          id: created.id,
          title: formData.title,
          author_name: mainAuthor.name || user.full_name || user.username,
          author_id: user.id,
          submitted_at: now.toISOString(),
          status: 'new',
          abstract: formData.abstract,
          keywords: formData.keywords,
          authors: formData.authors,
        };
        
        const editorSubmissions = readEditorSubmissions();
        writeEditorSubmissions([editorSubmission, ...editorSubmissions]);
        console.log('Article sent to editor dashboard:', editorSubmission);
        
        alert('Article submitted successfully!');
        // Use window.location for more reliable navigation
        setTimeout(() => {
          window.location.href = '/dashboard/author';
        }, 100);
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      alert(error?.message || 'Failed to submit article.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!user) return;
    
    // Allow saving even with minimal data - no validation required for drafts
    try {
      const now = new Date();
      const allArticles = JSON.parse(localStorage.getItem(`articles:${user.id}`) || '[]') as StoredArticle[];
      
      if (isEditMode && editingArticleId) {
        // Update existing draft
        const updatedArticles = allArticles.map(article => 
          article.id === editingArticleId 
            ? {
                ...article,
                title: formData.title || 'Untitled Draft',
                abstract: formData.abstract,
                keywords: formData.keywords,
                content: formData.content,
                authors: formData.authors,
                affiliation: formData.affiliation,
                articleType: formData.articleType,
                funding: formData.funding,
                ethics: formData.ethics,
                licenseAgreement: formData.licenseAgreement,
                manuscriptFileName: formData.manuscriptFile?.name,
                last_updated: now.toISOString(),
              }
            : article
        );
        writeArticlesToStorage(user.id, updatedArticles);
        alert('Draft updated successfully!');
      } else {
        // Create new draft - save whatever data is available
        const draftArticle: StoredArticle = {
          id: now.getTime(),
          title: formData.title || 'Untitled Draft',
          abstract: formData.abstract,
          keywords: formData.keywords,
          content: formData.content,
          authors: formData.authors,
          affiliation: formData.affiliation,
          articleType: formData.articleType,
          funding: formData.funding,
          ethics: formData.ethics,
          licenseAgreement: formData.licenseAgreement,
          manuscriptFileName: formData.manuscriptFile?.name,
          status: 'draft',
          submission_date: now.toISOString(),
          last_updated: now.toISOString(),
        };
        writeArticlesToStorage(user.id, [draftArticle, ...allArticles]);
        alert('Draft saved successfully! You can continue editing it later from the "View Drafts" page.');
        // Refresh page to ensure all data is properly loaded
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
      
      console.log('Draft saved:', { title: formData.title || 'Untitled Draft', status: 'draft' });
    } catch (error) {
      console.error('Save draft error:', error);
      alert('Failed to save draft.');
    }
  };

  const toggleSection = (key: string) => {
    console.log('toggleSection:', key);
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
    
    // Check for errors in this section when opening
    if (!openSections[key]) {
      setTimeout(() => {
        const sectionErrors: string[] = [];
        if (key === 'manuscript') {
          if (!formData.articleType.trim()) sectionErrors.push('Article Type is required');
          if (!formData.abstract.trim()) sectionErrors.push('Abstract is required');
          if (!formData.keywords.trim()) sectionErrors.push('Keywords are required');
          if (!formData.manuscriptFile) sectionErrors.push('Manuscript file is required');
        } else if (key === 'authors') {
          if (!hasValidMainAuthor()) sectionErrors.push('Please select a valid Main Author');
          if (!hasMainAuthorWithContact()) sectionErrors.push('Main Author must have a contact number (exactly 11 digits).');
          if (!formData.affiliation.trim()) sectionErrors.push('Institutional affiliation is required');
        } else if (key === 'declarations') {
          if (!formData.licenseAgreement) sectionErrors.push('You must accept the license agreement');
        }
        if (sectionErrors.length > 0) {
          showMessage('error', `Missing required fields in ${key === 'manuscript' ? 'Manuscript' : key === 'authors' ? 'Authors & Affiliation' : 'Declarations'}:\n${sectionErrors.join('\n')}`);
        }
      }, 100);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <Layout user={user}>
      {/* Message Banner */}
      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg border whitespace-pre-line ${
          message.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
          'bg-blue-50 border-blue-200 text-blue-700'
        }`}>
          {message.text}
        </div>
      )}
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-6">
          {isEditMode ? 'Edit Article' : 'Submit Article'}
        </h1>

        {/* Submission Guidelines */}
        <div className="mb-8 p-6 border border-green-200 rounded-xl bg-green-50 shadow-sm">
          <h2 className="text-lg font-semibold text-green-900 mb-2">Submission Guidelines</h2>
          <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
            <li>Ensure the title clearly reflects the content of your article.</li>
            <li>Abstract should summarize the main findings in under 300 words.</li>
            <li>Keywords should be relevant and separated by commas.</li>
            <li>Upload only Word document files (DOC, DOCX, max 10MB).</li>
            <li>One author must be marked as the Main Author with valid email and contact number.</li>
            <li>Accept the license agreement before submitting.</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-200">
          {/* Title */}
          <div className="mb-8">
            <label className="block text-sm font-semibold mb-3 text-gray-700">Article Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-4 py-4 h-12 border-2 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-2">{errors.title}</p>}
          </div>

          {/* Authors & Affiliation */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-green-700 to-green-800 text-white px-6 py-4 rounded-t-lg">
              <h2 className="text-xl font-bold flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Authors & Affiliation
              </h2>
            </div>
            <div className="bg-white border border-gray-200 border-t-0 rounded-b-lg p-6 shadow-sm">
            {formData.authors.map((author, index) => (
              <div key={index} className="mb-6 p-4 bg-white rounded-lg">
                {/* First Row: Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Name *"
                    value={author.name}
                    onChange={(e) => handleAuthorChange(index, 'name', e.target.value)}
                    className="w-full px-4 py-4 h-14 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    value={author.email}
                    onChange={(e) => handleAuthorChange(index, 'email', e.target.value)}
                    className="w-full px-4 py-4 h-14 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors"
                    required
                  />
                </div>
                
                {/* Second Row: Role and Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {index > 0 && (
                    <select
                      value={author.role}
                      onChange={(e) => handleAuthorChange(index, 'role', e.target.value)}
                      className="w-full px-4 py-4 h-14 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors"
                      style={{ color: '#111827' }}
                    >
                      <option>Main Author</option>
                      <option>Co-Author</option>
                    </select>
                  )}
                  {index === 0 && (
                    <div className="w-full px-4 py-4 h-14 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-medium flex items-center">
                      Main Author
                    </div>
                  )}
                  <input
                    type="tel"
                    placeholder="Contact Number *"
                    value={author.contact || ''}
                    onChange={(e) => handleAuthorChange(index, 'contact', e.target.value)}
                    className="w-full px-4 py-4 h-14 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors"
                    required={author.role === 'Main Author'}
                  />
                </div>
                
                {/* Third Row: Remove Button */}
                {index > 0 && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeAuthor(index)}
                      className="px-6 py-3 h-14 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
            <button type="button" onClick={addAuthor} className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-medium">
              + Add Author
            </button>
            {errors.authors && <p className="text-red-500 text-sm mt-2">{errors.authors}</p>}
            {errors.authorsContact && <p className="text-red-500 text-sm mt-2">{errors.authorsContact}</p>}
            <div className="mt-6">
              <label className="block text-sm font-semibold mb-3 text-gray-700">Institutional Affiliation *</label>
              <input
                type="text"
                name="affiliation"
                value={formData.affiliation}
                onChange={handleInputChange}
                className={`w-full px-4 py-4 h-12 border-2 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors ${errors.affiliation ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {errors.affiliation && <p className="text-red-500 text-sm mt-2">{errors.affiliation}</p>}
            </div>
            </div>
          </div>

          {/* Manuscript Details */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-green-700 to-green-800 text-white px-6 py-4 rounded-t-lg">
              <h2 className="text-xl font-bold flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Manuscript Details
              </h2>
            </div>
            <div className="bg-white border border-gray-200 border-t-0 rounded-b-lg p-6 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">Article Type *</label>
              <select
                name="articleType"
                value={formData.articleType}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors ${errors.articleType ? 'border-red-500' : 'border-gray-300'}`}
                style={{ color: '#111827' }}
              >
                <option value="">Select Article Type</option>
                <option>Research Article</option>
                <option>Review</option>
                <option>Case Study</option>
                <option>Technical Report</option>
              </select>
              {errors.articleType && <p className="text-red-500 text-sm mt-2">{errors.articleType}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">Abstract *</label>
              <textarea
                name="abstract"
                value={formData.abstract}
                onChange={handleInputChange}
                placeholder="Abstract"
                rows={4}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors resize-none ${errors.abstract ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.abstract && <p className="text-red-500 text-sm mt-2">{errors.abstract}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">Keywords *</label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(index)}
                        className="ml-2 text-green-700 hover:text-green-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={keywordInput}
                  onChange={handleKeywordInputChange}
                  onKeyDown={handleKeywordKeyDown}
                  placeholder="Type keywords and press comma or Enter to add"
                  className={`w-full px-4 py-4 h-12 border-2 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors ${errors.keywords ? 'border-red-500' : 'border-gray-300'}`}
                />
                <p className="text-sm text-gray-500">Press comma or Enter to add keywords</p>
              </div>
              {errors.keywords && <p className="text-red-500 text-sm mt-2">{errors.keywords}</p>}
            </div>

            
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">Manuscript File *</label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".doc,.docx"
                  className="hidden"
                  id="manuscript-file-input"
                />
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-5 py-2.5 bg-green-700 text-white font-medium rounded-lg hover:bg-green-800 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                  onClick={() => document.getElementById('manuscript-file-input')?.click()}
                >
                  Choose File
                </button>
                <span className="text-sm text-gray-700 truncate">
                  {formData.manuscriptFile ? formData.manuscriptFile.name : 'No file selected'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Accepted formats: DOC, DOCX (max 10MB)</p>
              {errors.manuscriptFile && <p className="text-red-500 text-sm mt-2">{errors.manuscriptFile}</p>}
            </div>
            </div>
          </div>

          {/* Declarations */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-green-700 to-green-800 text-white px-6 py-4 rounded-t-lg">
              <h2 className="text-xl font-bold flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Declarations
              </h2>
            </div>
            <div className="bg-white border border-gray-200 border-t-0 rounded-b-lg p-6 shadow-sm space-y-6">
            <div>
              <div className="text-sm font-semibold mb-3 text-gray-700">Cover Letter</div>
              <textarea
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleInputChange}
                placeholder="If none then write none"
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors resize-none"
              />
            </div>
            <div>
              <div className="text-sm font-semibold mb-3 text-gray-700">Conflict of Interest</div>
              <textarea
                name="conflicts"
                value={formData.conflicts}
                onChange={handleInputChange}
                placeholder="If none then write none"
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors resize-none"
              />
            </div>
            <div>
              <div className="text-sm font-semibold mb-3 text-gray-700">Funding Statement</div>
              <textarea
                name="funding"
                value={formData.funding}
                onChange={handleInputChange}
                placeholder="If none then write none"
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors resize-none"
              />
            </div>
            <div className="space-y-4">
              <label className="flex items-center p-4 bg-white rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  name="ethics"
                  checked={formData.ethics}
                  onChange={handleInputChange}
                  className="mr-3 w-5 h-5 text-green-700 border-gray-300 rounded focus:ring-green-600"
                />
                <span className="text-sm font-medium text-gray-700">I confirm that this work complies with ethical guidelines.</span>
              </label>
              <label className="flex items-center p-4 bg-white rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  name="licenseAgreement"
                  checked={formData.licenseAgreement}
                  onChange={handleInputChange}
                  className="mr-3 w-5 h-5 text-green-700 border-gray-300 rounded focus:ring-green-600"
                />
                <span className="text-sm font-medium text-gray-700">I agree to the copyright and license terms.</span>
              </label>
              {errors.licenseAgreement && <p className="text-red-500 text-sm mt-2">{errors.licenseAgreement}</p>}
            </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:bg-gray-400 transition-colors font-medium flex items-center"
            >
              {submitting 
                ? (isEditMode && !isEditingDraft ? 'Updating...' : 'Submitting...') 
                : (isEditMode && !isEditingDraft ? 'Update Article' : 'Submit Article')
              }
            </button>
            <button 
              type="button" 
              onClick={handleSaveDraft}
              className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center"
            >
              <Save className="w-4 h-4 mr-2" /> Save Draft
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard/author')}
              className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center"
            >
              <XCircle className="w-4 h-4 mr-2" /> Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default SubmitArticlePage;

