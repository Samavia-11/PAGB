'use client';

import React from 'react';
import { FormField } from '../shared/FormField';
import { showNotification } from '@/utils/notifications';
import { ArticleForm } from '../../types/article.types';
import { FileText, AlertTriangle, DollarSign, CheckCircle, FileCheck } from 'lucide-react';

interface Step4DeclarationsProps {
  formData: ArticleForm;
  onChange: (updates: Partial<ArticleForm>) => void;
  errors: Record<string, string[]>;
  disabled?: boolean;
}

export const Step4Declarations: React.FC<Step4DeclarationsProps> = ({
  formData,
  onChange,
  errors,
  disabled = false,
}) => {
  const sanitizeNoSpecialCharsMultiline = (value: string) => String(value || '').replace(/[^A-Za-z0-9\s\r\n]+/g, '');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      onChange({ [name]: checked });
      return;
    }

    if (name === 'coverLetter' || name === 'conflicts' || name === 'funding') {
      onChange({ [name]: sanitizeNoSpecialCharsMultiline(value) });
      return;
    }

    onChange({ [name]: value });
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Declarations</h2>
        <p className="text-gray-600">Complete the required declarations and agreements</p>
      </div>

      {/* Cover Letter */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Cover Letter</h3>
        </div>

        <FormField
          label="Cover Letter"
          name="coverLetter"
          value={formData.coverLetter}
          onChange={handleInputChange}
          error={errors.coverLetter}
          type="textarea"
          rows={4}
          placeholder="Provide a brief cover letter for the editors..."
          disabled={disabled}
          description="Explain why your article is suitable for this journal and highlight its significance"
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Cover Letter Tips</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Briefly introduce your research and its importance
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Explain why this journal is appropriate for your work
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Mention any special considerations or requests
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Keep it concise (typically 200-400 words)
            </li>
          </ul>
        </div>
      </div>

      {/* Conflict of Interest */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Conflict of Interest</h3>
        </div>

        <FormField
          label="Conflict of Interest Statement"
          name="conflicts"
          value={formData.conflicts}
          onChange={handleInputChange}
          error={errors.conflicts}
          type="textarea"
          rows={3}
          placeholder="Declare any potential conflicts of interest..."
          disabled={disabled}
          description="Declare any financial, personal, or professional relationships that could influence your work"
        />

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">What to Declare</h4>
          <ul className="space-y-1 text-sm text-yellow-800">
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Financial relationships with funding organizations
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Employment or affiliations that could be perceived as conflicts
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Personal relationships with other researchers in the field
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              If none exist, please state &quot;None to declare&quot;
            </li>
          </ul>
        </div>
      </div>

      {/* Funding Statement */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <DollarSign className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Funding Statement</h3>
        </div>

        <FormField
          label="Funding Information"
          name="funding"
          value={formData.funding}
          onChange={handleInputChange}
          error={errors.funding}
          type="textarea"
          rows={3}
          placeholder="Provide details about funding sources..."
          disabled={disabled}
          description="List all funding sources that supported your research"
        />

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Funding Guidelines</h4>
          <ul className="space-y-1 text-sm text-green-800">
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Include grant numbers and funding agency names
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Mention all sources of financial support
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              If no external funding, state &quot;No external funding&quot;
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              Be specific about what each source funded
            </li>
          </ul>
        </div>
      </div>

      {/* Ethics and License Agreements */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <FileCheck className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Agreements</h3>
        </div>

        <div className="space-y-4">
          {/* Ethics Compliance */}
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <FormField
              label=""
              name="ethics"
              value={formData.ethics}
              onChange={handleInputChange}
              type="checkbox"
              disabled={disabled}
              error={errors.ethics}
              className="mb-0"
            >
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Ethical Compliance</p>
                  <p className="text-sm text-gray-600 mt-1">
                    I confirm that this research complies with ethical guidelines and has received appropriate ethical approval where required.
                  </p>
                </div>
              </div>
            </FormField>
          </div>

          {/* License Agreement */}
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <FormField
              label=""
              name="licenseAgreement"
              value={formData.licenseAgreement}
              onChange={handleInputChange}
              type="checkbox"
              disabled={disabled}
              error={errors.licenseAgreement}
              className="mb-0"
            >
              <div className="flex items-start space-x-3">
                <FileCheck className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Copyright and License Agreement</p>
                  <p className="text-sm text-gray-600 mt-1">
                    I agree to the copyright and license terms. I understand that upon acceptance, this work will be published under the journal&apos;s license terms.
                  </p>
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 underline"
                    onClick={(e) => {
                      e.preventDefault();
                      // TODO: Open license terms modal or navigate to terms page
                      showNotification.info('License terms will be displayed here');
                    }}
                  >
                    View License Terms
                  </button>
                </div>
              </div>
            </FormField>
          </div>
        </div>

        {/* Agreement Validation */}
        {(!formData.ethics || !formData.licenseAgreement) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-800">Required Agreements</h4>
                <p className="text-sm text-red-700 mt-1">
                  You must accept both the ethical compliance and license agreement to proceed with submission.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Important Notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Important Notice</h4>
          <ul className="space-y-1 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              All declarations must be accurate and complete
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              False declarations may result in manuscript rejection
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
              You are responsible for the accuracy of all information provided
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
