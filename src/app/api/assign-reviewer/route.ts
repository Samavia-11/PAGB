import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isValidId, escapeHtml } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from middleware
    const authUserId = request.headers.get('x-user-id');
    const authUserRole = request.headers.get('x-user-role');

    if (!authUserId || !authUserRole) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only editors and administrators can assign reviewers
    if (authUserRole !== 'editor' && authUserRole !== 'administrator') {
      return NextResponse.json({ error: 'Only editors can assign reviewers' }, { status: 403 });
    }

    const body = await request.json();
    const { article_id, reviewer_id } = body;

    // Validate IDs
    if (!isValidId(article_id)) {
      return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 });
    }
    if (!isValidId(reviewer_id)) {
      return NextResponse.json({ error: 'Invalid reviewer ID' }, { status: 400 });
    }

    // Verify reviewer exists and has reviewer role
    const [reviewerCheck] = await query(
      'SELECT id, role FROM users WHERE id = ?',
      [reviewer_id]
    ) as any[];

    if (!reviewerCheck) {
      return NextResponse.json({ error: 'Reviewer not found' }, { status: 404 });
    }

    if (reviewerCheck.role !== 'reviewer') {
      return NextResponse.json({ error: 'Selected user is not a reviewer' }, { status: 400 });
    }

    // Check if assignment already exists
    const existingAssignment = await query(
      'SELECT id FROM article_assignments WHERE article_id = ? AND reviewer_id = ?',
      [article_id, reviewer_id]
    );

    if ((existingAssignment as any[]).length > 0) {
      return NextResponse.json({ error: 'Reviewer already assigned to this article' }, { status: 400 });
    }

    // Create new assignment
    const assignmentResult = await query(`
      INSERT INTO article_assignments (article_id, reviewer_id, assigned_at, status)
      VALUES (?, ?, NOW(), 'assigned')
    `, [article_id, reviewer_id]);

    // Get article and reviewer details for notification
    const [articleDetails] = await query(
      'SELECT title, author_id FROM articles WHERE id = ?',
      [article_id]
    ) as any[];

    const [reviewerDetails] = await query(
      'SELECT full_name, email FROM users WHERE id = ?',
      [reviewer_id]
    ) as any[];

    // Create notification for reviewer with sanitized content
    const safeTitle = escapeHtml(articleDetails?.title || 'Unknown Article');
    await query(`
      INSERT INTO notifications (
        user_id, type, title, message, 
        article_id, is_read, created_at
      ) VALUES (
        ?, 'article_assigned', 'New Article Assigned for Review',
        ?, ?, FALSE, NOW()
      )
    `, [
      reviewer_id,
      `You have been assigned to review the article "${safeTitle}". Please review and provide your feedback.`,
      article_id
    ]);

    return NextResponse.json({ 
      success: true, 
      assignment_id: (assignmentResult as any).insertId,
      message: `Article assigned to ${escapeHtml(reviewerDetails?.full_name || 'reviewer')} successfully`
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
  }
}
