import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

function toInt(value: unknown) {
  const n = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : NaN;
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

async function ensureIssuesTable(connection: any) {
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS issues (
      id INT PRIMARY KEY AUTO_INCREMENT,
      volume_number INT NOT NULL,
      issue_number INT NOT NULL,
      issue_year INT NOT NULL,
      issue_date DATE NOT NULL,
      is_current_issue TINYINT(1) NOT NULL DEFAULT 0,
      is_published TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_is_current_issue (is_current_issue),
      INDEX idx_issue_year (issue_year)
    )
  `);
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const issueId = toInt(id);

  if (!issueId) {
    return NextResponse.json({ error: 'Invalid issue id' }, { status: 400 });
  }

  const connection = await getPool().getConnection();
  try {
    await ensureIssuesTable(connection);
    const [rows] = await connection.execute(
      `SELECT id, volume_number, issue_number, issue_year, issue_date, is_current_issue, is_published, created_at
       FROM issues
       WHERE id = ?
       LIMIT 1`,
      [issueId]
    );

    const issue = (rows as any[])?.[0] || null;
    if (!issue) return NextResponse.json({ error: 'Issue not found' }, { status: 404 });

    return NextResponse.json({ issue });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 });
  } finally {
    connection.release();
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const issueId = toInt(id);

  if (!issueId) {
    return NextResponse.json({ error: 'Invalid issue id' }, { status: 400 });
  }

  const connection = await getPool().getConnection();
  try {
    await ensureIssuesTable(connection);

    const body = await request.json();

    const volumeNumber = body?.volume_number !== undefined ? toInt(body.volume_number) : null;
    const issueNumber = body?.issue_number !== undefined ? toInt(body.issue_number) : null;
    const issueDate = body?.issue_date !== undefined ? (typeof body.issue_date === 'string' ? body.issue_date : null) : null;
    const setCurrent = body?.is_current_issue === true;

    if (issueDate !== null && Number.isNaN(new Date(issueDate).getTime())) {
      return NextResponse.json({ error: 'issue_date is invalid' }, { status: 400 });
    }

    const issueYear = issueDate ? new Date(issueDate).getFullYear() : null;

    const updates: string[] = [];
    const params: any[] = [];

    if (volumeNumber !== null) {
      if (!volumeNumber || volumeNumber <= 0) return NextResponse.json({ error: 'volume_number is invalid' }, { status: 400 });
      updates.push('volume_number = ?');
      params.push(volumeNumber);
    }

    if (issueNumber !== null) {
      if (!issueNumber || issueNumber <= 0) return NextResponse.json({ error: 'issue_number is invalid' }, { status: 400 });
      updates.push('issue_number = ?');
      params.push(issueNumber);
    }

    if (issueDate !== null) {
      updates.push('issue_date = ?');
      params.push(issueDate);
      if (issueYear !== null) {
        updates.push('issue_year = ?');
        params.push(issueYear);
      }
    }

    if (setCurrent) {
      updates.push('is_current_issue = 1');
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    await connection.beginTransaction();

    if (setCurrent) {
      await connection.execute('UPDATE issues SET is_current_issue = 0 WHERE is_current_issue = 1');
    }

    const [result] = await connection.execute(
      `UPDATE issues SET ${updates.join(', ')} WHERE id = ?`,
      [...params, issueId]
    );

    if ((result as any).affectedRows === 0) {
      await connection.rollback();
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    await connection.commit();

    const [rows] = await connection.execute(
      `SELECT id, volume_number, issue_number, issue_year, issue_date, is_current_issue, is_published, created_at
       FROM issues
       WHERE id = ?
       LIMIT 1`,
      [issueId]
    );

    return NextResponse.json({ issue: (rows as any[])?.[0] || null });
  } catch (e: any) {
    try {
      await connection.rollback();
    } catch {
      // ignore
    }
    return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 });
  } finally {
    connection.release();
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const issueId = toInt(id);

  if (!issueId) {
    return NextResponse.json({ error: 'Invalid issue id' }, { status: 400 });
  }

  const connection = await getPool().getConnection();
  try {
    await ensureIssuesTable(connection);

    await connection.beginTransaction();

    const [currentRows] = await connection.execute(
      'SELECT id, is_current_issue FROM issues WHERE id = ? LIMIT 1',
      [issueId]
    );
    const target = (currentRows as any[])?.[0];
    if (!target) {
      await connection.rollback();
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const wasCurrent = Number(target.is_current_issue) === 1;

    await connection.execute('DELETE FROM issues WHERE id = ?', [issueId]);

    if (wasCurrent) {
      const [latest] = await connection.execute(
        `SELECT id
         FROM issues
         ORDER BY issue_year DESC, volume_number DESC, issue_number DESC, id DESC
         LIMIT 1`
      );
      const nextId = (latest as any[])?.[0]?.id;
      if (nextId) {
        await connection.execute('UPDATE issues SET is_current_issue = 0 WHERE is_current_issue = 1');
        await connection.execute('UPDATE issues SET is_current_issue = 1 WHERE id = ?', [nextId]);
      }
    }

    await connection.commit();

    return NextResponse.json({ message: 'Issue deleted' });
  } catch (e: any) {
    try {
      await connection.rollback();
    } catch {
      // ignore
    }
    return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 });
  } finally {
    connection.release();
  }
}
