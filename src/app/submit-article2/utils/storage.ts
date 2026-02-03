import { ArticleForm, StoredArticle, EditorSubmission, User } from '../types/article.types';
import { STORAGE_KEYS } from './constants';

export const storageKeyForUser = (userId: number): string => `${STORAGE_KEYS.ARTICLES_PREFIX}${userId}`;

export const readArticlesFromStorage = (userId: number): StoredArticle[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKeyForUser(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredArticle[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading articles from storage:', error);
    return [];
  }
};

export const writeArticlesToStorage = (userId: number, articles: StoredArticle[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKeyForUser(userId), JSON.stringify(articles));
    
    // Notify other tabs of the update
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('articles');
      channel.postMessage({ type: 'updated', userId });
      channel.close();
    }
  } catch (error) {
    console.error('Error writing articles to storage:', error);
  }
};

export const readEditorSubmissions = (): EditorSubmission[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EDITOR_SUBMISSIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as EditorSubmission[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading editor submissions from storage:', error);
    return [];
  }
};

export const writeEditorSubmissions = (submissions: EditorSubmission[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.EDITOR_SUBMISSIONS, JSON.stringify(submissions));
    
    // Notify other tabs of the update
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('editor_submissions');
      channel.postMessage({ type: 'updated' });
      channel.close();
    }
  } catch (error) {
    console.error('Error writing editor submissions to storage:', error);
  }
};

export const saveWizardState = (state: any): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.WIZARD_STATE, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving wizard state:', error);
  }
};

export const loadWizardState = (): any => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WIZARD_STATE);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Error loading wizard state:', error);
    return null;
  }
};

export const clearWizardState = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.WIZARD_STATE);
  } catch (error) {
    console.error('Error clearing wizard state:', error);
  }
};

export const saveDraft = (userId: number, formData: ArticleForm, articleId?: number): StoredArticle => {
  const now = new Date();
  const allArticles = readArticlesFromStorage(userId);
  
  const draftArticle: StoredArticle = {
    id: articleId || now.getTime(),
    title: formData.title || 'Untitled Draft',
    abstract: formData.abstract,
    status: 'draft',
    submission_date: now.toISOString(),
    last_updated: now.toISOString(),
    keywords: formData.keywords,
    content: formData.content,
    authors: formData.authors,
    affiliation: formData.affiliation,
    articleType: formData.articleType,
    coverLetter: formData.coverLetter,
    conflicts: formData.conflicts,
    funding: formData.funding,
    ethics: formData.ethics,
    licenseAgreement: formData.licenseAgreement,
    manuscriptFileName: formData.manuscriptFile?.name,
  };
  
  if (articleId) {
    // Update existing draft
    const updatedArticles = allArticles.map(article => 
      article.id === articleId ? draftArticle : article
    );
    writeArticlesToStorage(userId, updatedArticles);
  } else {
    // Create new draft
    writeArticlesToStorage(userId, [draftArticle, ...allArticles]);
  }
  
  return draftArticle;
};

export const loadDraft = (userId: number, articleId: number): StoredArticle | null => {
  const allArticles = readArticlesFromStorage(userId);
  return allArticles.find(article => article.id === articleId && article.status === 'draft') || null;
};

export const deleteDraft = (userId: number, articleId: number): boolean => {
  const allArticles = readArticlesFromStorage(userId);
  const filteredArticles = allArticles.filter(article => !(article.id === articleId && article.status === 'draft'));
  
  if (filteredArticles.length < allArticles.length) {
    writeArticlesToStorage(userId, filteredArticles);
    return true;
  }
  
  return false;
};

export const getDrafts = (userId: number): StoredArticle[] => {
  const allArticles = readArticlesFromStorage(userId);
  return allArticles.filter(article => article.status === 'draft');
};

export const isWithinEditWindow = (submissionDate: string, hours: number = 3): boolean => {
  const submissionTime = new Date(submissionDate);
  const now = new Date();
  const hoursDiff = (now.getTime() - submissionTime.getTime()) / (1000 * 60 * 60);
  return hoursDiff <= hours;
};
