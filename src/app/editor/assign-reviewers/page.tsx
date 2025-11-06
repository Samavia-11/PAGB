'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, FileText, Send, Clock, CheckCircle, User, Eye } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  content: string;
  status: string;
  author_name: string;
  created_at: string;
}

interface Reviewer {
  id: number;
  full_name: string;
  username: string;
  email: string;
}

interface Assignment {
  article_id: number;
  reviewer_id: number;
  reviewer_name: string;
  status: string;
}

export default function AssignReviewersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string>(''); // "articleId-reviewerId"

  useEffect(() => {
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
    fetchSubmittedArticles();
    fetchReviewers();
    fetchAssignments();

    // Set up real-time polling for new articles and assignments
    const articlesInterval = setInterval(fetchSubmittedArticles, 10000); // Poll every 10 seconds
    const assignmentsInterval = setInterval(fetchAssignments, 15000); // Poll every 15 seconds

    return () => {
      clearInterval(articlesInterval);
      clearInterval(assignmentsInterval);
    };
  }, [router]);

  const fetchSubmittedArticles = async () => {
    try {
      const response = await fetch('/api/articles?status=submitted');
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const fetchReviewers = async () => {
    try {
      const response = await fetch('/api/users?role=reviewer');
      if (response.ok) {
        const data = await response.json();
        setReviewers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching reviewers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/assignments');
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments || []);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const handleAssignReviewer = async (articleId: number, reviewerId: number) => {
    const assignmentKey = `${articleId}-${reviewerId}`;
    setAssigning(assignmentKey);

    try {
      // Use direct assignment API instead of workflow
      const response = await fetch('/api/assign-reviewer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          article_id: articleId,
          reviewer_id: reviewerId,
          assigned_by: user.id
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
        notification.innerHTML = `
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          ${responseData.message || 'Reviewer assigned successfully!'}
        `;
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 3000);
        
        fetchAssignments(); // Refresh assignments
        fetchSubmittedArticles(); // Refresh articles list
      } else {
        const errorData = await response.json();
        // Show error notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
        notification.innerHTML = `
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          Failed to assign reviewer: ${errorData.error || 'Please try again.'}
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 4000);
      }
    } catch (error) {
      console.error('Error assigning reviewer:', error);
      alert('❌ Error assigning reviewer. Please try again.');
    } finally {
      setAssigning('');
    }
  };

  const getArticlePreview = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      if (parsed.manuscript?.abstract) {
        return parsed.manuscript.abstract.substring(0, 150) + '...';
      }
      return 'No abstract available';
    } catch {
      return content.substring(0, 150) + '...';
    }
  };

  const getAssignedReviewers = (articleId: number) => {
    return assignments.filter(a => a.article_id === articleId && a.status === 'assigned');
  };

  const isReviewerAssigned = (articleId: number, reviewerId: number) => {
    return assignments.some(a => 
      a.article_id === articleId && 
      a.reviewer_id === reviewerId && 
      a.status === 'assigned'
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading articles and reviewers...</p>
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
            <div className="flex items-center space-x-4">
              <Link
                href="/editor/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Users className="w-8 h-8 mr-3 text-green-600" />
                  Assign Reviewers
                </h1>
                <p className="text-gray-600 mt-1">
                  Assign submitted articles to reviewers for peer review
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Submitted Articles</p>
                <p className="text-2xl font-bold text-gray-900">{articles.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Reviewers</p>
                <p className="text-2xl font-bold text-gray-900">{reviewers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Articles List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Submitted Articles Awaiting Review Assignment
            </h2>
          </div>
          
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Submitted Articles</h3>
              <p className="text-gray-600">No articles are currently waiting for reviewer assignment.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {articles.map((article) => {
                const assignedReviewers = getAssignedReviewers(article.id);
                return (
                  <div key={article.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{article.title}</h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {article.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Author:</span> {article.author_name}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Submitted:</span> {new Date(article.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-600">
                            {getArticlePreview(article.content)}
                          </p>
                        </div>

                        {/* Assigned Reviewers */}
                        {assignedReviewers.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Assigned Reviewers:</p>
                            <div className="flex flex-wrap gap-2">
                              {assignedReviewers.map((assignment, index) => (
                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  {assignment.reviewer_name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="ml-6 flex flex-col space-y-2">
                        <Link
                          href={`/editor/articles/${article.id}/view`}
                          className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Article
                        </Link>
                      </div>
                    </div>

                    {/* Reviewer Assignment Section */}
                    <div className="border-t border-gray-100 pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Assign Reviewers:</h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {reviewers.map((reviewer) => {
                          const isAssigned = isReviewerAssigned(article.id, reviewer.id);
                          const isAssigningThis = assigning === `${article.id}-${reviewer.id}`;
                          
                          return (
                            <div key={reviewer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <User className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{reviewer.full_name}</p>
                                  <p className="text-xs text-gray-500">{reviewer.email}</p>
                                </div>
                              </div>
                              
                              {isAssigned ? (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Assigned
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleAssignReviewer(article.id, reviewer.id)}
                                  disabled={isAssigningThis}
                                  className="flex items-center px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isAssigningThis ? (
                                    <>
                                      <Clock className="w-3 h-3 mr-1 animate-spin" />
                                      Assigning...
                                    </>
                                  ) : (
                                    <>
                                      <Send className="w-3 h-3 mr-1" />
                                      Assign
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
