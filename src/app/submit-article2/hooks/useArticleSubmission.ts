'use client';

import { useState, useCallback } from 'react';
import { ArticleForm, StoredArticle, EditorSubmission, User, ArticleSubmissionResponse, ArticleStatus } from '../types/article.types';
import { 
  readArticlesFromStorage, 
  writeArticlesToStorage, 
  readEditorSubmissions, 
  writeEditorSubmissions,
  saveDraft,
  loadDraft,
  isWithinEditWindow
} from '../utils/storage';
import { EDIT_WINDOW_HOURS } from '../utils/constants';

export const useArticleSubmission = (user: User | null) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const submitArticle = useCallback(async (formData: ArticleForm, isEditMode: boolean = false, editingArticleId?: number | null): Promise<boolean> => {
    if (!user) {
      setSubmissionError('User not authenticated');
      return false;
    }

    setIsSubmitting(true);
    setSubmissionError(null);
    setSubmissionSuccess(false);

    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const submitForm = new FormData();
      submitForm.append('authorId', String(user.id));
      submitForm.append('title', formData.title);
      submitForm.append('abstract', formData.abstract);
      submitForm.append('keywords', formData.keywords);
      submitForm.append('content', formData.content);
      submitForm.append('authors', JSON.stringify(formData.authors || []));
      submitForm.append('affiliation', formData.affiliation);
      submitForm.append('articleType', formData.articleType);
      submitForm.append('coverLetter', formData.coverLetter);
      submitForm.append('conflicts', formData.conflicts);
      submitForm.append('funding', formData.funding);
      submitForm.append('ethics', formData.ethics ? '1' : '0');
      submitForm.append('licenseAgreement', formData.licenseAgreement ? '1' : '0');
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

      const createdData = await createResponse.json() as ArticleSubmissionResponse;
      const created = createdData.article;

      const storedArticle: StoredArticle = {
        id: created.id,
        title: created.title,
        abstract: created.abstract,
        status: created.status as ArticleStatus,
        submission_date: created.submission_date,
        last_updated: created.last_updated,
        keywords: created.keywords,
        content: created.content,
        authors: created.authors || formData.authors,
        affiliation: created.affiliation,
        articleType: created.article_type,
        author_id: created.author_id,
        manuscriptFileName: created.manuscript_file_name || formData.manuscriptFile?.name,
        coverLetter: (created as any).cover_letter ?? formData.coverLetter,
        conflicts: (created as any).conflicts ?? formData.conflicts,
        funding: (created as any).funding ?? formData.funding,
        ethics: Boolean((created as any).ethics ?? formData.ethics),
        licenseAgreement: Boolean((created as any).license_agreement ?? formData.licenseAgreement),
      };

      // Update local storage
      const existingArticles = readArticlesFromStorage(user.id);
      writeArticlesToStorage(user.id, [storedArticle, ...existingArticles]);

      // Send to editor dashboard
      const mainAuthor = formData.authors.find(a => a.role === 'Main Author') || formData.authors[0];
      const editorSubmission: EditorSubmission = {
        id: created.id,
        title: formData.title,
        author_name: mainAuthor.name || user.full_name || user.username,
        author_id: user.id,
        submitted_at: new Date().toISOString(),
        status: 'new',
        abstract: formData.abstract,
        keywords: formData.keywords,
        authors: formData.authors,
      };
      
      const editorSubmissions = readEditorSubmissions();
      writeEditorSubmissions([editorSubmission, ...editorSubmissions]);

      setSubmissionSuccess(true);
      return true;

    } catch (error: any) {
      console.error('Submission error:', error);
      setSubmissionError(error?.message || 'Failed to submit article.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user]);

  const updateArticle = useCallback(async (formData: ArticleForm, articleId: number): Promise<boolean> => {
    if (!user) {
      setSubmissionError('User not authenticated');
      return false;
    }

    setIsSubmitting(true);
    setSubmissionError(null);
    setSubmissionSuccess(false);

    try {
      const allArticles = readArticlesFromStorage(user.id);
      const articleToUpdate = allArticles.find(a => a.id === articleId);

      if (!articleToUpdate) {
        throw new Error('Article not found');
      }

      // Check if within edit window
      if (!isWithinEditWindow(articleToUpdate.submission_date, EDIT_WINDOW_HOURS)) {
        throw new Error('Edit window has expired');
      }

      const updatedArticles = allArticles.map(article => 
        article.id === articleId 
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
      setSubmissionSuccess(true);
      return true;

    } catch (error: any) {
      console.error('Update error:', error);
      setSubmissionError(error?.message || 'Failed to update article.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user]);

  const saveDraftArticle = useCallback((formData: ArticleForm, articleId?: number): StoredArticle => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    return saveDraft(user.id, formData, articleId);
  }, [user]);

  const loadDraftArticle = useCallback((articleId: number): StoredArticle | null => {
    if (!user) return null;
    return loadDraft(user.id, articleId);
  }, [user]);

  const convertDraftToSubmission = useCallback(async (draftId: number, formData: ArticleForm): Promise<boolean> => {
    if (!user) {
      setSubmissionError('User not authenticated');
      return false;
    }

    try {
      // First submit the article to the API
      const success = await submitArticle(formData, false);
      
      if (success) {
        // Remove the draft from local storage
        const allArticles = readArticlesFromStorage(user.id);
        const filteredArticles = allArticles.filter(article => !(article.id === draftId && article.status === 'draft'));
        writeArticlesToStorage(user.id, filteredArticles);
      }
      
      return success;
    } catch (error: any) {
      console.error('Draft conversion error:', error);
      setSubmissionError(error?.message || 'Failed to convert draft to submission.');
      return false;
    }
  }, [user, submitArticle]);

  const resetSubmissionState = useCallback(() => {
    setIsSubmitting(false);
    setSubmissionError(null);
    setSubmissionSuccess(false);
  }, []);

  return {
    // State
    isSubmitting,
    submissionError,
    submissionSuccess,

    // Actions
    submitArticle,
    updateArticle,
    saveDraftArticle,
    loadDraftArticle,
    convertDraftToSubmission,
    resetSubmissionState,
  };
};
