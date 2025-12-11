import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isValidId, isValidRole, escapeHtml } from '@/lib/security';

// Valid article statuses
const VALID_STATUSES = ['draft', 'submitted', 'under_review', 'with_editor', 'accepted', 'rejected', 'published'];

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get('status');
  const role = request.headers.get('x-user-role');
  const userId = request.headers.get('x-user-id');

  try {
    // Validate status parameter if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status parameter' }, { status: 400 });
    }

    let sql = `SELECT a.*, u.full_name as author_name 
               FROM articles a 
               JOIN users u ON a.author_id = u.id`;
    const params: any[] = [];

    if (status) {
      sql += ' WHERE a.status = ?';
      params.push(status);
    } else if (role === 'author' && userId) {
      sql += ' WHERE a.author_id = ?';
      params.push(userId);
    } else if (role === 'reviewer' && userId) {
      // Reviewers only see articles specifically assigned to them
      sql = `SELECT a.*, u.full_name as author_name 
             FROM articles a 
             JOIN users u ON a.author_id = u.id
             JOIN article_assignments aa ON a.id = aa.article_id
             WHERE aa.reviewer_id = ? AND aa.status = 'assigned'`;
      params.push(userId);
    }

    sql += ' ORDER BY a.created_at DESC LIMIT 100'; // Add limit to prevent large responses
    
    const articles = await query(sql, params);
    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from middleware
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId || !userRole) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only authors can create articles
    if (userRole !== 'author' && userRole !== 'editor' && userRole !== 'administrator') {
      return NextResponse.json({ error: 'Only authors can create articles' }, { status: 403 });
    }

    const body = await request.json();
    const { title, content } = body;

    // Validate required fields
    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Validate title length
    if (title.length < 5 || title.length > 500) {
      return NextResponse.json({ error: 'Title must be between 5 and 500 characters' }, { status: 400 });
    }

    // Use the authenticated user's ID as author
    const authorId = parseInt(userId);

    const sql = `INSERT INTO articles (title, content, author_id, status, created_at) VALUES (?, ?, ?, 'draft', NOW())`;
    const result: any = await query(sql, [title, content || '', authorId]);
    
    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
