import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { reviewer_id } = await request.json();
    const resolvedParams = await params;
    const articleId = resolvedParams.id;

    if (!reviewer_id) {
      return NextResponse.json({ error: 'Reviewer ID is required' }, { status: 400 });
    }

    // Create article_assignments table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS article_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        article_id INT NOT NULL,
        reviewer_id INT NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('assigned', 'completed') DEFAULT 'assigned'
      )
    `);

    // Check if assignment already exists
    const existingAssignment: any = await query(
      'SELECT * FROM article_assignments WHERE article_id = ? AND reviewer_id = ?',
      [articleId, reviewer_id]
    );

    if (existingAssignment && existingAssignment.length > 0) {
      return NextResponse.json({ error: 'Reviewer already assigned to this article' }, { status: 400 });
    }

    // Create the assignment
    console.log('Creating assignment for article:', articleId, 'with reviewer:', reviewer_id);
    const assignmentResult = await query(
      'INSERT INTO article_assignments (article_id, reviewer_id) VALUES (?, ?)',
      [articleId, reviewer_id]
    );
    console.log('Assignment result:', assignmentResult);

    // Update article status
    const updateResult = await query(
      'UPDATE articles SET status = ? WHERE id = ?',
      ['under_review', articleId]
    );
    console.log('Update result:', updateResult);

    // Get reviewer details for notification
    const reviewerResult: any = await query(
      'SELECT * FROM users WHERE id = ?',
      [reviewer_id]
    );

    const reviewer = reviewerResult[0];
    console.log('Reviewer found:', reviewer);

    // Get article details
    const articleResult: any = await query(
      'SELECT * FROM articles WHERE id = ?',
      [articleId]
    );

    const article = articleResult[0];
    console.log('Article found:', article);

    // Create notification for reviewer (optional)
    try {
      await query(
        'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
        [
          reviewer_id,
          'article_assigned',
          'New Article Assignment',
          `You have been assigned to review the article "${article.title}".`
        ]
      );
    } catch (notificationError) {
      console.log('Notification creation failed (optional):', notificationError);
    }

    return NextResponse.json({ 
      message: 'Reviewer assigned successfully',
      reviewer: reviewer.full_name || reviewer.username
    }, { status: 200 });

  } catch (error) {
    console.error('Error assigning reviewer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
