import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

function toInt(value: unknown) {
  const n = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : NaN;
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

export async function GET() {
  const connection = await getPool().getConnection();

  try {
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

    const [rows] = await connection.execute(
      `SELECT id, volume_number, issue_number, issue_year, issue_date, is_current_issue, is_published, created_at
       FROM issues
       ORDER BY issue_year DESC, volume_number DESC, issue_number DESC, id DESC`
    );

    return NextResponse.json({ issues: rows || [] });
  } catch (e: any) {
    return NextResponse.json({ issues: [], error: e?.message || 'Internal server error' }, { status: 500 });
  } finally {
    connection.release();
  }
}

async function ensureArticlesIssueLink(connection: any) {
  try {
    const [tables] = await connection.execute(
      `SELECT COUNT(*) AS c
         FROM information_schema.tables
         WHERE table_schema = DATABASE() AND table_name = 'articles'`
    );
    const hasArticlesTable = Number((tables as any)?.[0]?.c || 0) > 0;
    if (!hasArticlesTable) return;

    const [cols] = await connection.execute(
      `SELECT COUNT(*) AS c
       FROM information_schema.columns
       WHERE table_schema = DATABASE() AND table_name = 'articles' AND column_name = 'issue_id'`
    );
    const hasIssueId = Number((cols as any)?.[0]?.c || 0) > 0;
    if (!hasIssueId) {
      await connection.execute('ALTER TABLE articles ADD COLUMN issue_id INT NULL');
      await connection.execute('CREATE INDEX idx_articles_issue_id ON articles(issue_id)');
    }
  } catch {
    // Best-effort. If schema differs or permissions are limited, publishing an issue should still work.
  }
}

export async function POST(request: NextRequest) {
  const connection = await getPool().getConnection();

  try {
    const body = await request.json();

    const volumeNumber = toInt(body?.volume_number);
    const issueNumber = toInt(body?.issue_number);
    const issueDate = typeof body?.issue_date === 'string' ? body.issue_date : null;

    if (!volumeNumber || volumeNumber <= 0) {
      return NextResponse.json({ error: 'volume_number is required' }, { status: 400 });
    }

    if (!issueNumber || issueNumber <= 0) {
      return NextResponse.json({ error: 'issue_number is required' }, { status: 400 });
    }

    if (!issueDate || Number.isNaN(new Date(issueDate).getTime())) {
      return NextResponse.json({ error: 'issue_date is required' }, { status: 400 });
    }

    const issueYear = new Date(issueDate).getFullYear();

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

    await ensureArticlesIssueLink(connection);

    await connection.beginTransaction();

    await connection.execute('UPDATE issues SET is_current_issue = 0 WHERE is_current_issue = 1');

    const [insertResult] = await connection.execute(
      `INSERT INTO issues (volume_number, issue_number, issue_year, issue_date, is_current_issue, is_published)
       VALUES (?, ?, ?, ?, 1, 1)`,
      [volumeNumber, issueNumber, issueYear, issueDate]
    );

    await connection.commit();

    return NextResponse.json({
      message: 'Issue published successfully',
      issue: {
        id: (insertResult as any)?.insertId,
        volume_number: volumeNumber,
        issue_number: issueNumber,
        issue_year: issueYear,
        issue_date: issueDate,
        is_current_issue: true,
      },
    });
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
