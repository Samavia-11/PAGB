'use client';

import React from 'react';
import { ArticleForm, AuthorEntry } from '../../types/article.types';
import { formatFileSize } from '../../utils/validation';
import { 
  CheckCircle, 
  FileText, 
  Users, 
  Hash, 
  Building, 
  Upload,
  AlertTriangle,
  Edit,
  Eye
} from 'lucide-react';

interface Step5ReviewProps {
  formData: ArticleForm;
  onEditStep: (step: number) => void;
  errors: Record<string, string[]>;
  disabled?: boolean;
}

export const Step5Review: React.FC<Step5ReviewProps> = ({
  formData,
  onEditStep,
  errors,
  disabled = false,
}) => {
  const hasErrors = Object.keys(errors).length > 0;
  const keywords = formData.keywords.split(',').map(k => k.trim()).filter(k => k);
  const mainAuthor = formData.authors.find(a => a.role === 'Main Author');

  const ReviewSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    step: number;
    children: React.ReactNode;
    hasError?: boolean;
  }> = ({ title, icon, step, children, hasError = false }) => (
    <div className={`border-2 rounded-lg p-6 transition-all duration-200 ${
      hasError ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {icon}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {hasError && (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          )}
        </div>
        <button
          type="button"
          onClick={() => onEditStep(step)}
          disabled={disabled}
          className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Edit className="h-4 w-4" />
          <span>Edit</span>
        </button>
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Submit</h2>
        <p className="text-gray-600">Please review your information before submitting</p>
      </div>

      {/* Validation Summary */}
      {hasErrors && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-2">Please Fix These Issues</h3>
              <div className="space-y-2">
                {Object.entries(errors).map(([field, fieldErrors]) => (
                  <div key={field} className="text-sm text-red-800">
                    <strong>{field}:</strong> {fieldErrors.join(', ')}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Indicator */}
      {!hasErrors && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">Ready to Submit</h3>
              <p className="text-green-800">All required information has been provided correctly.</p>
            </div>
          </div>
        </div>
      )}

      {/* Basic Information Review */}
      <ReviewSection
        title="Basic Information"
        icon={<FileText className="h-5 w-5 text-gray-600" />}
        step={1}
        hasError={!!errors.title || !!errors.articleType}
      >
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-500">Article Title:</span>
            <p className="text-gray-900 font-medium">{formData.title || 'Not provided'}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Article Type:</span>
            <p className="text-gray-900">{formData.articleType || 'Not selected'}</p>
          </div>
        </div>
      </ReviewSection>

      {/* Authors & Affiliation Review */}
      <ReviewSection
        title="Authors & Affiliation"
        icon={<Users className="h-5 w-5 text-gray-600" />}
        step={2}
        hasError={!!errors.authors || !!errors.affiliation}
      >
        <div className="space-y-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Authors ({formData.authors.length}):</span>
            <div className="mt-2 space-y-2">
              {formData.authors.map((author, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {author.role === 'Main Author' ? (
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-600 font-bold text-sm">M</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-bold text-sm">{index + 1}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {author.name || 'Name not provided'}
                      {author.role === 'Main Author' && (
                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          Main Author
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">{author.email || 'Email not provided'}</p>
                    {author.contact && (
                      <p className="text-sm text-gray-600">{author.contact}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Institutional Affiliation:</span>
            <p className="text-gray-900">{formData.affiliation || 'Not provided'}</p>
          </div>
        </div>
      </ReviewSection>

      {/* Manuscript Details Review */}
      <ReviewSection
        title="Manuscript Details"
        icon={<Eye className="h-5 w-5 text-gray-600" />}
        step={3}
        hasError={!!errors.abstract || !!errors.keywords || !!errors.manuscriptFile}
      >
        <div className="space-y-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Abstract:</span>
            <p className="text-gray-900 mt-1 text-sm leading-relaxed">
              {formData.abstract || 'Not provided'}
            </p>
            {formData.abstract && (
              <p className="text-xs text-gray-500 mt-1">
                Word count: {formData.abstract.trim().split(/\s+/).filter(w => w.length > 0).length}
              </p>
            )}
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-500">Keywords ({keywords.length}):</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  <Hash className="h-3 w-3 mr-1" />
                  {keyword}
                </span>
              ))}
            </div>
            {keywords.length === 0 && (
              <p className="text-gray-500 italic">No keywords provided</p>
            )}
          </div>

          <div>
            <span className="text-sm font-medium text-gray-500">Manuscript File:</span>
            {formData.manuscriptFile ? (
              <div className="mt-2 flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Upload className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">{formData.manuscriptFile.name}</p>
                  <p className="text-sm text-gray-600">{formatFileSize(formData.manuscriptFile.size)}</p>
                </div>
              </div>
            ) : (
              <p className="text-red-600 italic">No file uploaded</p>
            )}
          </div>
        </div>
      </ReviewSection>

      {/* Declarations Review */}
      <ReviewSection
        title="Declarations"
        icon={<CheckCircle className="h-5 w-5 text-gray-600" />}
        step={4}
        hasError={!!errors.ethics || !!errors.licenseAgreement}
      >
        <div className="space-y-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Cover Letter:</span>
            <p className="text-gray-900 mt-1 text-sm">
              {formData.coverLetter || 'Not provided'}
            </p>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-500">Conflict of Interest:</span>
            <p className="text-gray-900 mt-1 text-sm">
              {formData.conflicts || 'Not provided'}
            </p>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-500">Funding Statement:</span>
            <p className="text-gray-900 mt-1 text-sm">
              {formData.funding || 'Not provided'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                formData.ethics ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {formData.ethics ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-red-600" />
                )}
              </div>
              <span className="text-sm text-gray-700">Ethical Compliance</span>
            </div>

            <div className="flex items-center space-x-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                formData.licenseAgreement ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {formData.licenseAgreement ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-red-600" />
                )}
              </div>
              <span className="text-sm text-gray-700">License Agreement</span>
            </div>
          </div>
        </div>
      </ReviewSection>

      {/* Final Submission Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Eye className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Before You Submit</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                Review all information carefully for accuracy
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                Ensure your manuscript file is the final version
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                Confirm all author information is correct
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                You can edit your submission within 3 hours after submission
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
