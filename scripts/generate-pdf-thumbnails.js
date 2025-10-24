/**
 * Script to generate thumbnail images from PDF first pages
 * Run with: node scripts/generate-pdf-thumbnails.js
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

// Configure PDF.js
const CMAP_URL = '../node_modules/pdfjs-dist/cmaps/';
const CMAP_PACKED = true;

const PDF_FOLDER = path.join(__dirname, '../public/pdfs');
const THUMBNAIL_FOLDER = path.join(__dirname, '../public/images/thumbnails');

// Create thumbnails folder if it doesn't exist
if (!fs.existsSync(THUMBNAIL_FOLDER)) {
  fs.mkdirSync(THUMBNAIL_FOLDER, { recursive: true });
}

// PDF files to process
const pdfFiles = [
  {
    filename: 'PAGB 2024 (1) ___Pakistan's National Security National Security Policies.pdf',
    outputName: 'article-1.jpg'
  },
  {
    filename: 'PAGB 2024 (2)___Afghan Refugees Afghan Refugees and The Principle of and The Principle of Non-Refoulement.pdf',
    outputName: 'article-2.jpg'
  },
  {
    filename: 'PAGB 2024 (4)___Pakistan-Afghanistan Relations Relations A Historical Perspective.pdf',
    outputName: 'article-4.jpg'
  },
  {
    filename: 'PAGB 2024 (5)___Modi's Neighbourhood First Policy Implications for Pakistan.pdf',
    outputName: 'article-5.jpg'
  },
  {
    filename: 'PAGB 2024 (6)___ Character of Future Character Military Conflict in Subcontinent.pdf',
    outputName: 'article-6.jpg'
  },
  {
    filename: 'PAGB 2024 (7)___Unravelling the Intriguing Nexus Socially Disruptive Proxies  and Security Milieu of Pakistan.pdf',
    outputName: 'article-7.jpg'
  }
];

async function generateThumbnail(pdfPath, outputPath) {
  try {
    console.log(`Processing: ${path.basename(pdfPath)}`);
    
    // Load PDF
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const loadingTask = pdfjsLib.getDocument({
      data,
      cMapUrl: CMAP_URL,
      cMapPacked: CMAP_PACKED,
    });
    
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1); // Get first page
    
    // Set thumbnail dimensions
    const viewport = page.getViewport({ scale: 0.5 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');
    
    // Render PDF page to canvas
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
    
    // Save as JPEG
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.85 });
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`✓ Generated: ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`✗ Error processing ${path.basename(pdfPath)}:`, error.message);
  }
}

async function generateAllThumbnails() {
  console.log('Starting PDF thumbnail generation...\n');
  
  for (const file of pdfFiles) {
    const pdfPath = path.join(PDF_FOLDER, file.filename);
    const outputPath = path.join(THUMBNAIL_FOLDER, file.outputName);
    
    if (fs.existsSync(pdfPath)) {
      await generateThumbnail(pdfPath, outputPath);
    } else {
      console.error(`✗ PDF not found: ${file.filename}`);
    }
  }
  
  console.log('\n✓ Thumbnail generation complete!');
  console.log(`Thumbnails saved to: ${THUMBNAIL_FOLDER}`);
}

// Run the script
generateAllThumbnails().catch(console.error);
