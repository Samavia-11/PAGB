'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Send, X, Eye, FileText, User, Calendar, Tag } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  content: string;
  status: string;
  author_name: string;
  reviewer_name: string;
  created_at: string;
  updated_at: string;
  abstract?: string;
  keywords?: string;
  article_type?: string;
  manuscript?: string;
}

export default function EditArticle() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [comments, setComments] = useState('');
  const [activeTab, setActiveTab] = useState('content');
  const [parsedManuscript, setParsedManuscript] = useState<any>(null);

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

    setUser(parsedUser);
    fetchArticle();
  }, [articleId, router]);

  const parseManuscriptContent = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      setParsedManuscript(parsed);
      
      // Extract readable content from the manuscript
      if (parsed.content && parsed.content !== 'mmmmm') {
        setEditedContent(parsed.content);
      } else {
        // Create a professional formatted version
        let formattedContent = '';
        
        if (parsed.abstract && parsed.abstract !== 'nnn') {
          formattedContent += `Abstract:\n${parsed.abstract}\n\n`;
        }
        
        if (parsed.keywords && parsed.keywords.length > 0) {
          formattedContent += `Keywords: ${parsed.keywords.join(', ')}\n\n`;
        }
        
        if (parsed.authors && parsed.authors.length > 0) {
          formattedContent += `Authors:\n`;
          parsed.authors.forEach((author: any, index: number) => {
            formattedContent += `${index + 1}. ${author.name} (${author.email})\n`;
            if (author.affiliation && author.affiliation !== 'nust') {
              formattedContent += `   Affiliation: ${author.affiliation}\n`;
            }
          });
          formattedContent += '\n';
        }
        
        formattedContent += `Article Type: ${parsed.articleType || 'Research Article'}\n\n`;
        
        if (parsed.fileName) {
          formattedContent += `Manuscript File: ${parsed.fileName}\n\n`;
        }
        
        formattedContent += `Main Content:\n[Please add the main article content here]\n\n`;
        formattedContent += `Introduction:\n[Add introduction section]\n\n`;
        formattedContent += `Methodology:\n[Add methodology section]\n\n`;
        formattedContent += `Results:\n[Add results section]\n\n`;
        formattedContent += `Discussion:\n[Add discussion section]\n\n`;
        formattedContent += `Conclusion:\n[Add conclusion section]\n\n`;
        formattedContent += `References:\n[Add references section]`;
        
        setEditedContent(formattedContent);
      }
    } catch (error) {
      // If it's not JSON, use the content as is
      setEditedContent(content);
      setParsedManuscript(null);
    }
  };

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        headers: {
          'x-user-role': 'editor'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setArticle(data.article);
        setEditedTitle(data.article.title || '');
        
        // Parse the manuscript content professionally
        if (data.article.content) {
          parseManuscriptContent(data.article.content);
        }
      } else {
        console.error('Failed to fetch article');
        router.push('/editor/dashboard');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      router.push('/editor/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!article) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id.toString(),
          'x-user-role': 'editor'
        },
        body: JSON.stringify({
          title: editedTitle,
          content: editedContent,
          editor_comments: comments
        })
      });

      if (response.ok) {
        alert('Article saved successfully!');
        fetchArticle(); // Refresh the article data
      } else {
        alert('Failed to save article');
      }
    } catch (error) {
      alert('Error saving article');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm('Are you sure you want to publish this article?')) return;
    
    try {
      const response = await fetch(`/api/articles/${articleId}/workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'publish',
          from_user_id: user.id,
          from_role: user.role,
          comments: comments
        })
      });

      if (response.ok) {
        alert('Article published successfully! Comments sent to author.');
        router.push('/editor/dashboard');
      } else {
        alert('Failed to publish article');
      }
    } catch (error) {
      alert('Error publishing article');
    }
  };

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this article?')) return;
    
    try {
      const response = await fetch(`/api/articles/${articleId}/workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'reject',
          from_user_id: user.id,
          from_role: user.role,
          comments: comments
        })
      });

      if (response.ok) {
        alert('Article rejected and comments sent to author');
        router.push('/editor/dashboard');
      } else {
        alert('Failed to reject article');
      }
    } catch (error) {
      alert('Error rejecting article');
    }
  };

  const handleSendComments = async () => {
    if (!comments.trim()) {
      alert('Please enter comments before sending');
      return;
    }

    if (!confirm('Send these comments to the author?')) return;
    
    console.log('Sending comments:', {
      articleId,
      userId: user?.id,
      userRole: user?.role,
      comments: comments.substring(0, 50) + '...'
    });
    
    try {
      // Use the simple comments API that works without database
      const response = await fetch(`/api/articles/${articleId}/simple-comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from_user_id: user.id,
          from_role: user.role,
          comments: comments,
          action: 'send_comments'
        })
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok) {
        // Store the comment in localStorage for the author to see
        const notification = {
          id: Date.now(),
          type: 'editor_comment',
          title: `Editor Comments on "${article?.title}"`,
          message: comments,
          article_id: articleId,
          from_user: user.full_name || user.username,
          from_role: user.role,
          created_at: new Date().toISOString(),
          is_read: false
        };
        
        // Get existing notifications from localStorage
        const existingNotifications = JSON.parse(localStorage.getItem('author_notifications') || '[]');
        existingNotifications.unshift(notification);
        
        // Keep only the last 50 notifications
        const updatedNotifications = existingNotifications.slice(0, 50);
        localStorage.setItem('author_notifications', JSON.stringify(updatedNotifications));
        
        alert('Comments sent to author successfully!');
        setComments(''); // Clear the comments after sending
      } else {
        console.error('API Error:', responseData);
        alert(`Failed to send comments: ${responseData.error || responseData.details || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Network Error:', error);
      alert(`Error sending comments: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Article not found</h2>
          <Link href="/editor/dashboard" className="text-blue-600 hover:text-blue-800">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/editor/dashboard"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Article</h1>
            <p className="text-sm text-gray-600">Article ID: {article.id}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            article.status === 'with_editor' ? 'bg-purple-100 text-purple-800' :
            article.status === 'published' ? 'bg-green-100 text-green-800' :
            article.status === 'rejected' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {article.status.replace('_', ' ').toUpperCase()}
          </span>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </button>
          
          {article.status === 'with_editor' && (
            <>
              <button
                onClick={handlePublish}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Publish
              </button>
              
              <button
                onClick={handleReject}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </button>
            </>
          )}
        </div>
      </div>

      {/* Article Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <User className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Author</p>
              <p className="font-medium">{article.author_name}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Eye className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Reviewer</p>
              <p className="font-medium">{article.reviewer_name || 'Not assigned'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Submitted</p>
              <p className="font-medium">{new Date(article.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Type</p>
              <p className="font-medium">{article.article_type || 'Research'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('content')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'content'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab('metadata')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'metadata'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Metadata
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'comments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Editor Comments
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Article Title
                </label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter article title..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Article Content
                </label>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={20}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter article content..."
                />
              </div>
            </div>
          )}

          {activeTab === 'metadata' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Abstract
                </label>
                <textarea
                  value={parsedManuscript?.abstract && parsedManuscript.abstract !== 'nnn' ? parsedManuscript.abstract : article?.abstract || 'No abstract provided'}
                  readOnly
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords
                </label>
                <input
                  type="text"
                  value={parsedManuscript?.keywords ? parsedManuscript.keywords.join(', ') : article?.keywords || 'No keywords provided'}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Article Type
                </label>
                <input
                  type="text"
                  value={parsedManuscript?.articleType || article?.article_type || 'Research Article'}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Authors
                </label>
                {parsedManuscript?.authors && parsedManuscript.authors.length > 0 ? (
                  <div className="space-y-3">
                    {parsedManuscript.authors.map((author: any, index: number) => (
                      <div key={`editor-author-${index}-${author.name || author.email || index}`} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{author.name}</p>
                            <p className="text-sm text-gray-600">{author.email}</p>
                            {author.affiliation && author.affiliation !== 'nust' && (
                              <p className="text-sm text-gray-500">Affiliation: {author.affiliation}</p>
                            )}
                            {author.role && (
                              <p className="text-sm text-gray-500">Role: {author.role}</p>
                            )}
                            {author.contact && (
                              <p className="text-sm text-gray-500">Contact: {author.contact}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">No author information available</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manuscript File
                </label>
                {parsedManuscript?.fileName || article?.manuscript ? (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-600">{parsedManuscript?.fileName || article?.manuscript}</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No manuscript file uploaded</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Editor Comments
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Add your comments for the author or reviewer..."
                  autoFocus={activeTab === 'comments'}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Comments can be sent directly to the author or will be included when publishing/rejecting the article.
                </p>
                
                <button
                  onClick={handleSendComments}
                  disabled={!comments.trim()}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send to Author
                </button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Comment Options:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Send to Author:</strong> Immediately sends comments to the author for review</li>
                  <li>• <strong>Publish:</strong> Publishes the article and sends comments to the author</li>
                  <li>• <strong>Reject:</strong> Rejects the article and sends comments explaining the decision</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
