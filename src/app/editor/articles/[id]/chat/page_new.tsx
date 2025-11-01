'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Send, Paperclip, Download, FileText, Image, File, Eye, MessageCircle, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: number;
  article_id: number;
  sender_id: number;
  sender_name: string;
  sender_role: string;
  message: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  created_at: string;
}

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

export default function EditorDualChat() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const authorMessagesEndRef = useRef<HTMLDivElement>(null);
  const reviewerMessagesEndRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<any>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [authorMessages, setAuthorMessages] = useState<Message[]>([]);
  const [reviewerMessages, setReviewerMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChat, setActiveChat] = useState<'author' | 'reviewer'>('author');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
    fetchArticle();
    fetchMessages();
  }, [articleId, router]);

  useEffect(() => {
    scrollToBottom();
  }, [authorMessages, reviewerMessages]);

  const scrollToBottom = () => {
    if (activeChat === 'author') {
      authorMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      reviewerMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/articles/${articleId}/comments`, {
        headers: {
          'x-user-role': 'editor'
        }
      });
      if (response.ok) {
        const data = await response.json();
        const messages = data.messages || [];
        
        // Separate messages by sender role
        const authorMsgs = messages.filter((msg: Message) => 
          msg.sender_role === 'author' || (msg.sender_role === 'editor' && msg.sender_id === user?.id)
        );
        const reviewerMsgs = messages.filter((msg: Message) => 
          msg.sender_role === 'reviewer' || (msg.sender_role === 'editor' && msg.sender_id === user?.id)
        );
        
        setAuthorMessages(authorMsgs);
        setReviewerMessages(reviewerMsgs);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;
    if (!user) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('message', newMessage);
      formData.append('sender_id', user.id.toString());
      formData.append('sender_role', user.role);
      formData.append('article_id', articleId);
      formData.append('target_role', activeChat); // Indicate which chat this is for
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add message to appropriate chat
        if (activeChat === 'author') {
          setAuthorMessages(prev => [...prev, data.message]);
        } else {
          setReviewerMessages(prev => [...prev, data.message]);
        }
        
        setNewMessage('');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleDownloadFile = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (fileType?.includes('document') || fileType?.includes('word')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderMessages = (messages: Message[], chatType: 'author' | 'reviewer') => {
    if (messages.length === 0) {
      return (
        <div className="text-center py-8">
          <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">
            No messages with {chatType} yet
          </p>
        </div>
      );
    }

    return messages.map((message) => (
      <div
        key={message.id}
        className={`flex ${message.sender_role === 'editor' ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-xs lg:max-w-sm px-3 py-2 rounded-lg ${
          message.sender_role === 'editor'
            ? 'bg-blue-600 text-white'
            : chatType === 'author'
            ? 'bg-green-600 text-white'
            : 'bg-purple-600 text-white'
        }`}>
          <div className="flex items-center space-x-2 mb-1">
            <User className="w-3 h-3" />
            <span className="text-xs font-medium">
              {message.sender_name} ({message.sender_role})
            </span>
          </div>
          
          {message.message && (
            <p className="text-sm mb-2">{message.message}</p>
          )}
          
          {message.file_url && (
            <div className="bg-white bg-opacity-20 rounded p-2 mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getFileIcon(message.file_type || '')}
                  <span className="text-xs truncate">{message.file_name}</span>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => window.open(message.file_url, '_blank')}
                    className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                    title="Preview"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDownloadFile(message.file_url!, message.file_name!)}
                    className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                    title="Download"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <p className="text-xs opacity-75">{formatDate(message.created_at)}</p>
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/editor/dashboard"
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{article?.title}</h1>
              <p className="text-sm text-gray-600">
                Dual Chat View • Author: {article?.author_name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              article?.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
              article?.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
              article?.status === 'with_editor' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {article?.status?.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Tabs */}
      <div className="bg-white border-b">
        <div className="flex">
          <button
            onClick={() => setActiveChat('author')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeChat === 'author'
                ? 'border-green-500 text-green-600 bg-green-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <User className="w-4 h-4" />
              <span>Author Chat</span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {authorMessages.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveChat('reviewer')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeChat === 'reviewer'
                ? 'border-purple-500 text-purple-600 bg-purple-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <User className="w-4 h-4" />
              <span>Reviewer Chat</span>
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                {reviewerMessages.length}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeChat === 'author' ? (
          <div>
            {renderMessages(authorMessages, 'author')}
            <div ref={authorMessagesEndRef} />
          </div>
        ) : (
          <div>
            {renderMessages(reviewerMessages, 'reviewer')}
            <div ref={reviewerMessagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t p-4">
        {selectedFile && (
          <div className="mb-3 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getFileIcon(selectedFile.type)}
              <span className="text-sm text-gray-700">{selectedFile.name}</span>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        )}
        
        <div className="flex items-end space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".doc,.docx,.pdf,.txt,.jpg,.jpeg,.png,.gif"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${activeChat}...`}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={sending || (!newMessage.trim() && !selectedFile)}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          Currently chatting with: <span className="font-medium capitalize">{activeChat}</span>
        </div>
      </div>
    </div>
  );
}
