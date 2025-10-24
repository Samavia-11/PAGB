# PDF Thumbnails Generation Guide

## Quick Method (5 minutes)

### Using Online Tool:
1. Go to https://pdf2png.com/
2. Upload each PDF
3. Download first page as JPG
4. Save to: `D:\PAGB-1\public\images\thumbnails\`

### File Names:
- PAGB 2024 (1).pdf → article-1.jpg
- PAGB 2024 (2).pdf → article-2.jpg
- PAGB 2024 (4).pdf → article-4.jpg
- PAGB 2024 (5).pdf → article-5.jpg
- PAGB 2024 (6).pdf → article-6.jpg
- PAGB 2024 (7).pdf → article-7.jpg

## Alternative: Use Script
```bash
npm install pdfjs-dist canvas
node scripts/generate-pdf-thumbnails.js
```

Thumbnails will be auto-generated!
