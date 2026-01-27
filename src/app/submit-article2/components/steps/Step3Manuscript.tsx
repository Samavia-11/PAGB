'use client';

import React from 'react';
import { FormField, FileUpload, KeywordInput } from '../shared';
import { ArticleForm } from '../../types/article.types';
import { MAX_ABSTRACT_WORDS, ACCEPTED_FILE_TYPES } from '../../types/article.types';
import { countWords } from '../../utils/validation';
import { FileText, Hash, Upload } from 'lucide-react';

interface Step3ManuscriptProps {
  formData: ArticleForm;
  onChange: (updates: Partial<ArticleForm>) => void;
  errors: Record<string, string[]>;
  disabled?: boolean;
}

export const Step3Manuscript: React.FC<Step3ManuscriptProps> = ({
  formData,
  onChange,
  errors,
  disabled = false,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const handleFileSelect = (file: File | null) => {
    onChange({ manuscriptFile: file });
  };

  const handleKeywordsChange = (keywords: string[]) => {
    onChange({ keywords: keywords.join(', ') });
  };

  const currentKeywords = formData.keywords.split(',').map(k => k.trim()).filter(k => k);
  const wordCount = countWords(formData.abstract);

  // Common academic keywords for suggestions
  const keywordSuggestions = [
    'machine learning', 'artificial intelligence', 'deep learning', 'neural networks',
    'data science', 'algorithm', 'optimization', 'classification', 'regression',
    'clustering', 'natural language processing', 'computer vision', 'robotics',
    'big data', 'cloud computing', 'cybersecurity', 'blockchain', 'iot',
    'reinforcement learning', 'supervised learning', 'unsupervised learning'
  ];

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Manuscript Details</h2>
        <p className="text-gray-600">Provide your abstract, keywords, and upload your manuscript</p>
      </div>

      {/* Abstract */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Abstract</h3>
        </div>

        <FormField
          label="Abstract"
          name="abstract"
          value={formData.abstract}
          onChange={handleInputChange}
          error={errors.abstract}
          required={true}
          type="textarea"
          rows={6}
          placeholder="Provide a concise summary of your research..."
          disabled={disabled}
          description="Summarize your research objectives, methods, results, and conclusions"
          className="resize-none"
        />

        {/* Word Count Indicator */}
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">Word Count</span>
          <div className="flex items-center space-x-2">
            <span className={`font-medium ${
              wordCount > MAX_ABSTRACT_WORDS ? 'text-red-600' : 'text-gray-900'
            }`}>
              {wordCount}
            </span>
            <span className="text-sm text-gray-500">/ {MAX_ABSTRACT_WORDS} words</span>
          </div>
        </div>

        {wordCount > MAX_ABSTRACT_WORDS && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              Abstract exceeds the maximum word limit of {MAX_ABSTRACT_WORDS} words.
            </p>
          </div>
        )}
      </div>

      {/* Keywords */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Hash className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Keywords</h3>
        </div>

        <KeywordInput
          keywords={currentKeywords}
          onChange={handleKeywordsChange}
          error={errors.keywords}
          disabled={disabled}
          suggestions={keywordSuggestions}
          placeholder="Add keywords to help others find your research"
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Keyword Guidelines</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Use 3-10 relevant keywords
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Include terms that researchers might search for
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Use standard terminology in your field
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Avoid abbreviations unless widely recognized
            </li>
          </ul>
        </div>
      </div>

      {/* Manuscript File Upload */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Upload className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Manuscript File</h3>
        </div>

        <FileUpload
          onFileSelect={handleFileSelect}
          selectedFile={formData.manuscriptFile}
          accept={ACCEPTED_FILE_TYPES}
          maxSizeMB={10}
          error={errors.manuscriptFile}
          disabled={disabled}
          dragAndDrop={true}
          showPreview={true}
        />

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">File Requirements</h4>
          <ul className="space-y-1 text-sm text-yellow-800">
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Accepted formats: {ACCEPTED_FILE_TYPES.join(', ')}
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Maximum file size: 10MB
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Ensure all figures and tables are included
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Follow journal formatting guidelines
            </li>
          </ul>
        </div>

        {/* Manuscript Guidelines */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Manuscript Guidelines</h4>
          <ul className="space-y-1 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Include title, abstract, main text, references, and acknowledgments
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Use clear headings and subheadings
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Ensure all citations are properly formatted
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Proofread carefully before submission
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
