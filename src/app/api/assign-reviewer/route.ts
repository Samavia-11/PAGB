import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { article_id, reviewer_id, assigned_by } = body;

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

    // Create notification for reviewer
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
      `You have been assigned to review the article "${articleDetails.title}". Please review and provide your feedback.`,
      article_id
    ]);

    return NextResponse.json({ 
      success: true, 
      assignment_id: (assignmentResult as any).insertId,
      message: `Article assigned to ${reviewerDetails.full_name} successfully`
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
  }
}
