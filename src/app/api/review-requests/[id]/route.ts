import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { action, reviewer_id } = await request.json();
    const requestId = params.id;

    if (!action || !reviewer_id) {
      return NextResponse.json({ error: 'Action and reviewer ID are required' }, { status: 400 });
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be accept or reject' }, { status: 400 });
    }

    // Verify the request exists and belongs to the reviewer
    const requestResult: any = await query(
      'SELECT * FROM review_requests WHERE id = ? AND reviewer_id = ?',
      [requestId, reviewer_id]
    );

    if (!requestResult || requestResult.length === 0) {
      return NextResponse.json({ error: 'Review request not found or unauthorized' }, { status: 404 });
    }

    const request_record = requestResult[0];

    if (request_record.status !== 'pending') {
      return NextResponse.json({ error: 'Request has already been processed' }, { status: 400 });
    }

    // Update the request status
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    await query(
      'UPDATE review_requests SET status = ? WHERE id = ?',
      [newStatus, requestId]
    );

    // Get editor and reviewer details for notification
    const editorResult: any = await query('SELECT * FROM users WHERE id = ?', [request_record.editor_id]);
    const reviewerResult: any = await query('SELECT * FROM users WHERE id = ?', [reviewer_id]);
    
    const editor = editorResult[0];
    const reviewer = reviewerResult[0];

    // Initialize variable for tracking assigned articles
    let assignedArticlesCount = 0;

    // If reviewer accepts, assign them to the specific article from the request
    if (action === 'accept') {
      // Get the specific article from the review request
      const [articleDetails] = await query(
        'SELECT title FROM articles WHERE id = ?',
        [request_record.article_id]
      ) as any[];

      if (articleDetails) {
        // Check if article is not already assigned to this reviewer
        const [existingAssignment] = await query(
          'SELECT id FROM article_assignments WHERE article_id = ? AND reviewer_id = ?',
          [request_record.article_id, reviewer_id]
        ) as any[];

        if (!existingAssignment) {
          // Create assignment for the specific article
          await query(`
            INSERT INTO article_assignments (article_id, reviewer_id, assigned_at, status)
            VALUES (?, ?, NOW(), 'assigned')
          `, [request_record.article_id, reviewer_id]);

          // Create notification for reviewer about the assigned article
          await query(`
            INSERT INTO notifications (
              user_id, type, title, message, 
              article_id, is_read, created_at
            ) VALUES (
              ?, 'article_assigned', 'Article Assigned for Review',
              ?, ?, FALSE, NOW()
            )
          `, [
            reviewer_id,
            `You have been assigned to review the article "${articleDetails.title}". Please review and provide your feedback.`,
            request_record.article_id
          ]);

          assignedArticlesCount = 1;
        }
      }
    }

    // Create notification for editor
    const notificationMessage = action === 'accept' 
      ? `${reviewer.full_name || reviewer.username} has accepted your review request and has been assigned available articles.`
      : `${reviewer.full_name || reviewer.username} has declined your review request.`;

    await query(
      'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
      [
        request_record.editor_id,
        'review_request_response',
        `Review Request ${action === 'accept' ? 'Accepted' : 'Declined'}`,
        notificationMessage
      ]
    );

    return NextResponse.json({ 
      message: `Review request ${action}ed successfully`,
      status: newStatus,
      articlesAssigned: assignedArticlesCount
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating review request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
