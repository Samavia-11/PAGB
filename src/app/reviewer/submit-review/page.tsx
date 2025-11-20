'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Send, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { showNotification } from '@/utils/notifications';

interface Article {
  id: number;
  title: string;
  author_name: string;
  content: string;
  status: string;
  created_at: string;
}

export default function SubmitReview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get('article');
  
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Review form state
  const [recommendation, setRecommendation] = useState<'accept' | 'minor_revision' | 'major_revision' | 'reject'>('minor_revision');
  const [comments, setComments] = useState('');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [confidentialComments, setConfidentialComments] = useState('');

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

  const handleSubmitReview = async () => {
    if (!comments.trim()) {
      showNotification.error('Please provide review comments');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          article_id: articleId,
          recommendation,
          comments: comments.trim(),
          strengths: strengths.trim(),
          weaknesses: weaknesses.trim(),
          suggestions: suggestions.trim(),
          confidential_comments: confidentialComments.trim()
        })
      });

      if (response.ok) {
        showNotification.success('Your review has been forwarded to the editor successfully!');
        router.push('/reviewer/dashboard');
      } else {
        const errorData = await response.json();
        showNotification.error(errorData.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      showNotification.error('Unable to submit review. Please try again.');
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
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/reviewer/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Submit Review</h1>
              <p className="text-gray-600">Forward your review to the editor</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Article Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Article Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Submitted</label>
              <p className="text-gray-900">{new Date(article.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Submission</h2>
          
          {/* Recommendation */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Recommendation *</label>
            <div className="grid md:grid-cols-2 gap-3">
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
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Comments for Author */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments for Author *
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide detailed feedback for the author..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[forestgreen] focus:border-transparent resize-none"
              rows={6}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              These comments will be shared with the author
            </p>
          </div>

          {/* Strengths */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Strengths of the Manuscript
            </label>
            <textarea
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              placeholder="Highlight the positive aspects of the work..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[forestgreen] focus:border-transparent resize-none"
              rows={4}
            />
          </div>

          {/* Weaknesses */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weaknesses and Areas for Improvement
            </label>
            <textarea
              value={weaknesses}
              onChange={(e) => setWeaknesses(e.target.value)}
              placeholder="Identify areas that need improvement..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[forestgreen] focus:border-transparent resize-none"
              rows={4}
            />
          </div>

          {/* Suggestions */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specific Suggestions for Revision
            </label>
            <textarea
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              placeholder="Provide specific suggestions for improving the manuscript..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[forestgreen] focus:border-transparent resize-none"
              rows={4}
            />
          </div>

          {/* Confidential Comments */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confidential Comments for Editor
            </label>
            <textarea
              value={confidentialComments}
              onChange={(e) => setConfidentialComments(e.target.value)}
              placeholder="Private comments for the editor only..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[forestgreen] focus:border-transparent resize-none"
              rows={3}
            />
            <p className="text-sm text-gray-500 mt-1">
              These comments will only be visible to the editor
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => router.push('/reviewer/dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReview}
              disabled={submitting || !comments.trim()}
              className="px-6 py-3 bg-[forestgreen] text-white rounded-lg hover:bg-[#1d7a1d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span>{submitting ? 'Submitting...' : 'Submit Review'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
