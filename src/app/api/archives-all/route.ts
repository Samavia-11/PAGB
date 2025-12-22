// app/api/archives-all/route.ts

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Custom URL encoding - encode spaces and commas for Next.js static file serving
function encodeFilename(filename: string): string {
  return filename
    .replace(/ /g, '%20')
    .replace(/,/g, '%2C')
    .replace(/;/g, '%3B')
    .replace(/ /g, '%20');
}

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
  
  // 2025 Articles
  '1 Strategic Culture and Pakistan\'s Security Profile,  Dr Hasan Askari.pdf': 'Dr Hasan Askari',
  '10 Internal Security in Pakistan A Comprehensive Analysis, Dr Tughral Yamin.pdf': 'Dr Tughral Yamin',
  '11 China Pakistan Economic Corridor (CPEC) - A Bridge to Peace and Prosperity in South Asia, Malik Amir Muhammad Khan.pdf': 'Malik Amir Muhammad Khan',
  '12 Navigating China Pakistan Economic Corridor Pitfalls and Progress, Dr Khalid Rehman.pdf': 'Dr Khalid Rehman',
  '13 Unlocking Pakistan\'s Blue Economy Potential, Dr Maria Sultan.pdf': 'Dr Maria Sultan',
  '14 Kalabagh Iron Ore Deposits to Play an Important Role in the Eco of Pakistan, Dr Samar Mubarakmand.pdf': 'Dr Samar Mubarakmand',
  '15 Pakistan\'s Geo-economics Pivot A Strategic Shift in Foreign Policy, Dr Sheharyar Khan.pdf': 'Dr Sheharyar Khan',
  '16 Building Economic Resilience Pakistan\'s Road map to Sustainable Economic Growth, Najam Ur Rehman.pdf': 'Najam Ur Rehman',
  '17 Climate Change in Pakistan Challenges and Implications Khawar Nazir.pdf': 'Khawar Nazir',
  '18 Geostrategic Perspectives on SCO, NATO and Beyond; Challenges & Opportunities for Pakistan, Sabtian Arif Magary.pdf': 'Sabtian Arif Magary',
  '19 China\'s Rise as A Major Space Power Lessons for Pakistan,  Abdul Ghafoor Babar.pdf': 'Abdul Ghafoor Babar',
  '2 Indo-Pacific Security Dynamics Implications for Pakistan, Farzana Shah.pdf': 'Farzana Shah',
  '20 What Are Leaders Made of,  Raza Muhammad Khan.pdf': 'Raza Muhammad Khan',
  '21 Conservation and Display of Military Heritage in Army Museum and its Psycho-Sociological Impact on Military Personnel and General Public; A Constructive View of Professionalism Dr Sayyam Bin Saeed.pdf': 'Dr Sayyam Bin Saeed',
  '3 Akhand Bharat–Violation of Internal Law, Barrister Ahmer Bilal Soofi.pdf': 'Barrister Ahmer Bilal Soofi',
  '4 India, United Nations Security Council and Global Governance Changing Strategies and Response, Dr Muhammad Farooq.pdf': 'Dr Muhammad Farooq',
  '5 The Anatomy and Grammar of India Pakistan Armed Conflict – 2025 (Mil Conflict "Marka-e-Haq"- Op Bunyan-um-Marsoos), Omar Rashid Sheikh.pdf': 'Omar Rashid Sheikh',
  '6 Evolving Character of War and Our Response to Bellum Verturum,  Shehbaz Khan.pdf': 'Shehbaz Khan',
  '7 Transitioning Into Next Generation of Warfare, Ozair Zafar.pdf': 'Ozair Zafar',
  '8 Drone - Warfare Prospects and Implications,  Abid Imtiaz.pdf': 'Abid Imtiaz',
  '9 Utility of Centre of Gravity (CoG) Analysis for Operational Planning, Muhammad Saqib.pdf': 'Muhammad Saqib',
  
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

    // Check for year folders (2021, 2024, 2025)
    const yearFolders = ['2021', '2024', '2025'];

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
        let thumbnailPath;
        if (year === '2025') {
          // For 2025, use the thumbnail with same name as PDF from Thumnails folder
          const thumbnailBase = file.replace(/\.pdf$/i, '');
          thumbnailPath = `/pdfs/Thumnails/${encodeURIComponent(thumbnailBase)}.jpg`;
        } else {
          // For 2021 and 2024, use existing logic
          const thumbnailBase = file.replace(/\.pdf$/i, '');
          thumbnailPath = `/images/${year}/${encodeURIComponent(thumbnailBase)}.${thumbnailBase.includes('GEOGRAPHIC INFORMATION SYSTEM') ? 'pdf.jpg' : 'jpg'}`;
        }
        
        const thumbnailExists = fs.existsSync(path.join(process.cwd(), 'public', thumbnailPath));
        
        allArticles.push({
          title: cleanTitle,
          author: author,
          authorSlug: author.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          pdfUrl: `/pdfs/${year}/${encodeFilename(file)}`,
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