'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, Clock, CheckCircle, XCircle, AlertCircle, 
  MessageSquare, Download, Eye, Send, RefreshCw 
} from 'lucide-react';
import { showNotification } from '@/utils/notifications';

interface ForwardedArticle {
  id: number;
  article_id: number;
  article_title: string;
  author_name: string;
  reviewer_name: string;
  recommendation: string;
  reviewer_comments: string;
  editor_comments: string;
  original_content: string;
  edited_content: string;
  attached_files: string[];
  forwarded_at: string;
  response_status: string;
  editor_response: string;
  decision: string;
  responded_at: string;
}

export default function ForwardedArticles() {
  const router = useRouter();
  const [forwardedArticles, setForwardedArticles] = useState<ForwardedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<ForwardedArticle | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [editorResponse, setEditorResponse] = useState('');
  const [decision, setDecision] = useState<'accept' | 'reject' | 'revision_required' | 'feedback_only'>('feedback_only');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchForwardedArticles();
    // Set up real-time polling for new forwarded articles
    const interval = setInterval(fetchForwardedArticles, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchForwardedArticles = async () => {
    try {
      const response = await fetch('/api/articles/forward');
      if (response.ok) {
        const data = await response.json();
        setForwardedArticles(data.forwarded_articles || []);
      } else {
        console.error('Failed to fetch forwarded articles');
      }
    } catch (error) {
      console.error('Error fetching forwarded articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = (article: ForwardedArticle) => {
    setSelectedArticle(article);
    setEditorResponse(article.editor_response || '');
    setDecision(article.decision as any || 'feedback_only');
    setShowResponseModal(true);
  };

  const submitResponse = async () => {
    if (!selectedArticle || !editorResponse.trim()) {
      showNotification.error('Please provide a response');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/editor/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          forwarded_article_id: selectedArticle.id,
          article_id: selectedArticle.article_id,
          editor_response: editorResponse.trim(),
          decision,
          response_type: decision === 'feedback_only' ? 'feedback' : 'decision'
        })
      });

      if (response.ok) {
        showNotification.success('Response sent successfully!');
        setShowResponseModal(false);
        setSelectedArticle(null);
        setEditorResponse('');
        fetchForwardedArticles(); // Refresh the list
      } else {
        const errorData = await response.json();
        showNotification.error(errorData.error || 'Failed to send response');
      }
    } catch (error) {
      console.error('Error sending response:', error);
      showNotification.error('Unable to send response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'accept': return 'bg-green-100 text-green-800';
      case 'minor_revision': return 'bg-blue-100 text-blue-800';
      case 'major_revision': return 'bg-yellow-100 text-yellow-800';
      case 'reject': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'accept': return <CheckCircle className="w-4 h-4" />;
      case 'minor_revision': return <AlertCircle className="w-4 h-4" />;
      case 'major_revision': return <AlertCircle className="w-4 h-4" />;
      case 'reject': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[forestgreen] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading forwarded articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Forwarded Articles</h1>
              <p className="text-gray-600 mt-1">Review articles forwarded by reviewers</p>
            </div>
            <button
              onClick={fetchForwardedArticles}
              className="flex items-center px-4 py-2 bg-[forestgreen] text-white rounded-lg hover:bg-[#1d7a1d] transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Forwarded</p>
                <p className="text-2xl font-bold text-gray-900">{forwardedArticles.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Response</p>
                <p className="text-2xl font-bold text-gray-900">
                  {forwardedArticles.filter(a => a.response_status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Responded</p>
                <p className="text-2xl font-bold text-gray-900">
                  {forwardedArticles.filter(a => a.response_status === 'responded').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {forwardedArticles.filter(a => a.decision === 'accept').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Articles List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Forwarded Articles</h2>
          </div>
          
          {forwardedArticles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Forwarded Articles</h3>
              <p className="text-gray-600">No articles have been forwarded by reviewers yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {forwardedArticles.map((article, index) => (
                <div key={`forwarded-${article.article_id}-${index}-${article.article_title?.substring(0,10) || 'unknown'}`} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{article.article_title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRecommendationColor(article.recommendation)}`}>
                          {getRecommendationIcon(article.recommendation)}
                          <span className="ml-1">{article.recommendation.replace('_', ' ').toUpperCase()}</span>
                        </span>
                        {article.response_status === 'responded' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Responded
                          </span>
                        )}
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Author:</span> {article.author_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Reviewer:</span> {article.reviewer_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Forwarded:</span> {formatDate(article.forwarded_at)}
                          </p>
                          {article.responded_at && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Responded:</span> {formatDate(article.responded_at)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Reviewer Comments:</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {article.reviewer_comments}
                        </p>
                      </div>

                      {article.editor_comments && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">Private Comments for Editor:</p>
                          <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                            {article.editor_comments}
                          </p>
                        </div>
                      )}

                      {article.editor_response && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">Your Response:</p>
                          <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                            {article.editor_response}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="ml-6 flex flex-col space-y-2">
                      <button
                        onClick={() => router.push(`/editor/articles/${article.article_id}/view`)}
                        className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Article
                      </button>
                      
                      <button
                        onClick={() => handleRespond(article)}
                        className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                          article.response_status === 'responded'
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {article.response_status === 'responded' ? 'Update Response' : 'Respond'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Respond to: {selectedArticle.article_title}
              </h2>
              <p className="text-gray-600 mt-1">
                Forwarded by {selectedArticle.reviewer_name} • {formatDate(selectedArticle.forwarded_at)}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Decision Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Decision Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'feedback_only', label: 'Feedback Only', color: 'blue' },
                    { value: 'accept', label: 'Accept Article', color: 'green' },
                    { value: 'revision_required', label: 'Require Revision', color: 'yellow' },
                    { value: 'reject', label: 'Reject Article', color: 'red' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDecision(option.value as any)}
                      className={`p-3 rounded-lg border-2 transition-colors text-left ${
                        decision === option.value
                          ? `bg-${option.color}-100 text-${option.color}-800 border-${option.color}-200`
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium text-sm">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor Response */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Response *
                </label>
                <textarea
                  value={editorResponse}
                  onChange={(e) => setEditorResponse(e.target.value)}
                  placeholder="Provide your feedback and decision rationale..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[forestgreen] focus:border-transparent resize-none"
                  rows={6}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  This response will be sent to the reviewer and may be shared with the author
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setSelectedArticle(null);
                  setEditorResponse('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={submitResponse}
                disabled={submitting || !editorResponse.trim()}
                className="px-4 py-2 bg-[forestgreen] text-white rounded-lg hover:bg-[#1d7a1d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{submitting ? 'Sending...' : 'Send Response'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
