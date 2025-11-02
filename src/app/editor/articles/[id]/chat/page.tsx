"use client";
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, User, Clock, Eye, MessageSquare, Phone, Video, MoreVertical, Paperclip, FileText, Download, X } from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  senderRole: 'editor' | 'author';
  senderName: string;
  message: string;
  timestamp: string;
  read: boolean;
  attachment?: {
    type: 'pdf';
    name: string;
    url: string;
    size: number;
  };
}

interface Article {
  id: number;
  title: string;
  author_name: string;
  status: string;
}

export default function EditorAuthorChat() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    loadMessages();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      loadMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [params.id, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/articles/${params.id}`, {
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
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = () => {
    const chatKey = `chat_${params.id}`;
    const savedMessages = localStorage.getItem(chatKey);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  };

  const saveMessages = (updatedMessages: Message[]) => {
    const chatKey = `chat_${params.id}`;
    localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
    setMessages(updatedMessages);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    // Simulate file upload - in real app, upload to server/cloud storage
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Store in localStorage with a unique key
        const fileKey = `file_${Date.now()}_${file.name}`;
        localStorage.setItem(fileKey, base64);
        resolve(fileKey);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || sending) return;

    setSending(true);
    setUploading(!!selectedFile);
    
    let attachment = undefined;
    if (selectedFile) {
      try {
        const fileUrl = await uploadFile(selectedFile);
        attachment = {
          type: 'pdf' as const,
          name: selectedFile.name,
          url: fileUrl,
          size: selectedFile.size
        };
      } catch (error) {
        console.error('File upload failed:', error);
        setSending(false);
        setUploading(false);
        return;
      }
    }

    const message: Message = {
      id: Date.now().toString(),
      sender: user.id.toString(),
      senderRole: 'editor',
      senderName: user.full_name || user.username,
      message: newMessage.trim() || (attachment ? `Shared a PDF: ${attachment.name}` : ''),
      timestamp: new Date().toISOString(),
      read: false,
      attachment
    };

    const updatedMessages = [...messages, message];
    saveMessages(updatedMessages);

    // Also save as notification for author
    const notification = {
      id: Date.now(),
      type: 'editor_chat',
      title: `New message from Editor`,
      message: attachment ? `Shared a PDF: ${attachment.name}` : newMessage.trim(),
      article_id: params.id,
      article_title: article?.title,
      from_user: user.full_name || user.username,
      from_role: user.role,
      created_at: new Date().toISOString(),
      is_read: false
    };

    const existingNotifications = JSON.parse(localStorage.getItem('author_notifications') || '[]');
    existingNotifications.unshift(notification);
    localStorage.setItem('author_notifications', JSON.stringify(existingNotifications.slice(0, 50)));

    setNewMessage('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSending(false);
    setUploading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownloadFile = (attachment: { name: string; url: string }) => {
    const fileData = localStorage.getItem(attachment.url);
    if (fileData) {
      const link = document.createElement('a');
      link.href = fileData;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/editor/dashboard"
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{article?.author_name || 'Author'}</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span>{isOnline ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href={`/editor/articles/${params.id}/view`}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Article
            </Link>
            
            <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            
            <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
              <Video className="w-5 h-5" />
            </button>
            
            <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Article Info Bar */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Discussion about: {article?.title}
            </span>
          </div>
          <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
            Article #{params.id}
          </span>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start the conversation</h3>
            <p className="text-gray-500">Send a message to begin discussing this article with the author.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderRole === 'editor' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                message.senderRole === 'editor' ? 'order-1' : 'order-2'
              }`}>
                <div className={`rounded-2xl px-4 py-2 ${
                  message.senderRole === 'editor'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}>
                  {message.message && <p className="text-sm">{message.message}</p>}
                  
                  {message.attachment && (
                    <div className={`mt-2 p-3 rounded-lg border ${
                      message.senderRole === 'editor'
                        ? 'border-blue-400 bg-blue-500'
                        : 'border-gray-300 bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className={`w-4 h-4 ${
                            message.senderRole === 'editor' ? 'text-white' : 'text-red-600'
                          }`} />
                          <div>
                            <p className={`text-xs font-medium ${
                              message.senderRole === 'editor' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {message.attachment.name}
                            </p>
                            <p className={`text-xs ${
                              message.senderRole === 'editor' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatFileSize(message.attachment.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadFile(message.attachment!)}
                          className={`p-1 rounded hover:bg-opacity-80 ${
                            message.senderRole === 'editor'
                              ? 'text-white hover:bg-blue-400'
                              : 'text-gray-600 hover:bg-gray-200'
                          }`}
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className={`flex items-center mt-1 space-x-2 text-xs text-gray-500 ${
                  message.senderRole === 'editor' ? 'justify-end' : 'justify-start'
                }`}>
                  <span>{message.senderName}</span>
                  <span>•</span>
                  <span>{formatTime(message.timestamp)}</span>
                  {message.senderRole === 'editor' && (
                    <>
                      <span>•</span>
                      <span className={message.read ? 'text-blue-500' : 'text-gray-400'}>
                        {message.read ? 'Read' : 'Sent'}
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ml-3 mr-3 ${
                message.senderRole === 'editor' 
                  ? 'bg-blue-600 order-2' 
                  : 'bg-green-600 order-1'
              }`}>
                {message.senderName.charAt(0).toUpperCase()}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        {/* File Preview */}
        {selectedFile && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <div className="relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={selectedFile ? "Add a message (optional)..." : "Type your message..."}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              
              {/* File Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded"
                title="Attach PDF"
                disabled={uploading}
              >
                <Paperclip className="w-5 h-5" />
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && !selectedFile) || sending || uploading}
            className={`p-3 rounded-full transition-colors ${
              (newMessage.trim() || selectedFile) && !sending && !uploading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span>{isOnline ? 'Connected' : 'Connecting...'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
