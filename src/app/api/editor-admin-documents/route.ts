import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import mysql from 'mysql2/promise';

function requireRole(request: NextRequest, roles: string[]) {
  const role = request.headers.get('x-user-role');
  const userId = request.headers.get('x-user-id');
  if (!userId || !role || !roles.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const forbidden = requireRole(request, ['editor', 'administrator']);
  if (forbidden) return forbidden;

  let connection: mysql.Connection | null = null;

  try {
    const { searchParams } = new URL(request.url);
    const editorIdParam = searchParams.get('editorId');
    const adminIdParam = searchParams.get('adminId');

    const authUserId = request.headers.get('x-user-id');
    const authUserRole = request.headers.get('x-user-role');

    if (authUserRole === 'administrator') {
      if (adminIdParam && adminIdParam !== authUserId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    if (authUserRole === 'editor') {
      if (editorIdParam && editorIdParam !== authUserId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    connection = await getDatabase();

    let query = `
      SELECT ead.*, 
             e.full_name as editor_name,
             ad.full_name as admin_name,
             r.full_name as reviewer_name,
             au.full_name as author_name,
             au.email as author_email,
             au.phone as author_phone,
             aa.title as article_title,
             aa.abstract as article_abstract,
             aa.status as article_status,
             aa.manuscript_file_name as manuscript_file_name,
             aa.manuscript_file_path as manuscript_file_path
      FROM editor_admin_documents ead
      LEFT JOIN users e ON ead.editor_id = e.id
      LEFT JOIN users ad ON ead.admin_id = ad.id
      LEFT JOIN reviewer_forwarded_documents rfd ON ead.reviewer_forward_id = rfd.id
      LEFT JOIN users r ON rfd.reviewer_id = r.id
      LEFT JOIN authors_articles aa ON ead.article_id = aa.id
      LEFT JOIN users au ON aa.author_id = au.id
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    const editorId = authUserRole === 'editor' ? (editorIdParam || authUserId) : editorIdParam;
    const adminId = authUserRole === 'administrator' ? (adminIdParam || authUserId) : adminIdParam;

    if (editorId) {
      conditions.push('ead.editor_id = ?');
      params.push(Number(editorId));
    }

    if (adminId) {
      conditions.push('ead.admin_id = ?');
      params.push(Number(adminId));
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY ead.created_at DESC';

    const [rows] = (await connection.execute(query, params)) as [any[], any];
    return NextResponse.json({ items: rows });
  } catch (error) {
    console.error('Get editor_admin_documents error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const forbidden = requireRole(request, ['editor']);
  if (forbidden) return forbidden;

  let connection: mysql.Connection | null = null;

  try {
    const authUserId = request.headers.get('x-user-id');
    if (!authUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reviewerForwardId, adminId, comment } = body as {
      reviewerForwardId?: number;
      adminId?: number;
      comment?: string;
    };

    if (!reviewerForwardId) {
      return NextResponse.json({ error: 'Missing required fields: reviewerForwardId' }, { status: 400 });
    }

    connection = await getDatabase();

    // Find admin if not provided
    let finalAdminId = adminId ? Number(adminId) : null;
    if (!finalAdminId) {
      const [admins] = (await connection.execute('SELECT id FROM users WHERE role = "administrator" ORDER BY id ASC LIMIT 1')) as [any[], any];
      const first = admins?.[0];
      if (!first?.id) {
        return NextResponse.json({ error: 'No administrator user found' }, { status: 400 });
      }
      finalAdminId = Number(first.id);
    }

    const [rfdRows] = (await connection.execute(
      `SELECT rfd.*
       FROM reviewer_forwarded_documents rfd
       WHERE rfd.id = ?`,
      [Number(reviewerForwardId)]
    )) as [any[], any];

    const rfd = rfdRows[0];
    if (!rfd) {
      return NextResponse.json({ error: 'Forwarded document not found' }, { status: 404 });
    }

    // Only owning editor can forward to admin
    if (String(rfd.editor_id) !== String(authUserId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Ensure admin user exists
    const [adminRows] = (await connection.execute('SELECT id FROM users WHERE id = ? AND role = "administrator"', [finalAdminId])) as [any[], any];
    if (!adminRows?.[0]?.id) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 400 });
    }

    const [result] = (await connection.execute(
      `INSERT INTO editor_admin_documents
       (reviewer_forward_id, article_id, editor_id, admin_id, comment,
        attachment_name, attachment_path, attachment_type, attachment_size)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(reviewerForwardId),
        Number(rfd.article_id),
        Number(authUserId),
        finalAdminId,
        (comment || '').trim() || null,
        rfd.attachment_name || null,
        rfd.attachment_path || null,
        rfd.attachment_type || null,
        rfd.attachment_size || null,
      ]
    )) as [any, any];

    const [rows] = (await connection.execute(
      `SELECT ead.*, e.full_name as editor_name, ad.full_name as admin_name
       FROM editor_admin_documents ead
       LEFT JOIN users e ON ead.editor_id = e.id
       LEFT JOIN users ad ON ead.admin_id = ad.id
       WHERE ead.id = ?`,
      [result.insertId]
    )) as [any[], any];

    return NextResponse.json({ item: rows[0] });
  } catch (error) {
    console.error('Create editor_admin_documents error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
