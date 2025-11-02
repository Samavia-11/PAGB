"use client";
import { useEffect, useState, useRef, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, User, Eye, MessageSquare, FileText, Download, Image, File, Paperclip } from 'lucide-react';

interface FileAttachment {
  name: string;
  type: string;
  size: number;
  url: string;
}

interface Message {
  id: string;
  sender: string;
  senderRole: 'editor' | 'author';
  senderName: string;
  message: string;
  timestamp: string;
  read: boolean;
  attachment?: FileAttachment;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  const uploadFile = async (file: File): Promise<string> => {
    // Convert file to base64 for local storage
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        // Store in localStorage with a unique key
        const fileKey = `file_${Date.now()}_${file.name}`;
        console.log('Storing file with key:', fileKey);
        localStorage.setItem(fileKey, base64String);
        console.log('File stored successfully');
        resolve(fileKey);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileDownload = (attachment: FileAttachment) => {
    console.log('Attempting to download file:', attachment);
    console.log('Looking for key:', attachment.url);
    
    // Retrieve file from localStorage
    const fileData = localStorage.getItem(attachment.url);
    console.log('File data found:', fileData ? 'Yes' : 'No');
    
    if (fileData) {
      // Create a download link
      const link = document.createElement('a');
      link.href = fileData;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Check all localStorage keys to debug
      console.log('All localStorage keys:', Object.keys(localStorage));
      alert('File not found. It may have been deleted.');
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check file type (allow PDF, DOC, DOCX, TXT)
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid file type (PDF, DOC, DOCX, or TXT)');
        return;
      }
      
      setSelectedFile(file);
      
      // Reset the input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || sending) return;

    setSending(true);
    
    let attachment: FileAttachment | undefined;
    
    // Handle file upload if a file is selected
    if (selectedFile) {
      try {
        const fileUrl = await uploadFile(selectedFile);
        attachment = {
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          url: fileUrl
        };
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload file. Please try again.');
        setSending(false);
        return;
      }
    }
    
    const message: Message = {
      id: Date.now().toString(),
      sender: user.id.toString(),
      senderRole: 'editor',
      senderName: user.full_name || user.username,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false,
      attachment
    };

    console.log('Saving message with attachment:', message);
    const updatedMessages = [...messages, message];
    saveMessages(updatedMessages);

    // Also save as notification for author
    const notification = {
      id: Date.now(),
      type: 'editor_chat',
      title: `New message from Editor`,
      message: newMessage.trim() || (selectedFile ? `Sent a file: ${selectedFile.name}` : ''),
      article_id: params.id,
      article_title: article?.title,
      from_user: user.full_name || user.username,
      from_role: user.role,
      created_at: new Date().toISOString(),
      is_read: false,
      attachment: attachment ? {
        name: attachment.name,
        type: attachment.type,
        size: attachment.size,
        url: attachment.url
      } : undefined
    };

    const existingNotifications = JSON.parse(localStorage.getItem('author_notifications') || '[]');
    existingNotifications.unshift(notification);
    localStorage.setItem('author_notifications', JSON.stringify(existingNotifications.slice(0, 50)));

    setNewMessage('');
    setSelectedFile(null);
    setSending(false);
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
                  {message.message && <p className="text-sm mb-2">{message.message}</p>}
                  {message.attachment && (
                    <div className={`mt-2 p-3 rounded-lg border-2 ${
                      message.senderRole === 'editor'
                        ? 'bg-blue-500 border-blue-300'
                        : 'bg-gray-50 border-gray-300'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                          <FileText className={`w-5 h-5 mr-2 flex-shrink-0 ${
                            message.senderRole === 'editor' ? 'text-white' : 'text-blue-600'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              message.senderRole === 'editor' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {message.attachment.name}
                            </p>
                            <p className={`text-xs ${
                              message.senderRole === 'editor' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {Math.round(message.attachment.size / 1024)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleFileDownload(message.attachment!)}
                          className={`ml-2 p-1.5 rounded hover:bg-opacity-20 hover:bg-black transition-colors ${
                            message.senderRole === 'editor' ? 'text-white' : 'text-blue-600'
                          }`}
                          title="Download file"
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
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        />
        <div className="flex items-end space-x-3">
          <button
            onClick={handleAttachClick}
            className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>
          </div>
          
          {selectedFile && (
            <div className="flex items-center text-sm text-gray-600 mr-2 bg-blue-50 rounded-lg px-3 py-1">
              <FileText className="w-4 h-4 mr-2 text-blue-600" />
              <span className="truncate max-w-xs">{selectedFile.name}</span>
              <button 
                onClick={() => setSelectedFile(null)}
                className="ml-2 text-gray-400 hover:text-gray-600"
                title="Remove file"
              >
                &times;
              </button>
            </div>
          )}
          
          <button
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && !selectedFile) || sending}
            className={`p-3 rounded-full transition-colors ${
              newMessage.trim() && !sending
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
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
