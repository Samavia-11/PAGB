import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      article_id,
      recommendation,
      comments,
      strengths,
      weaknesses,
      suggestions,
      confidential_comments
    } = body;

    // Validate required fields
    if (!article_id || !recommendation || !comments) {
      return NextResponse.json(
        { error: 'Article ID, recommendation, and comments are required' },
        { status: 400 }
      );
    }

    // Get reviewer info from session/auth (simplified for now)
    const reviewerId = 1; // This should come from authentication
    const reviewerName = 'Reviewer'; // This should come from authentication

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Insert the review submission
      const [reviewResult] = await connection.execute(
        `INSERT INTO article_reviews (
          article_id, reviewer_id, reviewer_name, recommendation, 
          comments, strengths, weaknesses, suggestions, confidential_comments,
          status, submitted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', NOW())`,
        [
          article_id,
          reviewerId,
          reviewerName,
          recommendation,
          comments,
          strengths || null,
          weaknesses || null,
          suggestions || null,
          confidential_comments || null
        ]
      );

      // Update article status to 'reviewed' or 'with_editor'
      await connection.execute(
        `UPDATE articles SET 
          status = 'with_editor',
          updated_at = NOW()
        WHERE id = ?`,
        [article_id]
      );

      // Move the article assignment to completed
      await connection.execute(
        `UPDATE article_assignments SET 
          status = 'completed',
          completed_at = NOW()
        WHERE article_id = ? AND reviewer_id = ?`,
        [article_id, reviewerId]
      );

      // Create notification for editor
      await connection.execute(
        `INSERT INTO notifications (
          user_id, user_role, type, title, message, 
          related_id, created_at
        ) VALUES (
          1, 'editor', 'review_submitted', 'Review Completed',
          CONCAT('A review has been submitted for article: ', (SELECT title FROM articles WHERE id = ?)),
          ?, NOW()
        )`,
        [article_id, article_id]
      );

      // Archive the review (copy to archive table)
      await connection.execute(
        `INSERT INTO review_archive (
          article_id, article_title, author_name, reviewer_id, reviewer_name,
          recommendation, comments, strengths, weaknesses, suggestions,
          confidential_comments, submitted_at, archived_at
        ) SELECT 
          ar.article_id, a.title, a.author_name, ar.reviewer_id, ar.reviewer_name,
          ar.recommendation, ar.comments, ar.strengths, ar.weaknesses, ar.suggestions,
          ar.confidential_comments, ar.submitted_at, NOW()
        FROM article_reviews ar
        JOIN articles a ON ar.article_id = a.id
        WHERE ar.article_id = ? AND ar.reviewer_id = ?`,
        [article_id, reviewerId]
      );

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: 'Review submitted successfully',
        review_id: (reviewResult as any).insertId
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewerId = searchParams.get('reviewer_id');

    if (!reviewerId) {
      return NextResponse.json(
        { error: 'Reviewer ID is required' },
        { status: 400 }
      );
    }

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      // Get submitted reviews for the reviewer
      const [reviews] = await connection.execute(
        `SELECT 
          ar.*,
          a.title as article_title,
          a.author_name,
          a.status as article_status
        FROM article_reviews ar
        JOIN articles a ON ar.article_id = a.id
        WHERE ar.reviewer_id = ?
        ORDER BY ar.submitted_at DESC`,
        [reviewerId]
      );

      return NextResponse.json({
        success: true,
        reviews
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
