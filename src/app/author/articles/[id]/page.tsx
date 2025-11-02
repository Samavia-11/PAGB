"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, User, FileText, Eye, Download } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  abstract: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
  author_name?: string;
  keywords?: string;
  doi?: string;
}

interface ParsedContent {
  authors?: Array<{name: string; email: string; role: string}>;
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

export default function ArticleView() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchArticle(params.id as string);
    }
  }, [params.id]);

  const fetchArticle = async (id: string) => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(`/api/articles/${id}`, {
        headers: {
          'x-user-id': String(user.id),
          'x-user-role': 'author'
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
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
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
              <button
                onClick={() => router.back()}
                className="flex items-center px-3 py-2 bg-green-700 rounded-lg hover:bg-green-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </button>
              <h1 className="text-xl font-bold">Article View</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs text-white ${getStatusColor(article.status)}`}>
                {article.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-4xl">
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

            {article.keywords && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Keywords:</h3>
                <div className="flex flex-wrap gap-2">
                  {article.keywords.split(',').map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {keyword.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
                      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
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
                          <div key={index} className="mb-2 last:mb-0">
                            <p className="text-gray-700">
                              <span className="font-semibold">{author.name}</span>
                              {author.email && <span className="text-gray-600"> ({author.email})</span>}
                              {author.role && <span className="text-sm text-gray-500"> - {author.role}</span>}
                            </p>
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
                      <div className="bg-gray-50 p-4 rounded-lg">
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
                        <p className="text-gray-700 capitalize">{parsedContent.manuscript.articleType.replace('_', ' ')}</p>
                      </div>
                    </div>
                  )}

                  {/* Main Content */}
                  {parsedContent.manuscript?.content && (
                    <div className="mb-8">
                      <h2 className="text-xl font-bold text-gray-800 mb-3">Manuscript Content</h2>
                      <div className="prose max-w-none bg-white p-6 rounded-lg border">
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
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700">
                          <span className="font-semibold">File Name:</span> {parsedContent.fileName}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Declarations */}
                  {parsedContent.declarations && (
                    <div className="mb-8">
                      <h2 className="text-xl font-bold text-gray-800 mb-3">Declarations</h2>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        {parsedContent.declarations.coverLetter && (
                          <div>
                            <h4 className="font-semibold text-gray-800">Cover Letter:</h4>
                            <p className="text-gray-700">{parsedContent.declarations.coverLetter}</p>
                          </div>
                        )}
                        {parsedContent.declarations.conflict && (
                          <div>
                            <h4 className="font-semibold text-gray-800">Conflict of Interest:</h4>
                            <p className="text-gray-700">{parsedContent.declarations.conflict}</p>
                          </div>
                        )}
                        {parsedContent.declarations.funding && (
                          <div>
                            <h4 className="font-semibold text-gray-800">Funding:</h4>
                            <p className="text-gray-700">{parsedContent.declarations.funding}</p>
                          </div>
                        )}
                        {parsedContent.declarations.disclaimer && (
                          <div>
                            <h4 className="font-semibold text-gray-800">Disclaimer:</h4>
                            <p className="text-gray-700">{parsedContent.declarations.disclaimer}</p>
                          </div>
                        )}
                        <div className="flex gap-4 text-sm">
                          {parsedContent.declarations.ethicsOk !== undefined && (
                            <span className={`px-2 py-1 rounded ${parsedContent.declarations.ethicsOk ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              Ethics: {parsedContent.declarations.ethicsOk ? 'Approved' : 'Pending'}
                            </span>
                          )}
                          {parsedContent.declarations.licenseOk !== undefined && (
                            <span className={`px-2 py-1 rounded ${parsedContent.declarations.licenseOk ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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
                <p>Article ID: {article.id}</p>
                <p>Status: <span className="capitalize">{article.status.replace('_', ' ')}</span></p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => window.print()}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Print/Save
                </button>
                
                {article.status === 'draft' && (
                  <a
                    href={`/Author/drafts/${article.id}`}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Edit Draft
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
