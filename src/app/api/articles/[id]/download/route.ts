import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const articleId = resolvedParams.id;

    // Get article details
    const articleResult: any = await query(
      'SELECT a.*, u.full_name as author_name FROM articles a JOIN users u ON a.author_id = u.id WHERE a.id = ?',
      [articleId]
    );

    if (!articleResult || articleResult.length === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const article = articleResult[0];
    
    // Parse the article content
    let parsedContent;
    try {
      parsedContent = JSON.parse(article.content);
    } catch (error) {
      parsedContent = { manuscript: { content: article.content } };
    }

    // Create HTML content for PDF generation
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${article.title}</title>
        <style>
          body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            margin: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #2d5a2d;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .journal-name {
            font-size: 18px;
            font-weight: bold;
            color: #2d5a2d;
            margin-bottom: 10px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
          }
          .authors {
            text-align: center;
            font-style: italic;
            margin-bottom: 20px;
          }
          .section {
            margin: 20px 0;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            margin: 15px 0 10px 0;
            color: #2d5a2d;
          }
          .abstract {
            background-color: #f9f9f9;
            padding: 15px;
            border-left: 4px solid #2d5a2d;
            margin: 20px 0;
          }
          .keywords {
            font-style: italic;
            margin: 10px 0;
          }
          .metadata {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-top: 30px;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="journal-name">Pakistan Army Green Book (PAGB)</div>
          <div>Academic Journal for Military Research and Strategic Analysis</div>
        </div>
        
        <h1 class="title">${article.title}</h1>
        
        <div class="authors">
          <strong>Author:</strong> ${article.author_name}
        </div>
        
        ${parsedContent.manuscript?.abstract && parsedContent.manuscript.abstract !== 'nnn' ? `
        <div class="section">
          <div class="section-title">Abstract</div>
          <div class="abstract">
            ${parsedContent.manuscript.abstract}
          </div>
        </div>
        ` : ''}
        
        ${parsedContent.manuscript?.keywords && parsedContent.manuscript.keywords.length > 0 ? `
        <div class="section">
          <div class="section-title">Keywords</div>
          <div class="keywords">
            ${parsedContent.manuscript.keywords.join(', ')}
          </div>
        </div>
        ` : ''}
        
        ${parsedContent.manuscript?.articleType ? `
        <div class="section">
          <div class="section-title">Article Type</div>
          <div>${parsedContent.manuscript.articleType.replace('_', ' ').toUpperCase()}</div>
        </div>
        ` : ''}
        
        ${parsedContent.manuscript?.content ? `
        <div class="section">
          <div class="section-title">Content</div>
          <div>${parsedContent.manuscript.content}</div>
        </div>
        ` : ''}
        
        ${parsedContent.authors && parsedContent.authors.length > 0 ? `
        <div class="section">
          <div class="section-title">Author Information</div>
          ${parsedContent.authors.map((author: any) => `
            <div style="margin-bottom: 10px;">
              <strong>${author.name}</strong><br>
              ${author.affiliation || 'No affiliation provided'}<br>
              ${author.email || 'No email provided'}
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        <div class="metadata">
          <div><strong>Submission Date:</strong> ${new Date(article.created_at).toLocaleDateString()}</div>
          <div><strong>Status:</strong> ${article.status.replace('_', ' ').toUpperCase()}</div>
          <div><strong>Article ID:</strong> ${article.id}</div>
          <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
        </div>
      </body>
      </html>
    `;

    // For now, return the HTML content as a downloadable file
    // In a production environment, you would use a library like Puppeteer to generate actual PDF
    const response = new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${article.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html"`,
      },
    });

    return response;

  } catch (error) {
    console.error('Error generating article download:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
