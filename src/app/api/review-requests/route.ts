import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { editor_id, reviewer_id, article_id, status } = await request.json();

    if (!editor_id || !reviewer_id || !article_id) {
      return NextResponse.json({ error: 'Editor ID, Reviewer ID, and Article ID are required' }, { status: 400 });
    }

    // First, create the review_requests table if it doesn't exist (with article_id)
    await query(`
      CREATE TABLE IF NOT EXISTS review_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        editor_id INT NOT NULL,
        reviewer_id INT NOT NULL,
        article_id INT NOT NULL,
        status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Check if a pending request already exists for this specific article and reviewer
    const existingRequest: any = await query(
      'SELECT * FROM review_requests WHERE editor_id = ? AND reviewer_id = ? AND article_id = ? AND status = ?',
      [editor_id, reviewer_id, article_id, 'pending']
    );

    if (existingRequest && existingRequest.length > 0) {
      return NextResponse.json({ error: 'A pending request already exists for this article with this reviewer' }, { status: 400 });
    }

    // Get article details for the notification
    const [articleDetails] = await query(
      'SELECT title FROM articles WHERE id = ?',
      [article_id]
    ) as any[];

    if (!articleDetails) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Create the review request
    const result: any = await query(
      'INSERT INTO review_requests (editor_id, reviewer_id, article_id, status) VALUES (?, ?, ?, ?)',
      [editor_id, reviewer_id, article_id, status || 'pending']
    );

    // Get editor and reviewer details for notification
    const editorResult: any = await query('SELECT * FROM users WHERE id = ?', [editor_id]);
    const reviewerResult: any = await query('SELECT * FROM users WHERE id = ?', [reviewer_id]);
    
    const editor = editorResult[0];
    const reviewer = reviewerResult[0];

    // Create notification for reviewer (optional - don't fail if notifications table doesn't exist)
    try {
      await query(
        'INSERT INTO notifications (user_id, type, title, message, article_id) VALUES (?, ?, ?, ?, ?)',
        [
          reviewer_id,
          'review_request',
          'New Review Request',
          `${editor.full_name || editor.username} has sent you a review request for the article "${articleDetails.title}".`,
          article_id
        ]
      );
    } catch (notificationError) {
      console.log('Notification creation failed (optional):', notificationError);
      // Continue without failing the main request
    }

    return NextResponse.json({ 
      message: 'Review request sent successfully',
      request_id: result.insertId
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating review request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const role = searchParams.get('role');

    console.log('GET review-requests - userId:', userId, 'role:', role);

    if (!userId || !role) {
      return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 });
    }

    // Ensure table exists (with article_id)
    await query(`
      CREATE TABLE IF NOT EXISTS review_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        editor_id INT NOT NULL,
        reviewer_id INT NOT NULL,
        article_id INT NOT NULL,
        status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    let requests;
    if (role === 'reviewer') {
      // Get requests sent to this reviewer with article information
      requests = await query(`
        SELECT rr.*, 
               u.full_name as editor_name, u.username as editor_username, u.email as editor_email,
               a.title as article_title, a.status as article_status
        FROM review_requests rr
        JOIN users u ON rr.editor_id = u.id
        JOIN articles a ON rr.article_id = a.id
        WHERE rr.reviewer_id = ?
        ORDER BY rr.created_at DESC
      `, [userId]);
    } else if (role === 'editor') {
      // Get requests sent by this editor with article information
      requests = await query(`
        SELECT rr.*, 
               u.full_name as reviewer_name, u.username as reviewer_username, u.email as reviewer_email,
               a.title as article_title, a.status as article_status
        FROM review_requests rr
        JOIN users u ON rr.reviewer_id = u.id
        JOIN articles a ON rr.article_id = a.id
        WHERE rr.editor_id = ?
        ORDER BY rr.created_at DESC
      `, [userId]);
    } else {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    
    return NextResponse.json({ requests }, { status: 200 });

  } catch (error) {
    console.error('Error fetching review requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
