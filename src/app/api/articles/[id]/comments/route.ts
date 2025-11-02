import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// GET - Fetch all messages for an article
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const articleId = parseInt(params.id);
  
  try {
    // Fetch messages with sender information
    const messagesQuery = `
      SELECT m.*, u.full_name as sender_name, u.username
      FROM article_messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.article_id = ?
      ORDER BY m.created_at ASC
    `;
    
    const messages = await query(messagesQuery, [articleId]) as any[];
    
    return NextResponse.json({
      success: true,
      messages: messages.map(msg => ({
        id: msg.id,
        article_id: msg.article_id,
        sender_id: msg.sender_id,
        sender_name: msg.sender_name || msg.username,
        sender_role: msg.sender_role,
        message: msg.message,
        file_url: msg.file_url,
        file_name: msg.file_name,
        file_type: msg.file_type,
        created_at: msg.created_at
      }))
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Send a new message with optional file
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const articleId = parseInt(params.id);
  
  try {
    const formData = await request.formData();
    const message = formData.get('message') as string;
    const senderId = parseInt(formData.get('sender_id') as string);
    const senderRole = formData.get('sender_role') as string;
    const file = formData.get('file') as File | null;

    if (!senderId || !senderRole) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!message?.trim() && !file) {
      return NextResponse.json(
        { error: 'Message or file is required' },
        { status: 400 }
      );
    }

    let fileUrl = null;
    let fileName = null;
    let fileType = null;

    // Handle file upload
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'articles', articleId.toString());
      await mkdir(uploadsDir, { recursive: true });
      
      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      fileName = file.name;
      const uniqueFileName = `${timestamp}-${file.name}`;
      const filePath = join(uploadsDir, uniqueFileName);
      
      await writeFile(filePath, buffer);
      
      fileUrl = `/uploads/articles/${articleId}/${uniqueFileName}`;
      fileType = file.type;
    }

    // Get sender information
    const senderQuery = 'SELECT full_name, username FROM users WHERE id = ?';
    const senderResult = await query(senderQuery, [senderId]) as any[];
    const senderName = senderResult[0]?.full_name || senderResult[0]?.username || 'Unknown';

    // Insert message into database
    const insertQuery = `
      INSERT INTO article_messages 
      (article_id, sender_id, sender_role, message, file_url, file_name, file_type, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const result = await query(insertQuery, [
      articleId,
      senderId,
      senderRole,
      message || null,
      fileUrl,
      fileName,
      fileType
    ]) as any;

    // Get the inserted message with sender info
    const newMessageQuery = `
      SELECT m.*, u.full_name as sender_name, u.username
      FROM article_messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `;
    
    const newMessage = await query(newMessageQuery, [result.insertId]) as any[];

    // Create notifications for relevant users
    await createNotifications(articleId, senderId, senderRole, message, fileName);

    return NextResponse.json({
      success: true,
      message: {
        id: newMessage[0].id,
        article_id: newMessage[0].article_id,
        sender_id: newMessage[0].sender_id,
        sender_name: newMessage[0].sender_name || newMessage[0].username,
        sender_role: newMessage[0].sender_role,
        message: newMessage[0].message,
        file_url: newMessage[0].file_url,
        file_name: newMessage[0].file_name,
        file_type: newMessage[0].file_type,
        created_at: newMessage[0].created_at
      }
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

async function createNotifications(articleId: number, senderId: number, senderRole: string, message: string, fileName?: string) {
  try {
    // Get article and author info
    const articleQuery = 'SELECT * FROM articles WHERE id = ?';
    const articleResult = await query(articleQuery, [articleId]) as any[];
    
    if (articleResult.length === 0) return;
    
    const article = articleResult[0];
    const notificationMessage = fileName 
      ? `New file shared: ${fileName}${message ? ` - ${message}` : ''}`
      : message;

    // Notify different users based on sender role
    const notifications = [];
    
    if (senderRole === 'reviewer') {
      // Notify editor and author
      notifications.push({
        user_id: article.author_id,
        type: 'reviewer_message',
        title: `Reviewer Message on "${article.title}"`,
        message: notificationMessage,
        action_url: `/author/articles/${articleId}/chat`
      });
      
      // Find editors (assuming role-based notification)
      const editorsQuery = 'SELECT id FROM users WHERE role = "editor"';
      const editors = await query(editorsQuery, []) as any[];
      
      editors.forEach(editor => {
        notifications.push({
          user_id: editor.id,
          type: 'reviewer_message',
          title: `Reviewer Message on "${article.title}"`,
          message: notificationMessage,
          action_url: `/editor/articles/${articleId}/chat`
        });
      });
    } else if (senderRole === 'author') {
      // Notify editor and reviewers
      const editorsQuery = 'SELECT id FROM users WHERE role = "editor"';
      const editors = await query(editorsQuery, []) as any[];
      
      editors.forEach(editor => {
        notifications.push({
          user_id: editor.id,
          type: 'author_message',
          title: `Author Message on "${article.title}"`,
          message: notificationMessage,
          action_url: `/editor/articles/${articleId}/chat`
        });
      });
    } else if (senderRole === 'editor') {
      // Notify author and reviewers
      notifications.push({
        user_id: article.author_id,
        type: 'editor_message',
        title: `Editor Message on "${article.title}"`,
        message: notificationMessage,
        action_url: `/author/articles/${articleId}/chat`
      });
      
      const reviewersQuery = 'SELECT id FROM users WHERE role = "reviewer"';
      const reviewers = await query(reviewersQuery, []) as any[];
      
      reviewers.forEach(reviewer => {
        notifications.push({
          user_id: reviewer.id,
          type: 'editor_message',
          title: `Editor Message on "${article.title}"`,
          message: notificationMessage,
          action_url: `/reviewer/articles/${articleId}`
        });
      });
    }

    // Insert all notifications
    for (const notification of notifications) {
      if (notification.user_id !== senderId) { // Don't notify sender
        await query(
          `INSERT INTO notifications (user_id, type, title, message, article_id, related_user_id, action_url) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            notification.user_id,
            notification.type,
            notification.title,
            notification.message,
            articleId,
            senderId,
            notification.action_url
          ]
        );
      }
    }

  } catch (error) {
    console.error('Error creating notifications:', error);
  }
}
