// app/api/archives-all/route.ts

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Static author mapping for PDFs (synced with list-pdfs/route.ts)
const authorMapping: Record<string, string> = {
  // 2024 Articles
  'AFGHAN REFUGEES AND THE PRINCIPLE OF NON-REFOULEMENT.pdf': 'Barrister Ahmer Bilal Soofi',
  'BRIDGING THE SKILL GAP.pdf': 'Raza Ali Khan,  Naveed Yussuf',
  'CHARACTER OF FUTURE MILITARY CONFLICT IN SUBCONTINENT.pdf': 'Sajjad Hussain',
  'CLIMATE CHANGE AND NATIONAL SECURITY.pdf': 'Mr Adnan Ali',
  'ECONOMIC CHALLENGES FOR UNDERDEVELOPED AND OVERPOPULATED COUNTRIES.pdf': 'Dr Yasir Ali',
  'EMERGING DISRUPTIVE TECHNOLOGIES LESSONS FROM CHINA AND OTHER COUNTRIES.pdf': 'Dr Atta-ur-Rahman',
  'ILLEGAL FOREIGNERS REPATRIATION PLAN AND PAKISTAN STANDS NATIONAL SECURITY A LEGAL PRISM OF INTERNATIONAL LAW.pdf': 'Raja Shozab Majeed',
  'IMPACT OF AI GENERATED DEEPFAKES ON NATIONAL SECURITY.pdf': 'Dr Abdul Rauf, Ehsan Ullah Tarar',
  'IMPACT OF CHINA-PAKISTAN ECONOMIC CORRIDOR ON DYNAMICS OF PEACE AND CONFLICT IN SOUTH ASIA.pdf': 'Dr M Samrez Salik & Dr Maria Hamid',
  'KNOWLEDGE ECONOMY AS A TOOL FOR COUNTERING EXTREMISM AND TERRORISM.pdf': 'Dr Daniya Gardezi',
  'MODERNISING THE AGRICULTURE SECTOR IN PAKISTAN.pdf.pdf': 'Ms Amal Alamgir',
  "MODI'S NEIGHBOURHOOD FIRST POLICY IMPLICATIONS FOR PAKISTAN.pdf": 'Dr Muhammad Farooq',
  'NATIONAL SECURITY POLICIES POLICIES PAKISTAN.pdf': 'Dr Hassan Askari Rizvi',
  'PAKISTAN-AFGHANISTAN RELATIONS A HISTORICAL PERSPECTIVE.pdf': 'Malik Amir Muhammad Khan',
  'PROWESS OF GEOGRAPHIC INFORMATION SYSTEM A PREMEDITATED ADVANTAGE TO STURDIER ARMY.pdf.pdf': 'Shahid Mehmood Akhtar, Muhammad Hafeez',
  'SWARMING USAGE INCONTEMPORARY ARMIES VIS A VIS EFFECTS OF INDIAN SWARMING TECHNOLOGY ON PAKISTAN ARMY IN ANY FUTURE CONFLICT.pdf': 'Sajjad Hussain',
  'THE ROLE OF ARTIFICIAL INTELLIGENCE IN TERRORISM AND COUNTER MEASURES.pdf': 'Dr Muhammad Sheharyar Khan',
  'UNRAVELLING THE INTRIGUING NEXUS SOCIALLY DISRUPTIVE PROXIES AND SECURITY MILIEU OF PAKISTAN.pdf': 'Zubair Yamin Rana',
  
  // 2021/2023 Articles
  'A TALE OF UNENDING ATROCITIES.pdf': 'M Yousaf Malik',
  'APPLICATION OF WARFARE STRATEGIES CYBER SECURITY MANAGEMENT IN ORGANIZATIONS.pdf': 'Tughral Yamin',
  'EFFICACY OF INTERNATIONAL SANCTIONS AGAINST TALIBAN REGIME.pdf': 'Dr Muhammad Farooq',
  'FOREIGN POLICY NATIONAL INTEREST AND SECURITY.pdf': 'Prof Dr Hasan Askari Rizvi',
  'GLOBAL TOURISM ECONOMY AND ECONOMIC GAINS FOR PAKISTAN.pdf': 'Muhammad Suleman Tayyar',
  'HYBRID WARFARE AND THREATS TO PAKISTAN.pdf': 'Sajjad Hussain',
  'IMPACT OF FRAGILE NEIGHBOURHOOD THE CASE OF PAKISTAN-AFGHANISTAN.pdf': 'Ghazala Yasmin Jalil',
  "INDIA'S SPACE PROGRAMME IMPLICATIONS FOR PAKISTAN'S SECURITY.pdf": 'Tahir Gulzar Malik',
  'INTERNET OF THINGS - A MILITARY PERSPECTIVE.pdf': 'Dr Abdul Rauf, Fahad Ashraf',
  'PAKISTAN FOR A TECHNOLOGY DRIVEN KNOWLEDGE ECONOMY.pdf': 'Prof Dr Atta-ur-Rahman',
  "PAKISTAN'S COMPLEX INTERNAL INSTABILITY CHALLENGE A STRUCTURAL PERSPECTIVE.pdf": 'Prof Dr Muhammad Riaz Shad',
  "PAKISTAN'S GEOPOLITICAL EQUATION WITH EURASIA.pdf": 'Ikram Sehgal',
  'POWER TUSSLE IN INDO-PACIFIC IMPLICATIONS FOR PAKISTAN.pdf': 'Zubair Yamin',
  'PREVENTING THE STRETCH OF FLAT GROWTH IN EXPORTS OF PAKISTAN.pdf': 'Prof Dr Zafar Mahmood',
  "REDUCING RELIANCE ON IMPORTED OIL AND GAS FOR PAKISTAN'S POWER NEEDS.pdf": 'Dr. Sammar Mubarakmand',
  'THE THREAT TO NATIONAL MORALE THROUGH SOCIAL MEDIA.pdf': 'Dr Tughral Yamin',
  'THE WAR OF NARRATIVES NATIONAL SECURITY IN THE AGE OF SOCIAL MEDIA.pdf': 'Ehtesham Ul Haq',
};

export async function GET() {
  try {
    const pdfsDir = path.join(process.cwd(), 'public', 'pdfs');
    const allArticles: any[] = [];

    // Check for year folders (2021, 2024, etc.)
    const yearFolders = ['2021', '2024'];

    for (const year of yearFolders) {
      const yearPath = path.join(pdfsDir, year);
      
      if (!fs.existsSync(yearPath)) {
        continue;
      }

      const pdfFiles = fs.readdirSync(yearPath).filter(f => f.toLowerCase().endsWith('.pdf'));

      for (const file of pdfFiles) {
        const cleanTitle = file
          .replace('.pdf', '')
          .replace('.PDF', '')
          .replace(/_/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());

        const author = authorMapping[file] || 'PAGB Contributors';

        // Check if specific thumbnail exists for the article
        const thumbnailBase = file.replace(/\.pdf$/i, '');
        const thumbnailPath = `/images/${year}/${thumbnailBase}.${thumbnailBase.includes('GEOGRAPHIC INFORMATION SYSTEM') ? 'pdf.jpg' : 'jpg'}`;
        const thumbnailExists = fs.existsSync(path.join(process.cwd(), 'public', thumbnailPath));
        
        allArticles.push({
          title: cleanTitle,
          author: author,
          authorSlug: author.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          pdfUrl: `/pdfs/${year}/${encodeURIComponent(file)}`,
          fileName: file,
          year: year,
          thumbnail: thumbnailExists ? thumbnailPath : `/images/${year === '2024' ? 'icon.png' : '2021/thumbnail.png'}`,
        });
      }
    }

    // Sort by year (descending) then by title
    allArticles.sort((a, b) => {
      if (b.year !== a.year) return b.year.localeCompare(a.year);
      return a.title.localeCompare(b.title);
    });

    return NextResponse.json({ articles: allArticles });
  } catch (error) {
    console.error('Archives API error:', error);
    return NextResponse.json({ articles: [] });
  }
}