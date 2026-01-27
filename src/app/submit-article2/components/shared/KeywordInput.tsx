'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface KeywordInputProps {
  keywords: string[];
  onChange: (keywords: string[]) => void;
  placeholder?: string;
  maxKeywords?: number;
  minKeywords?: number;
  error?: string[];
  disabled?: boolean;
  className?: string;
  suggestions?: string[];
}

export const KeywordInput: React.FC<KeywordInputProps> = ({
  keywords,
  onChange,
  placeholder = 'Type keywords and press comma or Enter to add',
  maxKeywords = 10,
  minKeywords = 3,
  error = [],
  disabled = false,
  className = '',
  suggestions = [],
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasError = error.length > 0;
  const isMaxReached = keywords.length >= maxKeywords;

  useEffect(() => {
    if (inputValue && suggestions.length > 0) {
      const filtered = suggestions.filter(
        suggestion => 
          suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
          !keywords.includes(suggestion)
      );
      setFilteredSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  }, [inputValue, suggestions, keywords]);

  const addKeyword = (keyword: string) => {
    const trimmedKeyword = keyword.trim();
    
    if (!trimmedKeyword) return;
    
    if (keywords.includes(trimmedKeyword)) return;
    
    if (isMaxReached) return;

    const newKeywords = [...keywords, trimmedKeyword];
    onChange(newKeywords);
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeKeyword = (indexToRemove: number) => {
    const newKeywords = keywords.filter((_, index) => index !== indexToRemove);
    onChange(newKeywords);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow comma and backspace for removing last character
    if (value.includes(',')) {
      const parts = value.split(',');
      const beforeComma = parts[0].trim();
      if (beforeComma) {
        addKeyword(beforeComma);
      }
    } else {
      setInputValue(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addKeyword(inputValue.trim());
      }
    } else if (e.key === 'Backspace' && !inputValue && keywords.length > 0) {
      // Remove last keyword when backspace is pressed on empty input
      removeKeyword(keywords.length - 1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault();
      // Focus first suggestion
      const firstSuggestion = document.querySelector('.keyword-suggestion') as HTMLElement;
      firstSuggestion?.focus();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    addKeyword(suggestion);
  };

  const handleSuggestionKeyDown = (e: React.KeyboardEvent, suggestion: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      addKeyword(suggestion);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextElement = (e.target as HTMLElement).nextElementSibling as HTMLElement;
      nextElement?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevElement = (e.target as HTMLElement).previousElementSibling as HTMLElement;
      prevElement?.focus();
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Add current input as keyword if it's valid
    setTimeout(() => {
      if (inputValue.trim() && !isMaxReached) {
        addKeyword(inputValue.trim());
      }
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2 mb-2">
        {keywords.map((keyword, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
          >
            {keyword}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeKeyword(index)}
                className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                aria-label={`Remove keyword: ${keyword}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
      </div>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => {
            if (inputValue && filteredSuggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={isMaxReached ? `Maximum ${maxKeywords} keywords reached` : placeholder}
          disabled={disabled || isMaxReached}
          className={`
            w-full px-4 py-3 border-2 rounded-lg transition-all duration-200
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'}
            ${isMaxReached ? 'bg-gray-50 text-gray-500' : ''}
          `}
          aria-describedby={`keyword-help ${hasError ? 'keyword-error' : ''}`}
          aria-invalid={hasError}
          aria-required={minKeywords > 0}
        />

        {showSuggestions && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                className="keyword-suggestion px-4 py-2 hover:bg-gray-100 cursor-pointer focus:bg-gray-100 focus:outline-none"
                onClick={() => handleSuggestionClick(suggestion)}
                onKeyDown={(e) => handleSuggestionKeyDown(e, suggestion)}
                tabIndex={0}
                role="option"
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between text-sm text-gray-500">
        <span id="keyword-help">
          Press comma or Enter to add keywords{minKeywords > 0 ? ` (minimum ${minKeywords})` : ''}
        </span>
        <span>
          {keywords.length}/{maxKeywords}
        </span>
      </div>

      {hasError && (
        <div id="keyword-error" className="space-y-1" role="alert">
          {error.map((errorMessage, index) => (
            <p key={index} className="text-sm text-red-600 flex items-center">
              <span className="w-1 h-1 bg-red-600 rounded-full mr-2 flex-shrink-0" />
              {errorMessage}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
