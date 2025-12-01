import fs from 'fs';
import path from 'path';

export interface Policy {
  slug: string;
  title: string;
  content: string;
}

const POLICIES_MD_PATH = path.join(process.cwd(), 'PAGB_POLICIES.md');

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function getAllPolicies(): Policy[] {
  const raw = fs.readFileSync(POLICIES_MD_PATH, 'utf8');

  type Section = { title: string; start: number };
  const sections: Section[] = [];
  const seenTitles = new Set<string>();

  const headingRegex = /^(#+)\s+(.+)$|^\*\*(.+?)\*\*$/gm;
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(raw)) !== null) {
    const hTitle = match[2] || match[3] || '';
    const index = match.index;

    if (!hTitle.trim()) continue;

    const normalized = hTitle
      .replace(/^\*+/, '')
      .replace(/\*+$/, '')
      .replace(/\s*[:：]\s*$/, '')
      .trim();

    const key = normalized.toUpperCase();

    const importantTitles = new Set([
      'PUBLICATION POLICY',
      'EDITORIAL POLICY',
      'PEER REVIEW POLICY',
      'OPEN ACCESS JOURNAL POLICY',
      'PLAGIARISM POLICY',
      'COMPLAINT POLICY',
      'REPOSITORY POLICY',
    ]);

    if (!importantTitles.has(key)) continue;

    if (seenTitles.has(key)) continue;
    seenTitles.add(key);

    const displayTitleMap: Record<string, string> = {
      'PUBLICATION POLICY': 'Publication Policy',
      'EDITORIAL POLICY': 'Editorial Policy',
      'PEER REVIEW POLICY': 'Peer Review Policy',
      'OPEN ACCESS JOURNAL POLICY': 'Open Access Journal Policy',
      'PLAGIARISM POLICY': 'Plagiarism Policy',
      'COMPLAINT POLICY': 'Complaint Policy',
      'REPOSITORY POLICY': 'Repository Policy',
    };

    const displayTitle = displayTitleMap[key] ?? normalized;

    sections.push({ title: displayTitle, start: index });
  }

  sections.sort((a, b) => a.start - b.start);

  const policies: Policy[] = [];
  const slugCounts: Record<string, number> = {};

  for (let i = 0; i < sections.length; i++) {
    const current = sections[i];
    const next = sections[i + 1];
    const content = raw.slice(current.start, next ? next.start : raw.length).trim();

    const baseSlug = slugify(current.title);
    const count = (slugCounts[baseSlug] || 0) + 1;
    slugCounts[baseSlug] = count;
    const finalSlug = count === 1 ? baseSlug : `${baseSlug}-${count}`;

    policies.push({
      slug: finalSlug,
      title: current.title,
      content,
    });
  }

  return policies;
}

export function getPolicyBySlug(slug: string): Policy | null {
  const all = getAllPolicies();
  return all.find((p) => p.slug === slug) || null;
}
