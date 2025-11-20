import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

async function createNotification(userId: number, type: string, title: string, message: string, articleId: number, relatedUserId?: number) {
  const sql = `INSERT INTO notifications (user_id, type, title, message, article_id, related_user_id, action_url) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
  await query(sql, [userId, type, title, message, articleId, relatedUserId, `/dashboard/articles/${articleId}`]);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { action, from_user_id, to_user_id, comments, from_role, to_role } = body;
    const resolvedParams = await params;
    const articleId = parseInt(resolvedParams.id);

    let newStatus = '';
    let workflowAction = action;

    switch (action) {
      case 'submit':
        newStatus = 'submitted';
        workflowAction = 'submitted';
        break;
      case 'assign_assistant_editor':
        newStatus = 'under_review';
        workflowAction = 'assigned_to_assistant_editor';
        break;
      case 'send_to_peer_review':
        newStatus = 'with_editor';
        workflowAction = 'sent_to_peer_review';
        break;
      case 'approve':
        newStatus = 'with_editor';
        workflowAction = 'editor_approved';
        break;
      case 'publish':
        newStatus = 'published';
        workflowAction = 'published';
        break;
      case 'reject':
        newStatus = 'rejected';
        workflowAction = 'rejected';
        break;
      case 'request_revision':
        newStatus = 'draft';
        workflowAction = 'revision_requested';
        break;
    }

    // Update article status
    await query('UPDATE articles SET status = ?, updated_at = NOW() WHERE id = ?', [newStatus, articleId]);

    // Create workflow record
    const workflowSql = `INSERT INTO article_workflow (article_id, from_user_id, to_user_id, from_role, to_role, action, comments)
                         VALUES (?, ?, ?, ?, ?, ?, ?)`;
    await query(workflowSql, [articleId, from_user_id, to_user_id, from_role, to_role, workflowAction, comments]);

    // No auto-assignment - editors will manually send review requests for specific articles

    // Create assignment if needed
    if (to_user_id && ['assign_assistant_editor', 'send_to_peer_review'].includes(action)) {
      const assignSql = `INSERT INTO article_assignments (article_id, assigned_to, assigned_by, assignment_type, status)
                         VALUES (?, ?, ?, ?, 'pending')`;
      await query(assignSql, [articleId, to_user_id, from_user_id, action === 'send_to_peer_review' ? 'peer_review' : 'editorial_review']);
    }

    // Create notification for recipient
    if (to_user_id) {
      let notifType = 'article_assigned';
      let title = 'New Article Assigned';
      let message = `An article has been assigned to you for ${action === 'send_to_peer_review' ? 'peer review' : 'editorial review'}`;
      
      if (action === 'publish') {
        notifType = 'article_published';
        title = 'Article Published';
        message = 'Your article has been published';
      } else if (action === 'reject') {
        notifType = 'article_rejected';
        title = 'Article Rejected';
        message = 'Your article has been rejected';
      } else if (action === 'request_revision') {
        notifType = 'revision_requested';
        title = 'Revision Requested';
        message = 'Please revise your article based on feedback';
      }

      await createNotification(to_user_id, notifType, title, message, articleId, from_user_id);
    }

    return NextResponse.json({ success: true, newStatus });
  } catch (error) {
    console.error('Workflow error:', error);
    return NextResponse.json({ error: 'Workflow action failed' }, { status: 500 });
  }
}
