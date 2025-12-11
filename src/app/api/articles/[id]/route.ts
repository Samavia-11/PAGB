import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { canModifyArticle, canDeleteArticle, isValidId } from '@/lib/security';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const sql = `SELECT a.*, u.full_name as author_name 
                 FROM articles a 
                 JOIN users u ON a.author_id = u.id 
                 WHERE a.id = ?`;
    const rows: any = await query(sql, [id]);
    if (!rows || rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ article: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    // Validate article ID
    if (!isValidId(id)) {
      return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 });
    }

    // Get user info from headers (should be set by auth middleware)
    const userId = parseInt(request.headers.get('x-user-id') || '0');
    const userRole = request.headers.get('x-user-role') || '';

    if (!userId || !userRole) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get article to check ownership
    const articleResult: any = await query('SELECT author_id FROM articles WHERE id = ?', [id]);
    if (!articleResult || articleResult.length === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Check authorization
    if (!canModifyArticle(userRole, userId, articleResult[0].author_id)) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to modify this article' }, { status: 403 });
    }

    const body = await request.json();
    const { title, content } = body;
    
    // Validate input
    if (!title || title.length > 500) {
      return NextResponse.json({ error: 'Title is required and must be less than 500 characters' }, { status: 400 });
    }

    await query('UPDATE articles SET title = ?, content = ?, updated_at = NOW() WHERE id = ?', [title, content, id]);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Error updating article:', e);
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    // Validate article ID
    if (!isValidId(id)) {
      return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 });
    }

    // Get user info from headers (should be set by auth middleware)
    const userId = parseInt(request.headers.get('x-user-id') || '0');
    const userRole = request.headers.get('x-user-role') || '';

    if (!userId || !userRole) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get article to check ownership and status
    const articleResult: any = await query('SELECT author_id, status FROM articles WHERE id = ?', [id]);
    if (!articleResult || articleResult.length === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const article = articleResult[0];

    // Check authorization
    if (!canDeleteArticle(userRole, userId, article.author_id)) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to delete this article' }, { status: 403 });
    }

    // Authors can only delete draft articles
    if (userRole === 'author' && article.status !== 'draft') {
      return NextResponse.json({ error: 'Authors can only delete draft articles' }, { status: 403 });
    }

    await query('DELETE FROM articles WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Error deleting article:', e);
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
