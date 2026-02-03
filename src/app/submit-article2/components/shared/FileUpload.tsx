'use client';

import React, { useRef, useState } from 'react';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { showNotification } from '@/utils/notifications';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  accept?: string[];
  maxSize?: number;
  maxSizeMB?: number;
  error?: string[];
  disabled?: boolean;
  className?: string;
  showPreview?: boolean;
  dragAndDrop?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  selectedFile,
  accept = ['.doc', '.docx'],
  maxSize = 10 * 1024 * 1024, // 10MB
  maxSizeMB = 10,
  error = [],
  disabled = false,
  className = '',
  showPreview = true,
  dragAndDrop = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const handleFileSelect = (file: File | null, inputElement?: HTMLInputElement) => {
    if (!file) {
      onFileSelect(null);
      setDragError(null);
      return;
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!accept.includes(fileExtension)) {
      const errorMessage = `Invalid file type. Accepted formats: ${accept.join(', ')}`;
      setDragError(errorMessage);
      showNotification.error(errorMessage);
      // Clear the input
      if (inputElement) {
        inputElement.value = '';
      }
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      const errorMessage = `File size exceeds ${maxSizeMB}MB limit`;
      setDragError(errorMessage);
      showNotification.error(errorMessage);
      // Clear the input
      if (inputElement) {
        inputElement.value = '';
      }
      return;
    }

    setDragError(null);
    onFileSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file, e.target);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = () => {
    handleFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const hasError = error.length > 0 || dragError !== null;

  return (
    <div className={`space-y-2 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInputChange}
        accept={accept.join(',')}
        disabled={disabled}
        className="hidden"
        aria-label="File upload"
      />

      {!selectedFile ? (
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${hasError ? 'border-red-500 bg-red-50' : ''}
          `}
          onClick={openFileDialog}
          onDragOver={dragAndDrop ? handleDragOver : undefined}
          onDragLeave={dragAndDrop ? handleDragLeave : undefined}
          onDrop={dragAndDrop ? handleDrop : undefined}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              e.preventDefault();
              openFileDialog();
            }
          }}
          aria-label="Upload file"
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              {dragAndDrop ? 'Drop your file here, or click to browse' : 'Click to browse files'}
            </p>
            <p className="text-sm text-gray-500">
              Accepted formats: {accept.join(', ')}
            </p>
            <p className="text-sm text-gray-500">
              Maximum file size: {maxSizeMB}MB
            </p>
          </div>
        </div>
      ) : (
        showPreview && (
          <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <File className="h-8 w-8 text-blue-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                disabled={disabled}
                className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Remove file"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )
      )}

      {(hasError) && (
        <div className="space-y-1" role="alert">
          {(error || []).map((errorMessage, index) => (
            <p key={index} className="text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              {errorMessage}
            </p>
          ))}
          {dragError && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              {dragError}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
