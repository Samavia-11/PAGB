'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Paperclip, Download, FileText, Image as ImageIcon, File, MessageCircle, ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';

interface FileAttachment {
  name: string;
  type: string;
  size: number;
  url: string;
}

interface Message {
  id: string;
  sender_id: number;
  sender_role: 'editor' | 'reviewer';
  sender_name: string;
  message: string;
  timestamp: string;
  read: boolean;
  attachment?: FileAttachment;
}

interface Editor {
  id: number;
  full_name: string;
  username: string;
  email: string;
}

export default function ReviewerMessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [editors, setEditors] = useState<Editor[]>([]);
  const [selectedEditor, setSelectedEditor] = useState<Editor | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    fetchEditors();
  }, [router]);

  const loadMessages = useCallback(async () => {
    if (!user || !selectedEditor) return;
    
    try {
      const response = await fetch(
        `/api/messages?sender_id=${selectedEditor.id}&receiver_id=${user.id}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.messages) {
          const transformedMessages: Message[] = data.messages.map((msg: any) => ({
            id: msg.id.toString(),
            sender_id: msg.sender_id,
            sender_role: msg.sender_role as 'editor' | 'reviewer',
            sender_name: msg.sender_name,
            message: msg.message || '',
            timestamp: msg.created_at,
            read: false,
            attachment: msg.file_url ? {
              name: msg.file_name || 'file',
              type: msg.file_type || 'application/octet-stream',
              size: 0,
              url: msg.file_url
            } : undefined
          }));
          setMessages(transformedMessages);
        }
      } else {
        // If API fails (e.g., table doesn't exist), just continue without error
        console.warn('Messages API failed, continuing without loading messages');
      }
    } catch (error) {
      // Silently handle errors - don't break the UI
      console.warn('Error loading messages (non-critical):', error);
    }
  }, [user, selectedEditor]);

  useEffect(() => {
    if (user && selectedEditor) {
      loadMessages();
      const interval = setInterval(() => {
        loadMessages();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [user, selectedEditor, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchEditors = async () => {
    try {
      const response = await fetch('/api/users?role=editor');
      if (response.ok) {
        const data = await response.json();
        setEditors(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching editors:', error);
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
    if (!user || !selectedEditor) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('message', newMessage);
      formData.append('sender_id', user.id.toString());
      formData.append('sender_role', 'reviewer');
      formData.append('receiver_id', selectedEditor.id.toString());
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await fetch('/api/messages', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.message) {
          const transformedMessage: Message = {
            id: data.message.id.toString(),
            sender_id: data.message.sender_id,
            sender_role: data.message.sender_role as 'editor' | 'reviewer',
            sender_name: data.message.sender_name,
            message: data.message.message || '',
            timestamp: data.message.created_at,
            read: false,
            attachment: data.message.file_url ? {
              name: data.message.file_name || selectedFile?.name || 'file',
              type: data.message.file_type || selectedFile?.type || 'application/octet-stream',
              size: selectedFile?.size || 0,
              url: data.message.file_url
            } : undefined
          };
          
          const updatedMessages = [...messages, transformedMessage];
          setMessages(updatedMessages);
        }
        
        setNewMessage('');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        // If table doesn't exist, save to localStorage as fallback
        const errorData = await response.json().catch(() => ({ error: 'Failed to send message' }));
        
        // Save to localStorage as fallback
        const fallbackMessage: Message = {
          id: Date.now().toString(),
          sender_id: user.id,
          sender_role: 'reviewer',
          sender_name: user.fullName || user.username,
          message: newMessage || '',
          timestamp: new Date().toISOString(),
          read: false,
          attachment: selectedFile ? {
            name: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size,
            url: URL.createObjectURL(selectedFile)
          } : undefined
        };
        
        const updatedMessages = [...messages, fallbackMessage];
        setMessages(updatedMessages);
        
        // Save to localStorage
        const chatKey = `reviewer_editor_chat_${selectedEditor.id}`;
        localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
        
        setNewMessage('');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        console.warn('Message saved to localStorage (table may not exist):', errorData.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Save to localStorage as fallback
      const fallbackMessage: Message = {
        id: Date.now().toString(),
        sender_id: user.id,
        sender_role: 'reviewer',
        sender_name: user.fullName || user.username,
        message: newMessage || '',
        timestamp: new Date().toISOString(),
        read: false,
        attachment: selectedFile ? {
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          url: URL.createObjectURL(selectedFile)
        } : undefined
      };
      
      const updatedMessages = [...messages, fallbackMessage];
      setMessages(updatedMessages);
      
      // Save to localStorage
      const chatKey = `reviewer_editor_chat_${selectedEditor.id}`;
      localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
      
      setNewMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setSending(false);
    }
  };

  const handleFileDownload = async (attachment: FileAttachment) => {
    try {
      if (attachment.url.startsWith('/uploads')) {
        const response = await fetch(attachment.url);
        if (!response.ok) {
          throw new Error('Failed to download file');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = attachment.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[forestgreen] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Editors List Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-[forestgreen]" />
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {editors.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No editors available</p>
            </div>
          ) : (
            editors.map((editor) => (
              <button
                key={editor.id}
                onClick={() => setSelectedEditor(editor)}
                className={`w-full p-4 border-b hover:bg-gray-50 transition-colors text-left ${
                  selectedEditor?.id === editor.id ? 'bg-gray-50 border-l-4 border-l-[forestgreen]' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-semibold">
                    {(editor.full_name || editor.username).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {editor.full_name || editor.username}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{editor.email}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedEditor ? (
          <>
            {/* Header */}
            <div className="bg-white shadow-sm border-b p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-semibold text-lg">
                  {(selectedEditor.full_name || selectedEditor.username).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {selectedEditor.full_name || selectedEditor.username}
                  </h1>
                  <p className="text-sm text-gray-600">{selectedEditor.email}</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Start the Conversation</h3>
                  <p className="text-gray-600">Send a message to {selectedEditor.full_name || selectedEditor.username} to begin chatting.</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_role === 'reviewer' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                      message.sender_role === 'reviewer' ? 'order-1' : 'order-2'
                    }`}>
                      <div className={`rounded-2xl px-4 py-2 ${
                        message.sender_role === 'reviewer'
                          ? 'bg-[forestgreen] text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}>
                        {message.message && <p className="text-sm mb-2">{message.message}</p>}
                        {message.attachment && (
                          <div className={`mt-2 p-3 rounded-lg border-2 ${
                            message.sender_role === 'reviewer'
                              ? 'bg-[forestgreen]/80 border-[forestgreen]/60'
                              : 'bg-gray-100 border-gray-300'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center flex-1 min-w-0">
                                <FileText className={`w-5 h-5 mr-2 flex-shrink-0 ${message.sender_role === 'reviewer' ? 'text-white' : 'text-gray-700'}`} />
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium truncate ${message.sender_role === 'reviewer' ? 'text-white' : 'text-gray-900'}`}>
                                    {message.attachment.name}
                                  </p>
                                  <p className={`text-xs ${message.sender_role === 'reviewer' ? 'text-white opacity-75' : 'text-gray-600'}`}>
                                    {Math.round(message.attachment.size / 1024)} KB
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleFileDownload(message.attachment!)}
                                className={`ml-2 p-1.5 rounded hover:bg-opacity-20 hover:bg-black transition-colors ${message.sender_role === 'reviewer' ? 'text-white' : 'text-gray-700'}`}
                                title="Download file"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className={`flex items-center mt-1 space-x-2 text-xs text-gray-500 ${
                        message.sender_role === 'reviewer' ? 'justify-end' : 'justify-start'
                      }`}>
                        <span>{message.sender_name}</span>
                        <span>•</span>
                        <span>{formatTime(message.timestamp)}</span>
                      </div>
                    </div>
                    
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ml-3 mr-3 ${
                      message.sender_role === 'reviewer' 
                        ? 'bg-[forestgreen] order-2' 
                        : 'bg-gray-400 order-1'
                    }`}>
                      {message.sender_name.charAt(0).toUpperCase()}
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
                  className="p-2 text-gray-500 hover:text-[forestgreen] hover:bg-green-50 rounded-lg"
                  title="Attach file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                    }}
                    placeholder="Type your message or share a file..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[forestgreen] focus:border-transparent resize-none bg-white text-gray-900 placeholder-gray-400"
                    rows={3}
                    disabled={sending}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && !sending) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>
                
                <button
                  onClick={handleSendMessage}
                  disabled={sending || (!newMessage.trim() && !selectedFile)}
                  className="p-3 bg-[forestgreen] text-white rounded-lg hover:bg-[#1d7a1d] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Select an editor to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

