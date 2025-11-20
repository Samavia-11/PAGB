'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Send, FileText, AlertCircle, CheckCircle, XCircle, Upload, Edit3, Save } from 'lucide-react';
import { showNotification } from '@/utils/notifications';

interface Article {
  id: number;
  title: string;
  author_name: string;
  content: string;
  status: string;
  created_at: string;
}

export default function ForwardArticle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get('article');
  
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [recommendation, setRecommendation] = useState<'accept' | 'minor_revision' | 'major_revision' | 'reject'>('minor_revision');
  const [reviewerComments, setReviewerComments] = useState('');
  const [editorComments, setEditorComments] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const fetchArticle = useCallback(async () => {
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        headers: {
          'x-user-role': 'reviewer'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setArticle(data.article);
        setEditedContent(data.article.content);
      } else {
        showNotification.error('Failed to load article details');
        router.push('/reviewer/dashboard');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      showNotification.error('Unable to load article');
      router.push('/reviewer/dashboard');
    } finally {
      setLoading(false);
    }
  }, [articleId, router]);

  useEffect(() => {
    if (!articleId) {
      router.push('/reviewer/dashboard');
      return;
    }
    
    fetchArticle();
  }, [articleId, router, fetchArticle]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleForwardArticle = async () => {
    if (!reviewerComments.trim()) {
      showNotification.error('Please provide reviewer comments');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('article_id', articleId!);
      formData.append('recommendation', recommendation);
      formData.append('reviewer_comments', reviewerComments.trim());
      formData.append('editor_comments', editorComments.trim());
      formData.append('edited_content', editedContent);
      formData.append('original_content', article?.content || '');
      
      // Add attached files
      attachedFiles.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });
      formData.append('file_count', attachedFiles.length.toString());

      const response = await fetch('/api/articles/forward', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        showNotification.success('Article forwarded to editor successfully!');
        router.push('/reviewer/dashboard');
      } else {
        const errorData = await response.json();
        showNotification.error(errorData.error || 'Failed to forward article');
      }
    } catch (error) {
      console.error('Error forwarding article:', error);
      showNotification.error('Unable to forward article. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'accept': return 'bg-green-100 text-green-800 border-green-200';
      case 'minor_revision': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'major_revision': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reject': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'accept': return <CheckCircle className="w-5 h-5" />;
      case 'minor_revision': return <AlertCircle className="w-5 h-5" />;
      case 'major_revision': return <AlertCircle className="w-5 h-5" />;
      case 'reject': return <XCircle className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const formatArticleContent = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      if (parsed.manuscript) {
        return JSON.stringify(parsed.manuscript, null, 2);
      }
      return JSON.stringify(parsed, null, 2);
    } catch {
      return content;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[forestgreen] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Article Not Found</h2>
          <p className="text-gray-600 mb-4">The requested article could not be loaded.</p>
          <button
            onClick={() => router.push('/reviewer/dashboard')}
            className="px-4 py-2 bg-[forestgreen] text-white rounded-lg hover:bg-[#1d7a1d]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/reviewer/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Forward Article to Editor</h1>
              <p className="text-gray-600">Review and forward with your recommendations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Article Content */}
          <div className="space-y-6">
            {/* Article Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Article Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <p className="text-gray-900 font-medium">{article.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <p className="text-gray-900">{article.author_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {article.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Article Content Editor */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Article Content</h2>
                <button
                  onClick={() => setIsEditingContent(!isEditingContent)}
                  className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  {isEditingContent ? <Save className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
                  {isEditingContent ? 'Save Changes' : 'Edit Content'}
                </button>
              </div>
              
              {isEditingContent ? (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[forestgreen] focus:border-transparent font-mono text-sm"
                  placeholder="Edit article content..."
                />
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                    {formatArticleContent(editedContent)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Review Form */}
          <div className="space-y-6">
            {/* Recommendation */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommendation</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'accept', label: 'Accept' },
                  { value: 'minor_revision', label: 'Minor Revision' },
                  { value: 'major_revision', label: 'Major Revision' },
                  { value: 'reject', label: 'Reject' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setRecommendation(option.value as any)}
                    className={`p-3 rounded-lg border-2 transition-colors flex items-center space-x-3 ${
                      recommendation === option.value
                        ? getRecommendationColor(option.value)
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {getRecommendationIcon(option.value)}
                    <span className="font-medium text-sm">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reviewer Comments */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviewer Comments</h2>
              <textarea
                value={reviewerComments}
                onChange={(e) => setReviewerComments(e.target.value)}
                placeholder="Provide detailed feedback and recommendations..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[forestgreen] focus:border-transparent resize-none"
                rows={6}
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                These comments will be shared with both author and editor
              </p>
            </div>

            {/* Editor Comments */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Comments for Editor</h2>
              <textarea
                value={editorComments}
                onChange={(e) => setEditorComments(e.target.value)}
                placeholder="Private comments for the editor only..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[forestgreen] focus:border-transparent resize-none"
                rows={4}
              />
              <p className="text-sm text-gray-500 mt-2">
                These comments will only be visible to the editor
              </p>
            </div>

            {/* File Attachments */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Attach Files</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT files</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                {attachedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Attached Files:</h4>
                    {attachedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">({Math.round(file.size / 1024)} KB)</span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => router.push('/reviewer/dashboard')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleForwardArticle}
                  disabled={submitting || !reviewerComments.trim()}
                  className="px-6 py-3 bg-[forestgreen] text-white rounded-lg hover:bg-[#1d7a1d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  <span>{submitting ? 'Forwarding...' : 'Forward to Editor'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
