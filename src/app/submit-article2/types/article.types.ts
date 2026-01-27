export interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
  email?: string;
}

export interface AuthorEntry {
  name: string;
  email: string;
  role: 'Main Author' | 'Co-Author';
  contact?: string;
}

export interface ArticleForm {
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

export type ArticleStatus = 'submitted' | 'under_review' | 'reviewed' | 'editor_review' | 'accepted' | 'published' | 'rejected' | 'draft';

export interface StoredArticle {
  id: number;
  title: string;
  abstract: string;
  status: ArticleStatus;
  submission_date: string;
  last_updated: string;
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

export interface EditorSubmission {
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

export interface FormStep {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isValid: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  level: 'error' | 'warning' | 'info';
}

export interface FormValidation {
  [fieldName: string]: string[];
}

export interface WizardState {
  currentStep: number;
  formData: ArticleForm;
  validationErrors: FormValidation;
  isSubmitting: boolean;
  isEditMode: boolean;
  editingArticleId: number | null;
  isEditingDraft: boolean;
}

export interface ArticleSubmissionResponse {
  article: {
    id: number;
    title: string;
    abstract: string;
    status: string;
    submission_date: string;
    last_updated: string;
    keywords: string;
    content: string;
    authors: AuthorEntry[];
    affiliation: string;
    article_type: string;
    author_id: number;
    manuscript_file_name?: string;
  };
}

export const ARTICLE_TYPES = [
  { value: 'Research Article', label: 'Research Article', description: 'Original research findings' },
  { value: 'Review', label: 'Review', description: 'Comprehensive literature review' },
  { value: 'Case Study', label: 'Case Study', description: 'Detailed case analysis' },
  { value: 'Technical Report', label: 'Technical Report', description: 'Technical documentation' }
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_FILE_TYPES = ['.doc', '.docx'];
export const MAX_ABSTRACT_WORDS = 300;
export const MAX_TITLE_CHARS = 200;
