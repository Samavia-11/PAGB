'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Send, Paperclip, Download, FileText, Image, File, Eye, MessageCircle, User, ArrowLeft } from 'lucide-react';

interface FileAttachment {
  name: string;
  type: string;
  size: number;
  url: string;
}

interface Message {
  id: string;
  sender: string;
  senderRole: 'editor' | 'reviewer';
  senderName: string;
  message: string;
  timestamp: string;
  read: boolean;
  attachment?: FileAttachment;
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

export default function ReviewerArticleChat() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<any>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
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
    if (parsedUser.role !== 'reviewer') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
    fetchArticle();
    loadMessages();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      loadMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [articleId, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = () => {
    const chatKey = `reviewer_chat_${articleId}`;
    const savedMessages = localStorage.getItem(chatKey);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  };

  const saveMessages = (updatedMessages: Message[]) => {
    const chatKey = `reviewer_chat_${articleId}`;
    localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
    setMessages(updatedMessages);
  };

  const uploadFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        const fileKey = `file_${Date.now()}_${file.name}`;
        localStorage.setItem(fileKey, base64String);
        resolve(fileKey);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileDownload = (attachment: FileAttachment) => {
    const fileData = localStorage.getItem(attachment.url);
    if (fileData) {
      const link = document.createElement('a');
      link.href = fileData;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('File not found. It may have been deleted.');
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
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading article...</p>
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
            <MessageCircle className="w-6 h-6 text-purple-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{article?.title}</h1>
              <p className="text-sm text-gray-600">
                Discussion with Editor • Author: {article?.author_name}
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

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start the Discussion</h3>
            <p className="text-gray-600">Share your review, comments, or questions about this article.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderRole === 'reviewer' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                message.senderRole === 'reviewer' ? 'order-1' : 'order-2'
              }`}>
                <div className={`rounded-2xl px-4 py-2 ${
                  message.senderRole === 'reviewer'
                    ? 'bg-purple-600 text-white'
                    : 'bg-blue-600 text-white'
                }`}>
                  {message.message && <p className="text-sm mb-2">{message.message}</p>}
                  {message.attachment && (
                    <div className={`mt-2 p-3 rounded-lg border-2 ${
                      message.senderRole === 'reviewer'
                        ? 'bg-purple-500 border-purple-300'
                        : 'bg-blue-500 border-blue-300'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                          <FileText className="w-5 h-5 mr-2 flex-shrink-0 text-white" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-white">
                              {message.attachment.name}
                            </p>
                            <p className="text-xs text-white opacity-75">
                              {Math.round(message.attachment.size / 1024)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleFileDownload(message.attachment!)}
                          className="ml-2 p-1.5 rounded hover:bg-opacity-20 hover:bg-black transition-colors text-white"
                          title="Download file"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className={`flex items-center mt-1 space-x-2 text-xs text-gray-500 ${
                  message.senderRole === 'reviewer' ? 'justify-end' : 'justify-start'
                }`}>
                  <span>{message.senderName}</span>
                  <span>•</span>
                  <span>{formatTime(message.timestamp)}</span>
                </div>
              </div>
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ml-3 mr-3 ${
                message.senderRole === 'reviewer' 
                  ? 'bg-purple-600 order-2' 
                  : 'bg-blue-600 order-1'
              }`}>
                {message.senderName.charAt(0).toUpperCase()}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
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
            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message or share a file..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
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
            className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
