# 📸 How to Add PDF Thumbnails to Your Articles

## ✅ What Was Done

I've updated your page to use **unique thumbnails** for each article. The thumbnails will show the **first page of each PDF** once you generate them.

---

## 🎯 Two Methods to Generate Thumbnails

### **Method 1: Quick Online Method** ⚡ (5 minutes)

#### **Step 1: Go to PDF to Image Converter**
Visit: https://www.ilovepdf.com/pdf_to_jpg

#### **Step 2: Convert Each PDF**
Upload and convert these 6 PDFs (one at a time):

1. **PAGB 2024 (1) ___Pakistan's National Security National Security Policies.pdf**
   - Save as: `article-1.jpg`

2. **PAGB 2024 (2)___Afghan Refugees Afghan Refugees and The Principle of and The Principle of Non-Refoulement.pdf**
   - Save as: `article-2.jpg`

3. **PAGB 2024 (4)___Pakistan-Afghanistan Relations Relations A Historical Perspective.pdf**
   - Save as: `article-4.jpg`

4. **PAGB 2024 (5)___Modi's Neighbourhood First Policy Implications for Pakistan.pdf**
   - Save as: `article-5.jpg`

5. **PAGB 2024 (6)___ Character of Future Character Military Conflict in Subcontinent.pdf**
   - Save as: `article-6.jpg`

6. **PAGB 2024 (7)___Unravelling the Intriguing Nexus Socially Disruptive Proxies  and Security Milieu of Pakistan.pdf**
   - Save as: `article-7.jpg`

#### **Step 3: Save Thumbnails**
Place all 6 JPG files in:
```
D:\PAGB-1\public\images\thumbnails\
```

#### **Step 4: Refresh Your Website**
That's it! The thumbnails will automatically appear.

---

### **Method 2: Automated Script** 🤖 (One-time setup)

#### **Step 1: Install Dependencies**
Open terminal in your project folder and run:
```bash
npm install --save-dev pdfjs-dist canvas
```

#### **Step 2: Run the Script**
```bash
node scripts/generate-pdf-thumbnails.js
```

This will automatically:
- Extract first page from each PDF
- Convert to JPG images
- Save to `public/images/thumbnails/`

---

## 📂 Final File Structure

```
D:\PAGB-1\
├── public\
│   ├── images\
│   │   └── thumbnails\
│   │       ├── article-1.jpg  ✅
│   │       ├── article-2.jpg  ✅
│   │       ├── article-4.jpg  ✅
│   │       ├── article-5.jpg  ✅
│   │       ├── article-6.jpg  ✅
│   │       └── article-7.jpg  ✅
│   └── pdfs\
│       └── (your PDF files)
└── src\
    └── app\
        └── page.tsx  ✅ (Already updated!)
```

---

## ✨ What Will Happen

### **Before Thumbnails:**
- All articles show the same military image
- Green overlay with "PAGB 2024" text

### **After Thumbnails:**
- Each article shows its **actual PDF first page**
- Clean white border around each thumbnail
- Orange badge with article number
- PDF icon appears on hover
- Fallback to placeholder if thumbnail missing

---

## 🎨 Thumbnail Specifications

- **Size**: 128px width × 176px height
- **Format**: JPG
- **Quality**: 85% (good balance)
- **Display**: Full PDF first page visible

---

## 🔧 Technical Details

### **Code Updates Made:**

1. ✅ Changed thumbnail source from hardcoded to `article.thumbnail`
2. ✅ Added fallback image if thumbnail doesn't exist
3. ✅ Added article number badge
4. ✅ Removed green overlay (shows actual PDF page)
5. ✅ Added white border for clean look
6. ✅ PDF icon on hover

### **Smart Fallback:**
If any thumbnail is missing, it automatically shows the placeholder image instead of breaking.

---

## 🚀 Quick Test

1. Generate just ONE thumbnail (article-1.jpg)
2. Save it to `public/images/thumbnails/`
3. Refresh your page
4. You should see the first article with a real PDF thumbnail!

---

## 📋 Checklist

- [ ] Create `thumbnails` folder ✅ (Already done!)
- [ ] Convert 6 PDFs to JPG images
- [ ] Rename to article-1.jpg through article-7.jpg
- [ ] Save to `D:\PAGB-1\public\images\thumbnails\`
- [ ] Refresh website
- [ ] Verify all thumbnails display correctly

---

## 💡 Tips

### **For Best Results:**
- Use 72-150 DPI for thumbnails
- Keep file size under 200 KB per image
- JPG format is perfect for PDF pages
- First page usually has the title/cover

### **Alternative Tools:**
- **Adobe Acrobat**: File → Export → JPEG
- **Windows**: Open PDF, screenshot first page
- **Mac**: Preview → Export as JPEG
- **Online**: pdf2png.com, pdftoimage.com

---

## ❓ Troubleshooting

### **Thumbnails not showing?**
1. Check file names match exactly: `article-1.jpg` (not `Article-1.jpg`)
2. Verify files are in correct folder
3. Clear browser cache (Ctrl+F5)
4. Check browser console for errors

### **Thumbnail looks blurry?**
- Increase image quality when converting
- Try 150 DPI instead of 72 DPI
- Use higher scale factor in script

---

## ✅ Status

- Code: **READY** ✅
- Folder: **CREATED** ✅
- Images: **PENDING** (You need to add them)

Once you add the 6 JPG files, everything will work automatically!

---

**Need Help?** The script in `scripts/generate-pdf-thumbnails.js` is ready to use if you want automation.
