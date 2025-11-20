import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Static list of PDFs since Edge Runtime can't access filesystem
const PDF_CATALOG = {
  '2024': [
    'PAGB_2024_Article_1.pdf',
    'PAGB_2024_Article_2.pdf',
    'PAGB_2024_Article_3.pdf',
    // Add more 2024 PDFs as needed
  ],
  '2021': [
    'PAGB_2021_Article_1.pdf',
    'PAGB_2021_Article_2.pdf',
    // Add more 2021 PDFs as needed
  ]
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || '2024';

    const pdfList = PDF_CATALOG[folder as keyof typeof PDF_CATALOG] || [];

    const pdfs = pdfList.map((filename) => {
      const title = filename.replace(/\.pdf$/i, '');
      const url = `/pdfs/${encodeURIComponent(folder)}/${encodeURIComponent(filename)}`;
      return {
        title,
        author: 'Various Contributors',
        date: folder,
        description: '',
        published: folder,
        pdfUrl: url,
        thumbnail: '/images/thumbnails/article-generic.jpg',
      };
    });

    return NextResponse.json({ files: pdfs });
  } catch (e: any) {
    return NextResponse.json({ files: [], error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
