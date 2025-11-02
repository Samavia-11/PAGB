import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// GET - Fetch messages between two users
export async function GET(request: NextRequest) {
  const senderId = request.nextUrl.searchParams.get('sender_id');
  const receiverId = request.nextUrl.searchParams.get('receiver_id');
  
  try {
    if (!senderId || !receiverId) {
      return NextResponse.json(
        { error: 'Missing sender_id or receiver_id' },
        { status: 400 }
      );
    }

    const messagesQuery = `
      SELECT m.*, 
        s.full_name as sender_name, s.username as sender_username,
        r.full_name as receiver_name, r.username as receiver_username
      FROM direct_messages m
      JOIN users s ON m.sender_id = s.id
      JOIN users r ON m.receiver_id = r.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?) 
         OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `;
    
    const messages = await query(messagesQuery, [senderId, receiverId, receiverId, senderId]) as any[];
    
    return NextResponse.json({
      success: true,
      messages: messages.map(msg => ({
        id: msg.id,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        sender_name: msg.sender_name || msg.sender_username,
        receiver_name: msg.receiver_name || msg.receiver_username,
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

// POST - Send a new direct message
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const senderId = parseInt(formData.get('sender_id') as string);
    const receiverId = parseInt(formData.get('receiver_id') as string);
    const senderRole = formData.get('sender_role') as string;
    const message = formData.get('message') as string;
    const file = formData.get('file') as File | null;

    if (!senderId || !receiverId || !senderRole) {
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
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'messages', `${senderId}_${receiverId}`);
        await mkdir(uploadsDir, { recursive: true });
        
        // Generate unique filename
        const timestamp = Date.now();
        const originalFileName = file.name;
        const sanitizedFileName = originalFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        fileName = originalFileName;
        const uniqueFileName = `${timestamp}-${sanitizedFileName}`;
        const filePath = join(uploadsDir, uniqueFileName);
        
        await writeFile(filePath, buffer);
        
        fileUrl = `/uploads/messages/${senderId}_${receiverId}/${uniqueFileName}`;
        fileType = file.type || 'application/octet-stream';
      } catch (fileError) {
        console.error('Error uploading file:', fileError);
        throw new Error(`File upload failed: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
      }
    }

    // Insert message into database
    const insertQuery = `
      INSERT INTO direct_messages 
      (sender_id, receiver_id, sender_role, message, file_url, file_name, file_type, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const result = await query(insertQuery, [
      senderId,
      receiverId,
      senderRole,
      message || null,
      fileUrl,
      fileName,
      fileType
    ]) as any;

    // Get the inserted message with sender/receiver info
    const newMessageQuery = `
      SELECT m.*, 
        s.full_name as sender_name, s.username as sender_username,
        r.full_name as receiver_name, r.username as receiver_username
      FROM direct_messages m
      JOIN users s ON m.sender_id = s.id
      JOIN users r ON m.receiver_id = r.id
      WHERE m.id = ?
    `;
    
    const newMessage = await query(newMessageQuery, [result.insertId]) as any[];

    if (!newMessage || newMessage.length === 0) {
      throw new Error('Failed to retrieve inserted message');
    }

    return NextResponse.json({
      success: true,
      message: {
        id: newMessage[0].id,
        sender_id: newMessage[0].sender_id,
        receiver_id: newMessage[0].receiver_id,
        sender_name: newMessage[0].sender_name || newMessage[0].sender_username,
        receiver_name: newMessage[0].receiver_name || newMessage[0].receiver_username,
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
    const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

