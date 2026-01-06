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

export async function GET() {
  let connection: mysql.Connection | null = null;

  try {
    connection = await getDatabase();
    const [items] = (await connection.execute(
      `SELECT id, section, title, name, affiliation, sort_order
       FROM editorial_board_items
       ORDER BY section ASC, sort_order ASC, id ASC`
    )) as [any[], any];

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Get editorial board error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const forbidden = requireAdmin(request);
  if (forbidden) return forbidden;

  let connection: mysql.Connection | null = null;

  try {
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

    const [maxRows] = (await connection.execute(
      'SELECT COALESCE(MAX(sort_order), -1) AS maxSort FROM editorial_board_items WHERE section = ?',
      [section]
    )) as [any[], any];

    const nextSort = (maxRows?.[0]?.maxSort ?? -1) + 1;

    const [result] = (await connection.execute(
      `INSERT INTO editorial_board_items (section, title, name, affiliation, sort_order)
       VALUES (?, ?, ?, ?, ?)`,
      [section, validated.title || null, validated.name, validated.affiliation || null, nextSort]
    )) as [any, any];

    const [created] = (await connection.execute(
      `SELECT id, section, title, name, affiliation, sort_order
       FROM editorial_board_items
       WHERE id = ?`,
      [result.insertId]
    )) as [any[], any];

    return NextResponse.json({ item: created[0] }, { status: 201 });
  } catch (error) {
    console.error('Create editorial board item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
