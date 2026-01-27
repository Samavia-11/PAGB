export const FORM_STEPS = [
  {
    id: 1,
    title: 'Basic Information',
    description: 'Article title and type',
    fields: ['title', 'articleType']
  },
  {
    id: 2,
    title: 'Authors & Affiliation',
    description: 'Author information and institutional details',
    fields: ['authors', 'affiliation']
  },
  {
    id: 3,
    title: 'Manuscript Details',
    description: 'Abstract, keywords, and file upload',
    fields: ['abstract', 'keywords', 'manuscriptFile']
  },
  {
    id: 4,
    title: 'Declarations',
    description: 'Cover letter, conflicts, and agreements',
    fields: ['coverLetter', 'conflicts', 'funding', 'ethics', 'licenseAgreement']
  }
] as const;

export const STORAGE_KEYS = {
  ARTICLES_PREFIX: 'articles:',
  EDITOR_SUBMISSIONS: 'editor_submissions',
  DRAFT_PREFIX: 'draft_',
  WIZARD_STATE: 'submit_article_wizard_state'
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PHONE_INVALID: 'Please enter a valid phone number',
  TITLE_TOO_LONG: 'Title must be less than 200 characters',
  ABSTRACT_TOO_LONG: 'Abstract must be less than 300 words',
  FILE_TOO_LARGE: 'File size must be less than 10MB',
  FILE_TYPE_INVALID: 'Only DOC and DOCX files are accepted',
  AT_LEAST_ONE_AUTHOR: 'At least one author is required',
  MAIN_AUTHOR_REQUIRED: 'A main author with valid contact information is required',
  KEYWORDS_REQUIRED: 'At least 3 keywords are required',
  LICENSE_REQUIRED: 'License agreement must be accepted'
} as const;

export const EDIT_WINDOW_HOURS = 3;

export const DEBOUNCE_DELAY = 300;

export const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export const MAX_AUTHORS = 10;

export const MIN_KEYWORDS = 3;

export const MAX_KEYWORDS = 10;

export const MAX_ABSTRACT_WORDS = 300;

export const MAX_TITLE_CHARS = 200;
