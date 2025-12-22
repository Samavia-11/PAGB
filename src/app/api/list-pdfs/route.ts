import { NextResponse } from 'next/server';

export const runtime = 'edge';

// -------------------------------------------------
// CUSTOM URL ENCODING - only encode spaces and special Unicode chars
// Standard encodeURIComponent encodes too much (commas, parens, etc.)
// -------------------------------------------------
function encodeFilename(filename: string): string {
  // Encode spaces, commas, semicolons, and ampersands for Next.js static file serving
  return filename
    .replace(/ /g, '%20')
    .replace(/,/g, '%2C')
    .replace(/;/g, '%3B')
    .replace(/&/g, '%26');
}

// -------------------------------------------------
// THUMBNAIL MAPPING FOR FILES WITH SPECIAL CHARACTERS
// Note: Thumbnails may still have special chars in filenames on disk
// -------------------------------------------------
const THUMBNAIL_MAP: Record<string, string> = {
  "Unlocking Pakistans Blue Economy Potential, Dr Maria Sultan.pdf": "/pdfs/Thumnails/Unlocking%20Pakistans%20Blue%20Economy%20Potential%2C%20Dr%20Maria%20Sultan.jpg",
  'The Anatomy and Grammar of India Pakistan Armed Conflict - 2025 (Mil Conflict "Marka-e-Haq"- Op Bunyan-um-Marsoos), Omar Rashid Sheikh.pdf': '/pdfs/Thumnails/The%20Anatomy%20and%20Grammar%20of%20India%20Pakistan%20Armed%20Conflict%20-%202025%20(Mil%20Conflict%20"Marka-e-Haq"-%20Op%20Bunyan-um-Marsoos)%2C%20Omar%20Rashid%20Sheikh.jpg',
  "Strategic Culture and Pakistans Security Profile,  Dr Hasan Askari.pdf": "/pdfs/Thumnails/Strategic%20Culture%20and%20Pakistans%20Security%20Profile%2C%20%20Dr%20Hasan%20Askari.jpg",
  "Pakistans Geo-economics Pivot A Strategic Shift in Foreign Policy, Dr Sheharyar Khan.pdf": "/pdfs/Thumnails/Pakistans%20Geo-economics%20Pivot%20A%20Strategic%20Shift%20in%20Foreign%20Policy%2C%20Dr%20Sheharyar%20Khan.jpg",
  "Chinas Rise as A Major Space Power Lessons for Pakistan,  Abdul Ghafoor Babar.pdf": "/pdfs/Thumnails/Chinas%20Rise%20as%20A%20Major%20Space%20Power%20Lessons%20for%20Pakistan%2C%20%20Abdul%20Ghafoor%20Babar.jpg",
  "Building Economic Resilience Pakistans Road map to Sustainable Economic Growth, Najam Ur Rehman.pdf": "/pdfs/Thumnails/Building%20Economic%20Resilience%20Pakistans%20Road%20map%20to%20Sustainable%20Economic%20Growth%2C%20Najam%20Ur%20Rehman.jpg",
  "Akhand Bharat-Violation of Internal Law, Barrister Ahmer Bilal Soofi.pdf": "/pdfs/Thumnails/Akhand%20Bharat-Violation%20of%20Internal%20Law%2C%20Barrister%20Ahmer%20Bilal%20Soofi.jpg"
};

// -------------------------------------------------
// AUTHOR MAPPING (filename -> author name)
// -------------------------------------------------
const AUTHOR_MAP: Record<string, string> = {
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
  'MODI\'S NEIGHBOURHOOD FIRST POLICY IMPLICATIONS FOR PAKISTAN.pdf': 'Dr Muhammad Farooq',
  'NATIONAL SECURITY POLICIES POLICIES PAKISTAN.pdf': 'Dr Hassan Askari Rizvi',
  'PAKISTAN-AFGHANISTAN RELATIONS A HISTORICAL PERSPECTIVE.pdf': 'Malik Amir Muhammad Khan',
  'PROWESS OF GEOGRAPHIC INFORMATION SYSTEM A PREMEDITATED ADVANTAGE TO STURDIER ARMY.pdf.pdf': 'Shahid Mehmood Akhtar, Muhammad Hafeez',
  'SWARMING USAGE INCONTEMPORARY ARMIES VIS A VIS EFFECTS OF INDIAN SWARMING TECHNOLOGY ON PAKISTAN ARMY IN ANY FUTURE CONFLICT.pdf': 'Sajjad Hussain',
  'THE ROLE OF ARTIFICIAL INTELLIGENCE IN TERRORISM AND COUNTER MEASURES.pdf': 'Dr Muhammad Sheharyar Khan',
  'UNRAVELLING THE INTRIGUING NEXUS SOCIALLY DISRUPTIVE PROXIES AND SECURITY MILIEU OF PAKISTAN.pdf': 'Zubair Yamin Rana',
  
  // 2025 Articles
  'Akhand Bharat–Violation of Internal Law, Barrister Ahmer Bilal Soofi.pdf': 'Barrister Ahmer Bilal Soofi',
  'Building Economic Resilience Pakistan\'s Road map to Sustainable Economic Growth, Najam Ur Rehman.pdf': 'Najam Ur Rehman',
  'China Pakistan Economic Corridor (CPEC) - A Bridge to Peace and Prosperity in South Asia, Malik Amir Muhammad Khan.pdf': 'Malik Amir Muhammad Khan',
  'China\'s Rise as A Major Space Power Lessons for Pakistan,  Abdul Ghafoor Babar.pdf': 'Abdul Ghafoor Babar',
  'Climate Change in Pakistan Challenges and Implications Khawar Nazir.pdf': 'Khawar Nazir',
  'Conservation and Display of Military Heritage in Army Museum and its Psycho-Sociological Impact on Military Personnel and General Public; A Constructive View of Professionalism Dr Sayyam Bin Saeed.pdf': 'Dr Sayyam Bin Saeed',
  'Drone - Warfare Prospects and Implications,  Abid Imtiaz.pdf': 'Abid Imtiaz',
  'Evolving Character of War and Our Response to Bellum Verturum,  Shehbaz Khan.pdf': 'Shehbaz Khan',
  'Geostrategic Perspectives on SCO, NATO and Beyond; Challenges & Opportunities for Pakistan, Sabtian Arif Magary.pdf': 'Sabtian Arif Magary',
  'India, United Nations Security Council and Global Governance Changing Strategies and Response, Dr Muhammad Farooq.pdf': 'Dr Muhammad Farooq',
  'Indo-Pacific Security Dynamics Implications for Pakistan, Farzana Shah.pdf': 'Farzana Shah',
  'Internal Security in Pakistan A Comprehensive Analysis, Dr Tughral Yamin.pdf': 'Dr Tughral Yamin',
  'Kalabagh Iron Ore Deposits to Play an Important Role in the Eco of Pakistan, Dr Samar Mubarakmand.pdf': 'Dr Samar Mubarakmand',
  'Navigating China Pakistan Economic Corridor Pitfalls and Progress, Dr Khalid Rehman.pdf': 'Dr Khalid Rehman',
  'Pakistan\'s Geo-economics Pivot A Strategic Shift in Foreign Policy, Dr Sheharyar Khan.pdf': 'Dr Sheharyar Khan',
  'Strategic Culture and Pakistan\'s Security Profile,  Dr Hasan Askari.pdf': 'Dr Hasan Askari',
  'The Anatomy and Grammar of India Pakistan Armed Conflict – 2025 (Mil Conflict "Marka-e-Haq"- Op Bunyan-um-Marsoos), Omar Rashid Sheikh.pdf': 'Omar Rashid Sheikh',
  'Transitioning Into Next Generation of Warfare, Ozair Zafar.pdf': 'Ozair Zafar',
  'Unlocking Pakistan\'s Blue Economy Potential, Dr Maria Sultan.pdf': 'Dr Maria Sultan',
  'Utility of Centre of Gravity (CoG) Analysis for Operational Planning, Muhammad Saqib.pdf': 'Muhammad Saqib',
  'What Are Leaders Made of,  Raza Muhammad Khan.pdf': 'Raza Muhammad Khan',
  
  // 2021/2023 Articles
  'A TALE OF UNENDING ATROCITIES.pdf': 'M Yousaf Malik',
  'APPLICATION OF WARFARE STRATEGIES CYBER SECURITY MANAGEMENT IN ORGANIZATIONS.pdf': 'Tughral Yamin',
  'EFFICACY OF INTERNATIONAL SANCTIONS AGAINST TALIBAN REGIME.pdf': 'Dr Muhammad Farooq',
  'FOREIGN POLICY NATIONAL INTEREST AND SECURITY.pdf': 'Prof Dr Hasan Askari Rizvi',
  'GLOBAL TOURISM ECONOMY AND ECONOMIC GAINS FOR PAKISTAN.pdf': 'Muhammad Suleman Tayyar',
  'HYBRID WARFARE AND THREATS TO PAKISTAN.pdf': 'Sajjad Hussain',
  'IMPACT OF FRAGILE NEIGHBOURHOOD THE CASE OF PAKISTAN-AFGHANISTAN.pdf': 'Ghazala Yasmin Jalil',
  'INDIA\'S SPACE PROGRAMME IMPLICATIONS FOR PAKISTAN\'S SECURITY.pdf': 'Tahir Gulzar Malik',
  'INTERNET OF THINGS - A MILITARY PERSPECTIVE.pdf': 'Dr Abdul Rauf, Fahad Ashraf',
  'PAKISTAN FOR A TECHNOLOGY DRIVEN KNOWLEDGE ECONOMY.pdf': 'Prof Dr Atta-ur-Rahman',
  'PAKISTAN\'S COMPLEX INTERNAL INSTABILITY CHALLENGE A STRUCTURAL PERSPECTIVE.pdf': 'Prof Dr Muhammad Riaz Shad',
  'PAKISTAN\'S GEOPOLITICAL EQUATION WITH EURASIA.pdf': 'Ikram Sehgal',
  'POWER TUSSLE IN INDO-PACIFIC IMPLICATIONS FOR PAKISTAN.pdf': 'Zubair Yamin',
  'PREVENTING THE STRETCH OF FLAT GROWTH IN EXPORTS OF PAKISTAN.pdf': 'Prof Dr Zafar Mahmood',
  'REDUCING RELIANCE ON IMPORTED OIL AND GAS FOR PAKISTAN\'S POWER NEEDS.pdf': 'Dr. Sammar Mubarakmand',
  'THE THREAT TO NATIONAL MORALE THROUGH SOCIAL MEDIA.pdf': 'Dr Tughral Yamin',
  'THE WAR OF NARRATIVES NATIONAL SECURITY IN THE AGE OF SOCIAL MEDIA.pdf': 'Ehtesham Ul Haq',
};

// -------------------------------------------------
// STATIC PDF LIST
// -------------------------------------------------
const PDF_CATALOG = {
  '2025': [
    "Akhand Bharat-Violation of Internal Law, Barrister Ahmer Bilal Soofi.pdf",
    "Building Economic Resilience Pakistans Road map to Sustainable Economic Growth, Najam Ur Rehman.pdf",
    "China Pakistan Economic Corridor (CPEC) - A Bridge to Peace and Prosperity in South Asia, Malik Amir Muhammad Khan.pdf",
    "Chinas Rise as A Major Space Power Lessons for Pakistan,  Abdul Ghafoor Babar.pdf",
    "Climate Change in Pakistan Challenges and Implications Khawar Nazir.pdf",
    "Conservation and Display of Military Heritage in Army Museum and its Psycho-Sociological Impact on Military Personnel and General Public; A Constructive View of Professionalism Dr Sayyam Bin Saeed.pdf",
    "Drone - Warfare Prospects and Implications,  Abid Imtiaz.pdf",
    "Evolving Character of War and Our Response to Bellum Verturum,  Shehbaz Khan.pdf",
    "Geostrategic Perspectives on SCO, NATO and Beyond; Challenges & Opportunities for Pakistan, Sabtian Arif Magary.pdf",
    "India, United Nations Security Council and Global Governance Changing Strategies and Response, Dr Muhammad Farooq.pdf",
    "Indo-Pacific Security Dynamics Implications for Pakistan, Farzana Shah.pdf",
    "Internal Security in Pakistan A Comprehensive Analysis, Dr Tughral Yamin.pdf",
    "Kalabagh Iron Ore Deposits to Play an Important Role in the Eco of Pakistan, Dr Samar Mubarakmand.pdf",
    "Navigating China Pakistan Economic Corridor Pitfalls and Progress, Dr Khalid Rehman.pdf",
    "Pakistans Geo-economics Pivot A Strategic Shift in Foreign Policy, Dr Sheharyar Khan.pdf",
    "Strategic Culture and Pakistans Security Profile,  Dr Hasan Askari.pdf",
    'The Anatomy and Grammar of India Pakistan Armed Conflict - 2025 (Mil Conflict "Marka-e-Haq"- Op Bunyan-um-Marsoos), Omar Rashid Sheikh.pdf',
    "Transitioning Into Next Generation of Warfare, Ozair Zafar.pdf",
    "Unlocking Pakistans Blue Economy Potential, Dr Maria Sultan.pdf",
    "Utility of Centre of Gravity (CoG) Analysis for Operational Planning, Muhammad Saqib.pdf",
    "What Are Leaders Made of,  Raza Muhammad Khan.pdf"
  ],
  '2024': [
    'AFGHAN REFUGEES AND THE PRINCIPLE OF NON-REFOULEMENT.pdf',
    'BRIDGING THE SKILL GAP.pdf',
    'CHARACTER OF FUTURE MILITARY CONFLICT IN SUBCONTINENT.pdf',
    'CLIMATE CHANGE AND NATIONAL SECURITY.pdf',
    'ECONOMIC CHALLENGES FOR UNDERDEVELOPED AND OVERPOPULATED COUNTRIES.pdf',
    'EMERGING DISRUPTIVE TECHNOLOGIES LESSONS FROM CHINA AND OTHER COUNTRIES.pdf',
    'ILLEGAL FOREIGNERS REPATRIATION PLAN AND PAKISTAN STANDS NATIONAL SECURITY A LEGAL PRISM OF INTERNATIONAL LAW.pdf',
    'IMPACT OF AI GENERATED DEEPFAKES ON NATIONAL SECURITY.pdf',
    'IMPACT OF CHINA-PAKISTAN ECONOMIC CORRIDOR ON DYNAMICS OF PEACE AND CONFLICT IN SOUTH ASIA.pdf',
    'KNOWLEDGE ECONOMY AS A TOOL FOR COUNTERING EXTREMISM AND TERRORISM.pdf',
    'MODERNISING THE AGRICULTURE SECTOR IN PAKISTAN.pdf.pdf',
    'MODI\'S NEIGHBOURHOOD FIRST POLICY IMPLICATIONS FOR PAKISTAN.pdf',
    'NATIONAL SECURITY POLICIES POLICIES PAKISTAN.pdf',
    'PAKISTAN-AFGHANISTAN RELATIONS A HISTORICAL PERSPECTIVE.pdf',
    'PROWESS OF GEOGRAPHIC INFORMATION SYSTEM A PREMEDITATED ADVANTAGE TO STURDIER ARMY.pdf.pdf',
    'SWARMING USAGE INCONTEMPORARY ARMIES VIS A VIS EFFECTS OF INDIAN SWARMING TECHNOLOGY ON PAKISTAN ARMY IN ANY FUTURE CONFLICT.pdf',
    'THE ROLE OF ARTIFICIAL INTELLIGENCE IN TERRORISM AND COUNTER MEASURES.pdf',
    'UNRAVELLING THE INTRIGUING NEXUS SOCIALLY DISRUPTIVE PROXIES AND SECURITY MILIEU OF PAKISTAN.pdf',

  ],
  '2021': [
    'A TALE OF UNENDING ATROCITIES.pdf',
    'APPLICATION OF WARFARE STRATEGIES CYBER SECURITY MANAGEMENT IN ORGANIZATIONS.pdf',
    'EFFICACY OF INTERNATIONAL SANCTIONS AGAINST TALIBAN REGIME.pdf',
    'FOREIGN POLICY NATIONAL INTEREST AND SECURITY.pdf',
    'GLOBAL TOURISM ECONOMY AND ECONOMIC GAINS FOR PAKISTAN.pdf',
    'HYBRID WARFARE AND THREATS TO PAKISTAN.pdf',
    'IMPACT OF FRAGILE NEIGHBOURHOOD THE CASE OF PAKISTAN-AFGHANISTAN.pdf',
    'INDIA\'S SPACE PROGRAMME IMPLICATIONS FOR PAKISTAN\'S SECURITY.pdf',
    'INTERNET OF THINGS - A MILITARY PERSPECTIVE.pdf',
    'PAKISTAN FOR A TECHNOLOGY DRIVEN KNOWLEDGE ECONOMY.pdf',
    'PAKISTAN\'S COMPLEX INTERNAL INSTABILITY CHALLENGE A STRUCTURAL PERSPECTIVE.pdf',
    'PAKISTAN\'S GEOPOLITICAL EQUATION WITH EURASIA.pdf',
    'POWER TUSSLE IN INDO-PACIFIC IMPLICATIONS FOR PAKISTAN.pdf',
    'PREVENTING THE STRETCH OF FLAT GROWTH IN EXPORTS OF PAKISTAN.pdf',
    'REDUCING RELIANCE ON IMPORTED OIL AND GAS FOR PAKISTAN\'S POWER NEEDS.pdf',
    'THE THREAT TO NATIONAL MORALE THROUGH SOCIAL MEDIA.pdf',
    'THE WAR OF NARRATIVES NATIONAL SECURITY IN THE AGE OF SOCIAL MEDIA.pdf'
  ]
};

// -------------------------------------------------
// API ROUTE
// -------------------------------------------------
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || '2024';

    const pdfList = PDF_CATALOG[folder as keyof typeof PDF_CATALOG] || [];

    const files = pdfList.map((filename) => {
      const title = filename.replace(/\.pdf$/i, '');
      
      // Use custom encoding that only encodes spaces and special Unicode chars
      const pdfUrl = `/pdfs/${folder}/${encodeFilename(filename)}`;

      // AUTO-MATCH PNG with same name - use different logic for different years
      let thumbnail = '/images/icon.png';
      
      if (folder === '2025') {
        // Special handling for 2025 articles with proper URL encoding
        if (title.includes('Akhand Bharat')) {
          thumbnail = '/pdfs/Thumnails/Akhand%20Bharat%E2%80%93Violation%20of%20Internal%20Law%2C%20Barrister%20Ahmer%20Bilal%20Soofi.jpg';
        } else if (title.includes('Unlocking Pakistan')) {
          thumbnail = '/pdfs/Thumnails/Unlocking%20Pakistan%E2%80%99s%20Blue%20Economy%20Potential%2C%20Dr%20Maria%20Sultan.jpg';
        } else if (title.includes('Anatomy and Grammar')) {
          thumbnail = '/pdfs/Thumnails/The%20Anatomy%20and%20Grammar%20of%20India%20Pakistan%20Armed%20Conflict%20%E2%80%93%202025%20(Mil%20Conflict%20%E2%80%9CMarka-e-Haq%E2%80%9D-%20Op%20Bunyan-um-Marsoos)%2C%20Omar%20Rashid%20Sheikh.jpg';
        } else if (title.includes('Strategic Culture')) {
          thumbnail = '/pdfs/Thumnails/Strategic%20Culture%20and%20Pakistan%E2%80%99s%20Security%20Profile%2C%20%20Dr%20Hasan%20Askari.jpg';
        } else if (title.includes('Geo-economics Pivot')) {
          thumbnail = '/pdfs/Thumnails/Pakistan%E2%80%99s%20Geo-economics%20Pivot%20A%20Strategic%20Shift%20in%20Foreign%20Policy%2C%20Dr%20Sheharyar%20Khan.jpg';
        } else if (title.includes('China\'s Rise')) {
          thumbnail = '/pdfs/Thumnails/China%E2%80%99s%20Rise%20as%20A%20Major%20Space%20Power%20Lessons%20for%20Pakistan%2C%20%20Abdul%20Ghafoor%20Babar.jpg';
        } else if (title.includes('Building Economic Resilience')) {
          thumbnail = '/pdfs/Thumnails/Building%20Economic%20Resilience%20Pakistan%E2%80%99s%20Road%20map%20to%20Sustainable%20Economic%20Growth%2C%20Najam%20Ur%20Rehman.jpg';
        } else {
          thumbnail = `/pdfs/Thumnails/${encodeURIComponent(title)}.jpg`;
        }
      } else if (folder === '2024') {
        // For 2024 articles, use thumbnails from /images/2024/
        thumbnail = `/images/2024/${encodeURIComponent(title)}.jpg`;
      } else {
        // For other years, use default icon
        thumbnail = '/images/icon.png';
      }

      // Look up author from mapping, fallback to 'Various Contributors'
      const author = AUTHOR_MAP[filename] || 'Various Contributors';

      return {
        title,
        author,
        published: folder,
        pdfUrl,
        thumbnail,
      };
    });

    return NextResponse.json({ files });

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}
