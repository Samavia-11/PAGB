import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const articleId = parseInt(params.id);
  let from_user_id, from_role, comments;
  
  try {
    console.log('Comments API called for article:', articleId);
    
    const body = await request.json();
    ({ from_user_id, from_role, comments } = body);
    
    console.log('Request body:', { from_user_id, from_role, comments: comments?.substring(0, 50) });

    if (!from_user_id || !from_role || !comments) {
      console.log('Missing required fields:', { from_user_id, from_role, comments: !!comments });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get article details to find the author
    console.log('Fetching article with ID:', articleId);
    const articleQuery = 'SELECT * FROM articles WHERE id = ?';
    const articleResult = await query(articleQuery, [articleId]) as any[];
    
    console.log('Article query result:', articleResult.length > 0 ? 'Found' : 'Not found');
    
    if (articleResult.length === 0) {
      console.log('Article not found for ID:', articleId);
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    const article = articleResult[0];
    console.log('Article found:', { id: article.id, title: article.title, author_id: article.author_id });

    // Get author details
    console.log('Fetching author with ID:', article.author_id);
    const authorQuery = 'SELECT * FROM users WHERE id = ?';
    const authorResult = await query(authorQuery, [article.author_id]) as any[];
    
    console.log('Author query result:', authorResult.length > 0 ? 'Found' : 'Not found');
    
    if (authorResult.length === 0) {
      console.log('Author not found for ID:', article.author_id);
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      );
    }

    const author = authorResult[0];
    console.log('Author found:', { id: author.id, name: author.full_name || author.username });

    // Create notification for the author - try the simplest possible insert
    console.log('Creating notification for author...');
    
    const notificationTitle = `Editor Comments on "${article.title}"`;
    const notificationMessage = `The editor has sent you comments regarding your article: ${comments}`;
    
    // Use the exact same pattern as the existing notifications API
    const sql = `INSERT INTO notifications (user_id, type, title, message, article_id, related_user_id, action_url) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    await query(sql, [
      author.id,
      'comment_added',
      notificationTitle,
      notificationMessage,
      articleId,
      from_user_id,
      `/author/articles/${articleId}`
    ]);
    
    console.log('Notification created successfully');

    return NextResponse.json({
      success: true,
      message: 'Comments sent to author successfully'
    });

  } catch (error) {
    console.error('Error sending comments:', error);
    console.error('Error details:', {
      articleId,
      from_user_id,
      from_role,
      comments: comments?.substring(0, 50) + '...',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
