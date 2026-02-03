'use client';

import React from 'react';
import { FormField } from '../shared/FormField';
import { ArticleForm } from '../../types/article.types';
import { ARTICLE_TYPES, MAX_TITLE_CHARS } from '../../types/article.types';

interface Step1BasicInfoProps {
  formData: ArticleForm;
  onChange: (updates: Partial<ArticleForm>) => void;
  errors: Record<string, string[]>;
  disabled?: boolean;
}

export const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({
  formData,
  onChange,
  errors,
  disabled = false,
}) => {
  const sanitizeAlnumSpaces = (value: string) => String(value || '').replace(/[^A-Za-z0-9\s]+/g, '');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'title') {
      onChange({ [name]: sanitizeAlnumSpaces(value) });
      return;
    }
    onChange({ [name]: value });
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
        <p className="text-gray-600">Let&apos;s start with the essential details about your article</p>
      </div>

      {/* Article Title */}
      <FormField
        label="Article Title"
        name="title"
        value={formData.title}
        onChange={handleInputChange}
        error={errors.title}
        required={true}
        placeholder="Enter a clear, descriptive title for your article"
        maxLength={MAX_TITLE_CHARS}
        disabled={disabled}
        showCharacterCount={true}
        description="Your title should accurately reflect the content and scope of your research"
      />

      {/* Article Type */}
      <FormField
        label="Article Type"
        name="articleType"
        value={formData.articleType}
        onChange={handleInputChange}
        error={errors.articleType}
        required={true}
        type="select"
        options={ARTICLE_TYPES.map(type => ({
          value: type.value,
          label: `${type.label} - ${type.description}`
        }))}
        disabled={disabled}
        description="Select the category that best describes your article"
      />

      {/* Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Title Guidelines
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
            Be concise and informative (maximum {MAX_TITLE_CHARS} characters)
          </li>
          <li className="flex items-start">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
            Use clear, unambiguous language
          </li>
          <li className="flex items-start">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
            Avoid abbreviations and jargon where possible
          </li>
          <li className="flex items-start">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
            Include key terms that researchers might search for
          </li>
        </ul>
      </div>
    </div>
  );
};
