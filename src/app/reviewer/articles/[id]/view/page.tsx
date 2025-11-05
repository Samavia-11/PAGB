'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, User, Calendar, Download, MessageSquare, Eye, Clock } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  content: string;
  status: string;
  author_name: string;
  author_id: number;
  created_at: string;
  submitted_at: string;
}

export default function ReviewerArticleView() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'reviewer') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
    fetchArticle();
  }, [router, articleId]);

  const fetchArticle = async () => {
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
        console.error('Failed to fetch article');
        router.push('/reviewer/dashboard');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      router.push('/reviewer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const parseArticleContent = (content: string) => {
    try {
      return JSON.parse(content);
    } catch (error) {
      return { manuscript: { content } };
    }
  };

  const handleDownload = async () => {
    if (!article) return;
    
    try {
      const response = await fetch(`/api/articles/${article.id}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${article.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('⚠️ Download Failed\n\nUnable to download the article. Please try again later.');
      }
    } catch (error) {
      console.error('Error downloading article:', error);
      alert('⚠️ Connection Error\n\nUnable to connect to the server. Please check your internet connection and try again.');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: 'bg-blue-500',
      under_review: 'bg-yellow-500',
      with_editor: 'bg-green-500',
      published: 'bg-purple-500',
    };
    return colors[status] || 'bg-gray-500';
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
          <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
          <Link href="/reviewer/dashboard" className="text-blue-600 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const parsedContent = parseArticleContent(article.content);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/reviewer/dashboard"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownload}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
              <Link
                href={`/reviewer/articles/${article.id}/chat`}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat with Editor
              </Link>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              <span>Author: {article.author_name}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Submitted: {new Date(article.submitted_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>Last Updated: {new Date(article.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="mt-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(article.status)}`}>
              {article.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Article Content */}
        <div className="bg-white rounded-lg shadow p-8">
          {/* Article Type */}
          {parsedContent.manuscript?.articleType && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Article Type</h2>
              <p className="text-gray-700 bg-gray-50 px-4 py-2 rounded">
                {parsedContent.manuscript.articleType.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          )}

          {/* Abstract */}
          {parsedContent.manuscript?.abstract && parsedContent.manuscript.abstract !== 'nnn' && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Abstract</h2>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r">
                <p className="text-gray-700 leading-relaxed">{parsedContent.manuscript.abstract}</p>
              </div>
            </div>
          )}

          {/* Keywords */}
          {parsedContent.manuscript?.keywords && parsedContent.manuscript.keywords.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {parsedContent.manuscript.keywords.map((keyword: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Main Content */}
          {parsedContent.manuscript?.content && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Content</h2>
              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {parsedContent.manuscript.content}
                </div>
              </div>
            </div>
          )}

          {/* Author Information */}
          {parsedContent.authors && parsedContent.authors.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Author Information</h2>
              <div className="space-y-4">
                {parsedContent.authors.map((author: any, index: number) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900">{author.name}</h3>
                    {author.affiliation && (
                      <p className="text-sm text-gray-600 mt-1">{author.affiliation}</p>
                    )}
                    {author.email && (
                      <p className="text-sm text-blue-600 mt-1">{author.email}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Information */}
          {parsedContent.manuscript?.fileName && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Attached Files</h2>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <FileText className="w-5 h-5 text-gray-500 mr-3" />
                <span className="text-gray-700">{parsedContent.manuscript.fileName}</span>
              </div>
            </div>
          )}

          {/* Declarations */}
          {parsedContent.declarations && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Declarations</h2>
              <div className="space-y-3">
                {parsedContent.declarations.conflict && (
                  <div>
                    <h4 className="font-medium text-gray-900">Conflict of Interest</h4>
                    <p className="text-gray-700 text-sm">{parsedContent.declarations.conflict}</p>
                  </div>
                )}
                {parsedContent.declarations.funding && (
                  <div>
                    <h4 className="font-medium text-gray-900">Funding</h4>
                    <p className="text-gray-700 text-sm">{parsedContent.declarations.funding}</p>
                  </div>
                )}
                {parsedContent.declarations.disclaimer && (
                  <div>
                    <h4 className="font-medium text-gray-900">Disclaimer</h4>
                    <p className="text-gray-700 text-sm">{parsedContent.declarations.disclaimer}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={handleDownload}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Article
          </button>
          <Link
            href={`/reviewer/articles/${article.id}/chat`}
            className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Start Review Discussion
          </Link>
        </div>
      </div>
    </div>
  );
}
