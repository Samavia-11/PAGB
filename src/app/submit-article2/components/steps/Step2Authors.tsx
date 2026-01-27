'use client';

import React from 'react';
import { FormField, AuthorEntryComponent } from '../shared';
import { ArticleForm, AuthorEntry } from '../../types/article.types';
import { MAX_AUTHORS } from '../../utils/constants';
import { Plus, Users, Building } from 'lucide-react';

interface Step2AuthorsProps {
  formData: ArticleForm;
  onChange: (updates: Partial<ArticleForm>) => void;
  errors: Record<string, string[]>;
  disabled?: boolean;
}

export const Step2Authors: React.FC<Step2AuthorsProps> = ({
  formData,
  onChange,
  errors,
  disabled = false,
}) => {
  const handleAuthorChange = (index: number, field: keyof AuthorEntry, value: string) => {
    const updatedAuthors = [...formData.authors];
    
    // If changing role to Main Author, ensure only one exists
    if (field === 'role' && value === 'Main Author') {
      // Set all others to Co-Author first
      updatedAuthors.forEach((author, i) => {
        if (i !== index) {
          author.role = 'Co-Author';
        }
      });
    }
    
    updatedAuthors[index] = { ...updatedAuthors[index], [field]: value };
    onChange({ authors: updatedAuthors });
  };

  const addAuthor = () => {
    if (formData.authors.length < MAX_AUTHORS) {
      const newAuthor: AuthorEntry = {
        name: '',
        email: '',
        role: 'Co-Author',
        contact: '',
      };
      onChange({ authors: [...formData.authors, newAuthor] });
    }
  };

  const removeAuthor = (index: number) => {
    const updatedAuthors = formData.authors.filter((_, i) => i !== index);
    onChange({ authors: updatedAuthors });
  };

  const hasValidMainAuthor = () => {
    return formData.authors.some(author => 
      author.role === 'Main Author' && 
      author.name.trim() && 
      author.email.trim() &&
      author.contact?.trim()
    );
  };

  const getAuthorErrors = (index: number): string[] => {
    const author = formData.authors[index];
    const authorErrors: string[] = [];
    
    if (!author.name.trim()) {
      authorErrors.push('Author name is required');
    }
    
    if (!author.email.trim()) {
      authorErrors.push('Author email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(author.email)) {
      authorErrors.push('Please enter a valid email address');
    }
    
    if (author.role === 'Main Author' && !author.contact?.trim()) {
      authorErrors.push('Contact number is required for Main Author');
    } else if (author.contact && !/^[\d\s\-\+\(\)]+$/.test(author.contact)) {
      authorErrors.push('Please enter a valid phone number');
    }
    
    return authorErrors;
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Authors & Affiliation</h2>
        <p className="text-gray-600">Tell us about the contributors and their institutional affiliations</p>
      </div>

      {/* Authors Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Authors</h3>
            <span className="text-sm text-gray-500">
              ({formData.authors.length}/{MAX_AUTHORS})
            </span>
          </div>
          
          {formData.authors.length < MAX_AUTHORS && (
            <button
              type="button"
              onClick={addAuthor}
              disabled={disabled}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Author</span>
            </button>
          )}
        </div>

        {/* Author Entries */}
        <div className="space-y-4">
          {formData.authors.map((author, index) => (
            <AuthorEntryComponent
              key={index}
              author={author}
              index={index}
              totalAuthors={formData.authors.length}
              onChange={handleAuthorChange}
              onRemove={removeAuthor}
              error={getAuthorErrors(index)}
              disabled={disabled}
              canRemove={index > 0} // First author cannot be removed
              showRoleSelector={index > 0} // First author is always Main Author by default
            />
          ))}
        </div>

        {/* Authors Validation Summary */}
        {!hasValidMainAuthor() && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-medium text-red-800">Main Author Required</h4>
                <p className="text-sm text-red-700 mt-1">
                  Please ensure at least one author is designated as Main Author with complete contact information.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Authors Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Author Guidelines</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              One author must be designated as the Main Author with valid contact information
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              All authors must have valid email addresses
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Maximum {MAX_AUTHORS} authors allowed
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Author order should reflect contribution significance
            </li>
          </ul>
        </div>
      </div>

      {/* Institutional Affiliation */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Building className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Institutional Affiliation</h3>
        </div>

        <FormField
          label="Primary Institution"
          name="affiliation"
          value={formData.affiliation}
          onChange={(e) => onChange({ affiliation: e.target.value })}
          error={errors.affiliation}
          required={true}
          placeholder="e.g., Department of Computer Science, University of Example"
          disabled={disabled}
          description="Enter the primary institutional affiliation for the Main Author"
        />

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Affiliation Guidelines</h4>
          <ul className="space-y-1 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Include department, institution, city, and country
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Use official institutional names
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              This will be used for correspondence and publication
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
