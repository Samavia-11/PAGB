import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const sql = `
      SELECT 
        aa.article_id,
        aa.reviewer_id,
        aa.status,
        u.full_name as reviewer_name,
        a.title as article_title
      FROM article_assignments aa
      JOIN users u ON aa.reviewer_id = u.id
      JOIN articles a ON aa.article_id = a.id
      ORDER BY aa.assigned_at DESC
    `;
    
    const assignments = await query(sql, []);
    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { article_id, reviewer_id, assigned_by } = body;

    // Check if assignment already exists
    const existingAssignment = await query(
      'SELECT id FROM article_assignments WHERE article_id = ? AND assigned_to = ? AND assignment_type = "peer_review"',
      [article_id, reviewer_id]
    );

    if ((existingAssignment as any[]).length > 0) {
      return NextResponse.json({ error: 'Reviewer already assigned to this article' }, { status: 400 });
    }

    // Create new assignment
    const sql = `
      INSERT INTO article_assignments (article_id, assigned_to, assigned_by, assignment_type, status)
      VALUES (?, ?, ?, 'peer_review', 'pending')
    `;
    
    const result = await query(sql, [article_id, reviewer_id, assigned_by]);
    
    return NextResponse.json({ 
      success: true, 
      assignment_id: (result as any).insertId 
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
  }
}
