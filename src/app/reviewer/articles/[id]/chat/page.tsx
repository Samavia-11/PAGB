'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Send, Paperclip, Download, FileText, Image as ImageIcon, File, Eye, MessageCircle, User, ArrowLeft } from 'lucide-react';

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
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  const loadMessages = useCallback(() => {
    const storageKey = `chat_messages_article_${articleId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsedMessages = JSON.parse(stored);
      setMessages(parsedMessages);
      
      // Mark messages as read
      const updatedMessages = parsedMessages.map((msg: Message) => ({
        ...msg,
        read: msg.senderRole === 'reviewer' || msg.read
      }));
      
      if (JSON.stringify(updatedMessages) !== stored) {
        localStorage.setItem(storageKey, JSON.stringify(updatedMessages));
      }
    }
  }, [articleId]);

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
    loadMessages();

    // Set up real-time message polling
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [router, articleId, fetchArticle, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || sending || !user) return;

    setSending(true);
    const messageId = Date.now().toString();
    
    let attachment: FileAttachment | undefined;
    if (selectedFile) {
      attachment = {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        url: URL.createObjectURL(selectedFile)
      };
    }

    const message: Message = {
      id: messageId,
      sender: user.id.toString(),
      senderRole: 'reviewer',
      senderName: user.fullName || user.username,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: true,
      attachment
    };

    // Add to local storage
    const storageKey = `chat_messages_article_${articleId}`;
    const existingMessages = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updatedMessages = [...existingMessages, message];
    localStorage.setItem(storageKey, JSON.stringify(updatedMessages));

    // Create notification for editor
    try {
      const notificationStorageKey = `notifications_editor_article_${articleId}`;
      const existingNotifications = JSON.parse(localStorage.getItem(notificationStorageKey) || '[]');
      const notification = {
        id: Date.now(),
        type: 'message',
        title: 'New Message from Reviewer',
        message: `${user.fullName || user.username}: ${newMessage.substring(0, 50)}${newMessage.length > 50 ? '...' : ''}`,
        article_id: articleId,
        article_title: article?.title,
        from_user: user.fullName || user.username,
        timestamp: new Date().toISOString(),
        read: false
      };
      existingNotifications.push(notification);
      localStorage.setItem(notificationStorageKey, JSON.stringify(existingNotifications));
    } catch (error) {
      console.error('Error creating notification:', error);
    }

    setMessages(updatedMessages);
    setNewMessage('');
    setSelectedFile(null);
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (type.includes('pdf')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[forestgreen] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Chat: {article?.title}
              </h1>
              <p className="text-sm text-gray-600">
                Discussion with Editor about this article
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.push(`/reviewer/articles/${articleId}/view`)}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Article
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-600">Start a conversation with the editor about this article.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderRole === 'reviewer' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderRole === 'reviewer'
                      ? 'bg-[forestgreen] text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                        message.senderRole === 'reviewer'
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {message.senderRole === 'reviewer' ? 'R' : 'E'}
                    </div>
                    <span className="text-xs opacity-75">{message.senderName}</span>
                  </div>
                  
                  {message.message && (
                    <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                  )}
                  
                  {message.attachment && (
                    <div className="mt-2 p-2 bg-black/10 rounded flex items-center space-x-2">
                      {getFileIcon(message.attachment.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{message.attachment.name}</p>
                        <p className="text-xs opacity-75">{formatFileSize(message.attachment.size)}</p>
                      </div>
                      <button className="text-xs underline">Download</button>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-75">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                    {message.senderRole === 'reviewer' && (
                      <span className="text-xs opacity-75">
                        {message.read ? 'Read' : 'Sent'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          {selectedFile && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getFileIcon(selectedFile.type)}
                <div>
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-gray-600">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          )}
          
          <div className="flex items-end space-x-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[forestgreen] focus:border-transparent resize-none"
                rows={1}
                style={{ minHeight: '40px', maxHeight: '120px' }}
              />
            </div>
            
            <button
              onClick={sendMessage}
              disabled={(!newMessage.trim() && !selectedFile) || sending}
              className="flex-shrink-0 px-4 py-2 bg-[forestgreen] text-white rounded-lg hover:bg-[#1d7a1d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
        </div>
      </div>
    </div>
  );
}
