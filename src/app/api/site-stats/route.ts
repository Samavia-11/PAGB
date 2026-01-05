import { NextResponse } from 'next/server';
import { pagbQuery } from '@/lib/pagbDb';

export async function GET() {
  try {
    const issuesRow = await pagbQuery<any[]>(
      'SELECT COUNT(*) AS c FROM issues WHERE is_published = 1'
    );
    const issuesPublished = Number(issuesRow?.[0]?.c || 0);

    const articlesRow = await pagbQuery<any[]>(
      `SELECT COUNT(*) AS c
       FROM articles a
       JOIN issues i ON i.id = a.issue_id
       WHERE a.status = 'published' AND i.is_published = 1`
    );
    const publishedArticles = Number(articlesRow?.[0]?.c || 0);

    const authorsRow = await pagbQuery<any[]>(
      `SELECT COUNT(DISTINCT aa.author_id) AS c
       FROM article_authors aa
       JOIN articles a ON a.id = aa.article_id
       JOIN issues i ON i.id = a.issue_id
       WHERE a.status = 'published' AND i.is_published = 1`
    );
    const activeAuthors = Number(authorsRow?.[0]?.c || 0);

    return NextResponse.json({ 
      publishedArticles, 
      activeAuthors, 
      issuesPublished 
    });
  } catch (e: any) {
    return NextResponse.json({ 
      publishedArticles: 0, 
      activeAuthors: 0, 
      issuesPublished: 0, 
      error: e?.message || 'Unexpected error' 
    }, { status: 500 });
  }
}
