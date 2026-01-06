import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import mysql from 'mysql2/promise';

type EditorialBoardSection =
  | 'executive_leadership'
  | 'editorial_team_editor'
  | 'editorial_team_sub_editor'
  | 'advisory_board'
  | 'peer_review_committee';

function isSection(value: any): value is EditorialBoardSection {
  return (
    value === 'executive_leadership' ||
    value === 'editorial_team_editor' ||
    value === 'editorial_team_sub_editor' ||
    value === 'advisory_board' ||
    value === 'peer_review_committee'
  );
}

function requireAdmin(request: NextRequest) {
  const role = request.headers.get('x-user-role');
  const userId = request.headers.get('x-user-id');
  if (!userId || role !== 'administrator') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

function validatePayload(section: EditorialBoardSection, body: any) {
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const affiliation = typeof body?.affiliation === 'string' ? body.affiliation.trim() : '';

  if (section === 'executive_leadership') {
    if (!title || !name) {
      return { ok: false as const, error: 'Missing required fields: title, name' };
    }
    return { ok: true as const, title, name, affiliation: affiliation || null };
  }

  if (section === 'editorial_team_editor') {
    if (!title || !name) {
      return { ok: false as const, error: 'Missing required fields: title, name' };
    }
    return { ok: true as const, title, name, affiliation: null as string | null };
  }

  if (section === 'editorial_team_sub_editor') {
    if (!name) {
      return { ok: false as const, error: 'Missing required fields: name' };
    }
    return { ok: true as const, title: title || null, name, affiliation: null as string | null };
  }

  if (section === 'advisory_board' || section === 'peer_review_committee') {
    if (!name) {
      return { ok: false as const, error: 'Missing required fields: name' };
    }
    return { ok: true as const, title: title || null, name, affiliation: null as string | null };
  }

  if (!name || !title) {
    return { ok: false as const, error: 'Missing required fields: name, title' };
  }

  return { ok: true as const, title, name, affiliation: null as string | null };
}

function parseId(params: { id: string }) {
  const id = Number(params.id);
  if (!id || Number.isNaN(id) || id <= 0) return null;
  return id;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const forbidden = requireAdmin(request);
  if (forbidden) return forbidden;

  let connection: mysql.Connection | null = null;

  try {
    const resolvedParams = await params;
    const id = parseId(resolvedParams);
    if (!id) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const body = await request.json();
    const section = body?.section;

    if (!isSection(section)) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }

    const validated = validatePayload(section, body);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    connection = await getDatabase();

    const [result] = (await connection.execute(
      `UPDATE editorial_board_items
       SET section = ?, title = ?, name = ?, affiliation = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [section, validated.title || null, validated.name, validated.affiliation || null, id]
    )) as [any, any];

    if (!result?.affectedRows) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const [items] = (await connection.execute(
      `SELECT id, section, title, name, affiliation, sort_order
       FROM editorial_board_items
       WHERE id = ?`,
      [id]
    )) as [any[], any];

    return NextResponse.json({ item: items[0] });
  } catch (error) {
    console.error('Update editorial board item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const forbidden = requireAdmin(request);
  if (forbidden) return forbidden;

  let connection: mysql.Connection | null = null;

  try {
    const resolvedParams = await params;
    const id = parseId(resolvedParams);
    if (!id) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    connection = await getDatabase();

    const [result] = (await connection.execute('DELETE FROM editorial_board_items WHERE id = ?', [id])) as [any, any];

    if (!result?.affectedRows) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete editorial board item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
