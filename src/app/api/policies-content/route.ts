import { NextRequest, NextResponse } from 'next/server';
import { getPolicyBySlug } from '@/lib/policies';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  const policy = getPolicyBySlug(slug);

  if (!policy) {
    return NextResponse.json({ policy: null }, { status: 404 });
  }

  return NextResponse.json({ policy });
}
