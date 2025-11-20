import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Static stats since Edge Runtime can't access filesystem
const SITE_STATS = {
  publishedArticles: 45,  // Update this with your actual count
  activeAuthors: 28,      // Update this with your actual count  
  issuesPublished: 3      // Update this with your actual count (2021, 2024, etc.)
};

export async function GET() {
  try {
    return NextResponse.json(SITE_STATS);
  } catch (e: any) {
    return NextResponse.json({ 
      publishedArticles: 0, 
      activeAuthors: 0, 
      issuesPublished: 0, 
      error: e?.message || 'Unexpected error' 
    }, { status: 500 });
  }
}
