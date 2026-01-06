import { NextResponse } from 'next/server';
import { pagbQuery } from '@/lib/pagbDb';

export async function GET() {
  try {
    const issues = await pagbQuery<any[]>(
      `SELECT id, volume_number, issue_number, issue_year, issue_date
       FROM issues
       WHERE is_current_issue = 1
       LIMIT 1`
    );

    const issue = issues?.[0] || null;

    if (!issue) {
      return NextResponse.json({ issue: null, articles: [] });
    }

    // Articles are optional at this stage; return them only if your schema supports linking.
    let articles: any[] = [];
    try {
      const [cols] = await Promise.all([
        pagbQuery<any[]>(
          `SELECT COUNT(*) AS c
           FROM information_schema.columns
           WHERE table_schema = DATABASE() AND table_name = 'articles' AND column_name = 'issue_id'`
        ),
      ]);

      const hasIssueId = Number(cols?.[0]?.c || 0) > 0;
      if (hasIssueId) {
        articles = await pagbQuery<any[]>(
          `SELECT *
           FROM articles
           WHERE issue_id = ? AND status = 'published'
           ORDER BY published_at DESC, id DESC`,
          [issue.id]
        );
      }
    } catch {
      // best-effort
    }

    return NextResponse.json({ issue, articles: articles || [] });
  } catch (e: any) {
    return NextResponse.json(
      { issue: null, articles: [], error: e?.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}
