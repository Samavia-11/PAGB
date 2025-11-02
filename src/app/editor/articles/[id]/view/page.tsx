"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, FileText, Eye, Download, Award, MessageSquare } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  abstract: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
  author_name?: string;
  reviewer_name?: string;
  keywords?: string;
  doi?: string;
}

interface ParsedContent {
  authors?: Array<{name: string; email: string; role: string; affiliation?: string; contact?: string}>;
  contact?: string;
  affiliation?: string;
  manuscript?: {
    articleType?: string;
    abstract?: string;
    keywords?: string[];
    content?: string;
  };
  fileName?: string;
  declarations?: {
    coverLetter?: string;
    conflict?: string;
    funding?: string;
    disclaimer?: string;
    ethicsOk?: boolean;
    licenseOk?: boolean;
  };
}

export default function EditorArticleView() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'editor') {
      router.push('/login');
      return;
    }

    if (params.id) {
      fetchArticle(params.id as string);
    }
  }, [params.id, router]);

  const fetchArticle = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/articles/${id}`, {
        headers: {
          'x-user-role': 'editor'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }

      const data = await response.json();
      setArticle(data.article);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500',
      submitted: 'bg-blue-500',
      under_review: 'bg-yellow-500',
      with_editor: 'bg-purple-500',
      published: 'bg-green-500',
      rejected: 'bg-red-500',
      accepted: 'bg-emerald-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const parseContent = (contentString: string): ParsedContent | null => {
    try {
      return JSON.parse(contentString);
    } catch (error) {
      console.error('Failed to parse content JSON:', error);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Article Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested article could not be found.'}</p>
          <Link
            href="/editor/dashboard"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-800 text-white p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/editor/dashboard"
                className="flex items-center px-3 py-2 bg-green-700 rounded-lg hover:bg-green-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-xl font-bold">Article Review</h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-xs text-white ${getStatusColor(article.status)}`}>
                {article.status.replace('_', ' ').toUpperCase()}
              </span>
              <Link
                href={`/editor/articles/${article.id}/chat`}
                className="flex items-center px-3 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat with Author
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-6xl">
        {/* Article Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <User className="w-5 h-5 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Author</p>
                <p className="font-medium">{article.author_name || 'Unknown'}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <Eye className="w-5 h-5 text-purple-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Reviewer</p>
                <p className="font-medium">{article.reviewer_name || 'Not assigned'}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Submitted</p>
                <p className="font-medium">{formatDate(article.created_at)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <Award className="w-5 h-5 text-orange-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Article ID</p>
                <p className="font-medium">#{article.id}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Article Header */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 border-b">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{article.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span>Author: {article.author_name || 'Unknown'}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Submitted: {formatDate(article.created_at)}</span>
              </div>
              {article.updated_at !== article.created_at && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Updated: {formatDate(article.updated_at)}</span>
                </div>
              )}
              {article.doi && (
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  <span>DOI: {article.doi}</span>
                </div>
              )}
            </div>
          </div>

          {/* Article Content */}
          <div className="p-6">
            {(() => {
              const parsedContent = parseContent(article.content);
              
              if (!parsedContent) {
                return (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-3">Content</h2>
                    <div className="prose max-w-none">
                      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                        {article.content || 'No content available.'}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <>
                  {/* Authors Information */}
                  {parsedContent.authors && parsedContent.authors.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-xl font-bold text-gray-800 mb-3">Authors</h2>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {parsedContent.authors.map((author, index) => (
                          <div key={index} className="mb-4 last:mb-0 p-3 bg-white rounded border">
                            <div className="flex items-start space-x-3">
                              <User className="w-5 h-5 text-blue-500 mt-1" />
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800">{author.name}</p>
                                {author.email && <p className="text-gray-600 text-sm">{author.email}</p>}
                                {author.role && <p className="text-gray-500 text-sm">Role: {author.role}</p>}
                                {author.affiliation && <p className="text-gray-500 text-sm">Affiliation: {author.affiliation}</p>}
                                {author.contact && <p className="text-gray-500 text-sm">Contact: {author.contact}</p>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact & Affiliation */}
                  {(parsedContent.contact || parsedContent.affiliation) && (
                    <div className="mb-8">
                      <h2 className="text-xl font-bold text-gray-800 mb-3">Contact Information</h2>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {parsedContent.contact && (
                          <p className="text-gray-700 mb-2">
                            <span className="font-semibold">Contact:</span> {parsedContent.contact}
                          </p>
                        )}
                        {parsedContent.affiliation && (
                          <p className="text-gray-700">
                            <span className="font-semibold">Affiliation:</span> {parsedContent.affiliation}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Abstract */}
                  {parsedContent.manuscript?.abstract && (
                    <div className="mb-8">
                      <h2 className="text-xl font-bold text-gray-800 mb-3">Abstract</h2>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-gray-700 leading-relaxed">{parsedContent.manuscript.abstract}</p>
                      </div>
                    </div>
                  )}

                  {/* Keywords */}
                  {parsedContent.manuscript?.keywords && parsedContent.manuscript.keywords.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-xl font-bold text-gray-800 mb-3">Keywords</h2>
                      <div className="flex flex-wrap gap-2">
                        {parsedContent.manuscript.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Article Type */}
                  {parsedContent.manuscript?.articleType && (
                    <div className="mb-8">
                      <h2 className="text-xl font-bold text-gray-800 mb-3">Article Type</h2>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 capitalize font-medium">{parsedContent.manuscript.articleType.replace('_', ' ')}</p>
                      </div>
                    </div>
                  )}

                  {/* Main Content */}
                  {parsedContent.manuscript?.content && (
                    <div className="mb-8">
                      <h2 className="text-xl font-bold text-gray-800 mb-3">Manuscript Content</h2>
                      <div className="prose max-w-none bg-white p-6 rounded-lg border-2 border-gray-200">
                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {parsedContent.manuscript.content}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* File Information */}
                  {parsedContent.fileName && (
                    <div className="mb-8">
                      <h2 className="text-xl font-bold text-gray-800 mb-3">File Information</h2>
                      <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                        <FileText className="w-5 h-5 text-gray-500 mr-3" />
                        <div>
                          <p className="text-gray-700 font-medium">{parsedContent.fileName}</p>
                          <p className="text-gray-500 text-sm">Original manuscript file</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Declarations */}
                  {parsedContent.declarations && (
                    <div className="mb-8">
                      <h2 className="text-xl font-bold text-gray-800 mb-3">Declarations & Compliance</h2>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        {parsedContent.declarations.coverLetter && (
                          <div className="bg-white p-3 rounded border">
                            <h4 className="font-semibold text-gray-800 mb-2">Cover Letter:</h4>
                            <p className="text-gray-700 text-sm">{parsedContent.declarations.coverLetter}</p>
                          </div>
                        )}
                        {parsedContent.declarations.conflict && (
                          <div className="bg-white p-3 rounded border">
                            <h4 className="font-semibold text-gray-800 mb-2">Conflict of Interest:</h4>
                            <p className="text-gray-700 text-sm">{parsedContent.declarations.conflict}</p>
                          </div>
                        )}
                        {parsedContent.declarations.funding && (
                          <div className="bg-white p-3 rounded border">
                            <h4 className="font-semibold text-gray-800 mb-2">Funding:</h4>
                            <p className="text-gray-700 text-sm">{parsedContent.declarations.funding}</p>
                          </div>
                        )}
                        {parsedContent.declarations.disclaimer && (
                          <div className="bg-white p-3 rounded border">
                            <h4 className="font-semibold text-gray-800 mb-2">Disclaimer:</h4>
                            <p className="text-gray-700 text-sm">{parsedContent.declarations.disclaimer}</p>
                          </div>
                        )}
                        <div className="flex gap-4 text-sm">
                          {parsedContent.declarations.ethicsOk !== undefined && (
                            <span className={`px-3 py-1 rounded-full ${parsedContent.declarations.ethicsOk ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              Ethics: {parsedContent.declarations.ethicsOk ? 'Approved' : 'Pending'}
                            </span>
                          )}
                          {parsedContent.declarations.licenseOk !== undefined && (
                            <span className={`px-3 py-1 rounded-full ${parsedContent.declarations.licenseOk ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              License: {parsedContent.declarations.licenseOk ? 'Agreed' : 'Pending'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Article Footer */}
          <div className="bg-gray-50 p-6 border-t">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                <p><span className="font-medium">Article ID:</span> {article.id}</p>
                <p><span className="font-medium">Status:</span> <span className="capitalize">{article.status.replace('_', ' ')}</span></p>
                <p><span className="font-medium">Last Updated:</span> {formatDate(article.updated_at)}</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => window.print()}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Print/Save
                </button>
                
                <Link
                  href={`/editor/articles/${article.id}/chat`}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Start Chat
                </Link>

                <Link
                  href={`/editor/articles/${article.id}`}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Edit Article
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
