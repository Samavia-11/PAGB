import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isValidId, escapeHtml } from '@/lib/security';

// Valid workflow actions
const VALID_ACTIONS = ['submit', 'assign_assistant_editor', 'send_to_peer_review', 'approve', 'publish', 'reject', 'request_revision'];

async function createNotification(userId: number, type: string, title: string, message: string, articleId: number, relatedUserId?: number) {
  // Sanitize message content
  const safeMessage = escapeHtml(message);
  const sql = `INSERT INTO notifications (user_id, type, title, message, article_id, related_user_id, action_url) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
  await query(sql, [userId, type, title, safeMessage, articleId, relatedUserId, `/dashboard/articles/${articleId}`]);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Get authenticated user from middleware
    const authUserId = request.headers.get('x-user-id');
    const authUserRole = request.headers.get('x-user-role');

    if (!authUserId || !authUserRole) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only editors and administrators can perform workflow actions
    if (authUserRole !== 'editor' && authUserRole !== 'administrator' && authUserRole !== 'author') {
      return NextResponse.json({ error: 'Insufficient permissions for workflow actions' }, { status: 403 });
    }

    const body = await request.json();
    const { action, to_user_id, comments, to_role } = body;
    const resolvedParams = await params;
    const articleId = parseInt(resolvedParams.id);

    // Validate article ID
    if (!isValidId(articleId)) {
      return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 });
    }

    // Validate action
    if (!action || !VALID_ACTIONS.includes(action)) {
      return NextResponse.json({ error: 'Invalid workflow action' }, { status: 400 });
    }

    // Authors can only submit their own articles
    if (authUserRole === 'author' && action !== 'submit') {
      return NextResponse.json({ error: 'Authors can only submit articles' }, { status: 403 });
    }

    // Use authenticated user info
    const from_user_id = parseInt(authUserId);
    const from_role = authUserRole;

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
