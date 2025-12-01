import { NextResponse } from 'next/server';
import { getAllPolicies } from '@/lib/policies';

export async function GET() {
  const policies = getAllPolicies().map((p) => ({ slug: p.slug, title: p.title }));
  return NextResponse.json({ policies });
}
