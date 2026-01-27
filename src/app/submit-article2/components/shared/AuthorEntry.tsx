'use client';

import React from 'react';
import { FormField } from './FormField';
import { AuthorEntry } from '../../types/article.types';
import { X, User, Mail, Phone, Crown } from 'lucide-react';

interface AuthorEntryComponentProps {
  author: AuthorEntry;
  index: number;
  totalAuthors: number;
  onChange: (index: number, field: keyof AuthorEntry, value: string) => void;
  onRemove: (index: number) => void;
  error?: string[];
  disabled?: boolean;
  canRemove?: boolean;
  showRoleSelector?: boolean;
}

export const AuthorEntryComponent: React.FC<AuthorEntryComponentProps> = ({
  author,
  index,
  totalAuthors,
  onChange,
  onRemove,
  error = [],
  disabled = false,
  canRemove = false,
  showRoleSelector = true,
}) => {
  const hasError = error.length > 0;
  const isMainAuthor = author.role === 'Main Author';
  const isFirstAuthor = index === 0;

  const handleRoleChange = (value: string) => {
    // When changing to Main Author, ensure only one exists
    if (value === 'Main Author') {
      onChange(index, 'role', 'Main Author');
      // Note: Parent component should handle setting other authors to Co-Author
    } else {
      onChange(index, 'role', 'Co-Author');
    }
  };

  return (
    <div className={`
      p-6 rounded-lg border-2 transition-all duration-200
      ${hasError ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}
      ${isMainAuthor ? 'ring-2 ring-blue-100' : ''}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {isMainAuthor ? (
            <Crown className="h-5 w-5 text-yellow-500" />
          ) : (
            <User className="h-5 w-5 text-gray-400" />
          )}
          <h3 className="font-semibold text-gray-800">
            {isFirstAuthor ? 'Primary Author' : `Author ${index + 1}`}
            {isMainAuthor && <span className="ml-2 text-sm text-blue-600">(Main Author)</span>}
          </h3>
        </div>
        
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            disabled={disabled}
            className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={`Remove author ${index + 1}`}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name Field */}
        <div className="relative">
          <FormField
            label="Name"
            name={`author-${index}-name`}
            value={author.name}
            onChange={(e) => onChange(index, 'name', e.target.value)}
            error={hasError ? ['Author name is required'] : []}
            required={true}
            placeholder="Enter author's full name"
            disabled={disabled}
            className="pl-10"
          />
          <User className="absolute left-3 top-9 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>

        {/* Email Field */}
        <div className="relative">
          <FormField
            label="Email"
            name={`author-${index}-email`}
            value={author.email}
            onChange={(e) => onChange(index, 'email', e.target.value)}
            error={hasError ? ['Valid email is required'] : []}
            required={true}
            type="email"
            placeholder="author@example.com"
            disabled={disabled}
            className="pl-10"
          />
          <Mail className="absolute left-3 top-9 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>

        {/* Role Field */}
        {showRoleSelector && !isFirstAuthor && (
          <FormField
            label="Role"
            name={`author-${index}-role`}
            value={author.role}
            onChange={(e) => handleRoleChange(e.target.value)}
            type="select"
            options={[
              { value: 'Main Author', label: 'Main Author' },
              { value: 'Co-Author', label: 'Co-Author' }
            ]}
            disabled={disabled}
            description="Only one author can be designated as Main Author"
          />
        )}

        {/* Contact Field - Required for Main Author */}
        <div className={`relative ${!showRoleSelector || isFirstAuthor ? 'md:col-span-2' : ''}`}>
          <FormField
            label="Contact Number"
            name={`author-${index}-contact`}
            value={author.contact || ''}
            onChange={(e) => onChange(index, 'contact', e.target.value)}
            error={isMainAuthor && !author.contact?.trim() ? ['Contact number is required for Main Author'] : []}
            required={isMainAuthor}
            type="tel"
            placeholder="+1 (555) 123-4567"
            disabled={disabled}
            className="pl-10"
            description={isMainAuthor ? 'Required for Main Author' : 'Optional for Co-Author'}
          />
          <Phone className="absolute left-3 top-9 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Validation Summary */}
      {hasError && (
        <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 font-medium">
            Please complete all required fields for this author.
          </p>
        </div>
      )}

      {/* Main Author Indicator */}
      {isMainAuthor && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Main Author:</strong> This author will receive all correspondence and is responsible for the submission.
          </p>
        </div>
      )}
    </div>
  );
};
