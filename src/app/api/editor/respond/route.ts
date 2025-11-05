import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      forwarded_article_id,
      article_id,
      editor_response,
      decision,
      response_type
    } = body;

    // Validate required fields
    if (!forwarded_article_id || !article_id || !editor_response) {
      return NextResponse.json(
        { error: 'Forwarded article ID, article ID, and editor response are required' },
        { status: 400 }
      );
    }

    // Get editor info from session/auth (simplified for now)
    const editorId = 1; // This should come from authentication
    const editorName = 'Editor'; // This should come from authentication

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Update editor response
      await connection.execute(
        `UPDATE editor_responses SET 
          editor_id = ?,
          editor_name = ?,
          editor_response = ?,
          decision = ?,
          response_type = ?,
          status = 'responded',
          responded_at = NOW()
        WHERE forwarded_article_id = ? AND article_id = ?`,
        [
          editorId,
          editorName,
          editor_response,
          decision || null,
          response_type || 'feedback',
          forwarded_article_id,
          article_id
        ]
      );

      // Update article status based on decision
      let newStatus = 'with_editor';
      if (decision === 'accept') {
        newStatus = 'accepted';
      } else if (decision === 'reject') {
        newStatus = 'rejected';
      } else if (decision === 'revision_required') {
        newStatus = 'revision_required';
      }

      await connection.execute(
        `UPDATE articles SET 
          status = ?,
          updated_at = NOW()
        WHERE id = ?`,
        [newStatus, article_id]
      );

      // Get reviewer and article info for notification
      const [forwardedInfo] = await connection.execute(
        `SELECT 
          fa.reviewer_id,
          fa.reviewer_name,
          a.title as article_title,
          a.author_name
        FROM forwarded_articles fa
        JOIN articles a ON fa.article_id = a.id
        WHERE fa.id = ?`,
        [forwarded_article_id]
      );
      
      const info = (forwardedInfo as any[])[0];

      // Create notification for reviewer
      await connection.execute(
        `INSERT INTO notifications (
          user_id, user_role, type, title, message, 
          related_id, is_read, created_at
        ) VALUES (
          ?, 'reviewer', 'editor_response', 'Editor Response Received',
          CONCAT('Editor has responded to your forwarded article: "', ?'"'),
          ?, FALSE, NOW()
        )`,
        [info.reviewer_id, info.article_title, article_id]
      );

      // If decision affects author, notify them too
      if (decision && decision !== 'feedback_only') {
        await connection.execute(
          `INSERT INTO notifications (
            user_id, user_role, type, title, message, 
            related_id, is_read, created_at
          ) VALUES (
            (SELECT id FROM users WHERE username = ? LIMIT 1), 'author', 'article_decision', 
            'Article Decision Update',
            CONCAT('Your article "', ?, '" status has been updated to: ', ?),
            ?, FALSE, NOW()
          )`,
          [info.author_name, info.article_title, newStatus.replace('_', ' ').toUpperCase(), article_id]
        );
      }

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: 'Editor response submitted successfully'
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error submitting editor response:', error);
    return NextResponse.json(
      { error: 'Failed to submit editor response. Please try again.' },
      { status: 500 }
    );
  }
}

// Get editor responses for a specific article
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('article_id');
    const forwardedId = searchParams.get('forwarded_id');

    if (!articleId && !forwardedId) {
      return NextResponse.json(
        { error: 'Article ID or Forwarded ID is required' },
        { status: 400 }
      );
    }

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      let query = `
        SELECT 
          er.*,
          fa.reviewer_name,
          fa.recommendation,
          fa.reviewer_comments,
          fa.editor_comments,
          fa.forwarded_at,
          a.title as article_title,
          a.author_name
        FROM editor_responses er
        JOIN forwarded_articles fa ON er.forwarded_article_id = fa.id
        JOIN articles a ON er.article_id = a.id
      `;
      
      let params = [];
      if (articleId) {
        query += ` WHERE er.article_id = ?`;
        params.push(articleId);
      } else {
        query += ` WHERE er.forwarded_article_id = ?`;
        params.push(forwardedId);
      }
      
      query += ` ORDER BY er.responded_at DESC`;

      const [responses] = await connection.execute(query, params);

      return NextResponse.json({
        success: true,
        responses
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error fetching editor responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch editor responses' },
      { status: 500 }
    );
  }
}
