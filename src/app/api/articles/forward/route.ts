import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const articleId = formData.get('article_id') as string;
    const recommendation = formData.get('recommendation') as string;
    const reviewerComments = formData.get('reviewer_comments') as string;
    const editorComments = formData.get('editor_comments') as string;
    const editedContent = formData.get('edited_content') as string;

    console.log('Forwarding article:', { articleId, recommendation, reviewerComments });

    // Validate required fields
    if (!articleId || !recommendation || !reviewerComments) {
      return NextResponse.json(
        { error: 'Article ID, recommendation, and reviewer comments are required' },
        { status: 400 }
      );
    }

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Update article status to 'accepted' (forwarded to editor) and content if edited
      await connection.execute(
        `UPDATE articles SET 
          status = 'accepted',
          content = COALESCE(?, content),
          updated_at = NOW()
        WHERE id = ?`,
        [editedContent, articleId]
      );

      // Update article assignment status if exists
      await connection.execute(
        `UPDATE article_assignments SET 
          status = 'completed'
        WHERE article_id = ?`,
        [articleId]
      );

      // Get article details
      const [articleRows] = await connection.execute(
        `SELECT a.title, u.username as author_name 
         FROM articles a 
         LEFT JOIN users u ON a.author_id = u.id 
         WHERE a.id = ?`,
        [articleId]
      );
      const article = (articleRows as any[])[0];

      if (!article) {
        throw new Error('Article not found');
      }

      // Get the first available editor
      const [editorRows] = await connection.execute(
        `SELECT id FROM users WHERE role = 'editor' LIMIT 1`
      );
      const editors = editorRows as any[];
      const editorId = editors.length > 0 ? editors[0].id : 3; // Default to user ID 3 if no editor found

      // Create notification for editor
      await connection.execute(
        `INSERT INTO notifications (
          user_id, type, title, message, 
          article_id, is_read, created_at
        ) VALUES (
          ?, 'review_submitted', 'Article Forwarded by Reviewer',
          ?, ?, FALSE, NOW()
        )`,
        [
          editorId,
          `Article "${article.title}" has been reviewed and forwarded with recommendation: ${recommendation.replace('_', ' ').toUpperCase()}. Reviewer comments: ${reviewerComments}`,
          articleId
        ]
      );

      // Log the forwarding action for archive purposes (using console for now)
      console.log(`ARCHIVE: Article "${article.title}" forwarded by reviewer with recommendation: ${recommendation}`);
      console.log(`Details: Author: ${article.author_name}, Comments: ${reviewerComments}, Editor Comments: ${editorComments || 'None'}`);

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: 'Article forwarded to editor successfully',
        article_title: article.title,
        forwarded_to_editor: editorId,
        recommendation: recommendation
      });

    } catch (error) {
      await connection.rollback();
      console.error('Database error:', error);
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error forwarding article:', error);
    return NextResponse.json(
      { error: `Failed to forward article: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// Get forwarded articles for editor
export async function GET(request: NextRequest) {
  try {
    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      // Get all articles that have been forwarded to editor (status = 'accepted')
      const [forwardedArticles] = await connection.execute(
        `SELECT 
          a.id as article_id,
          a.title as article_title,
          a.author_id,
          a.content,
          a.status as article_status,
          a.updated_at as forwarded_at,
          aa.reviewer_id,
          u.username as reviewer_name,
          au.username as author_name,
          'minor_revision' as recommendation,
          'Article reviewed and forwarded to editor' as reviewer_comments,
          '' as editor_comments,
          'pending' as response_status,
          NULL as editor_response,
          NULL as responded_at
        FROM articles a
        LEFT JOIN article_assignments aa ON a.id = aa.article_id
        LEFT JOIN users u ON aa.reviewer_id = u.id
        LEFT JOIN users au ON a.author_id = au.id
        WHERE a.status = 'accepted'
        ORDER BY a.updated_at DESC`
      );

      return NextResponse.json({
        success: true,
        forwarded_articles: forwardedArticles
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error fetching forwarded articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forwarded articles' },
      { status: 500 }
    );
  }
}
