import { getDb } from '../config/db.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storageDir = path.resolve(__dirname, '../storage/newspapers');
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

// Create 100% valid standard PDF binary buffer using pdf-lib
async function createValidPdfBuffer(title, pageCount = 4) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (let i = 1; i <= pageCount; i++) {
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();

    // Brand header banner
    page.drawRectangle({
      x: 0,
      y: height - 100,
      width: width,
      height: 100,
      color: rgb(0.31, 0.27, 0.9)
    });

    // Title Text
    page.drawText(title.substring(0, 45), {
      x: 30,
      y: height - 55,
      size: 18,
      font: font,
      color: rgb(1, 1, 1)
    });

    // Subtitle / Date
    const dateStr = new Date().toISOString().split('T')[0];
    page.drawText(`Daily News Hub - Digital Edition | Date: ${dateStr}`, {
      x: 30,
      y: height - 80,
      size: 11,
      font: regularFont,
      color: rgb(0.88, 0.91, 1)
    });

    // Content Body
    page.drawText(`Page ${i} of ${pageCount}`, {
      x: 30,
      y: height - 140,
      size: 14,
      font: font,
      color: rgb(0.1, 0.1, 0.2)
    });

    page.drawText(`TOP HEADLINE: National & Global News Highlights`, {
      x: 30,
      y: height - 175,
      size: 15,
      font: font,
      color: rgb(0.1, 0.1, 0.3)
    });

    const lines = [
      "Comprehensive daily newspaper coverage across national, regional and world headlines.",
      "Access high-yield editorial insights, market updates, and current affairs briefs.",
      "Powered by Daily News Hub protected canvas PDF reader engine.",
      "---------------------------------------------------------------------------------------",
      `Special Report Section (Page ${i}): Policy analysis, economic indicators, and state developments.`
    ];

    let currentY = height - 215;
    for (const line of lines) {
      page.drawText(line, {
        x: 30,
        y: currentY,
        size: 11,
        font: regularFont,
        color: rgb(0.25, 0.25, 0.35)
      });
      currentY -= 24;
    }
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

async function seed() {
  console.log('🌱 Starting database seed...');
  const db = await getDb();

  // 1. Seed Languages
  const languages = [
    { name: 'Bengali', code: 'bn', native_name: 'বাংলা', display_order: 1 },
    { name: 'English', code: 'en', native_name: 'English', display_order: 2 },
    { name: 'Hindi', code: 'hi', native_name: 'हिन्दी', display_order: 3 },
    { name: 'Tamil', code: 'ta', native_name: 'தமிழ்', display_order: 4 },
    { name: 'Telugu', code: 'te', native_name: 'తెలుగు', display_order: 5 },
    { name: 'Marathi', code: 'mr', native_name: 'मराठी', display_order: 6 },
    { name: 'Gujarati', code: 'gu', native_name: 'ગુજરાતી', display_order: 7 },
    { name: 'Punjabi', code: 'pa', native_name: 'ਪੰਜਾਬੀ', display_order: 8 },
    { name: 'Malayalam', code: 'ml', native_name: 'മലയാളം', display_order: 9 },
    { name: 'Kannada', code: 'kn', native_name: 'কন্নড়', display_order: 10 },
    { name: 'Odia', code: 'or', native_name: 'ওড়িয়া', display_order: 11 },
    { name: 'Assamese', code: 'as', native_name: 'অসমীয়া', display_order: 12 },
    { name: 'Urdu', code: 'ur', native_name: 'اردو', display_order: 13 }
  ];

  for (const lang of languages) {
    const existing = await db.get('SELECT id FROM languages WHERE code = ?', [lang.code]);
    if (!existing) {
      await db.run(
        'INSERT INTO languages (name, code, native_name, is_active, display_order) VALUES (?, ?, ?, 1, ?)',
        [lang.name, lang.code, lang.native_name, lang.display_order]
      );
    }
  }
  console.log('✅ Languages seeded');

  // 2. Seed Categories
  const categories = [
    { name: 'National', slug: 'national' },
    { name: 'International', slug: 'international' },
    { name: 'State / Regional', slug: 'state-regional' },
    { name: 'Local', slug: 'local' },
    { name: 'Business', slug: 'business' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Technology', slug: 'technology' },
    { name: 'Entertainment', slug: 'entertainment' },
    { name: 'Editorial', slug: 'editorial' },
    { name: 'Current Affairs', slug: 'current-affairs' },
    { name: 'Education', slug: 'education' },
    { name: 'Employment', slug: 'employment' },
    { name: 'Other', slug: 'other' }
  ];

  for (const cat of categories) {
    const existing = await db.get('SELECT id FROM categories WHERE slug = ?', [cat.slug]);
    if (!existing) {
      await db.run('INSERT INTO categories (name, slug, is_active) VALUES (?, ?, 1)', [cat.name, cat.slug]);
    }
  }
  console.log('✅ Categories seeded');

  // 3. Seed Users
  const adminHash = await bcrypt.hash('Soumyadeep@2026', 10);
  const userHash = await bcrypt.hash('user123', 10);

  const adminEmails = ['soumyadeepbera911@gmail.com', 'soumysdeepbera911@gmail.com'];
  for (const adminEmail of adminEmails) {
    const existingAdmin = await db.get('SELECT id FROM users WHERE email = ?', [adminEmail]);
    if (!existingAdmin) {
      await db.run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [
        'Admin User', adminEmail, adminHash, 'ADMIN'
      ]);
    }
  }

  const existingUser = await db.get('SELECT id FROM users WHERE email = ?', ['user@dailynewshub.com']);
  if (!existingUser) {
    await db.run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [
      'Subscriber User', 'user@dailynewshub.com', userHash, 'USER'
    ]);
  }
  console.log('✅ Users seeded (Admin: soumyadeepbera911@gmail.com / Soumyadeep@2026)');

  // 4. Sample Valid PDF Newspapers
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const bnLang = await db.get('SELECT id FROM languages WHERE code = ?', ['bn']);
  const enLang = await db.get('SELECT id FROM languages WHERE code = ?', ['en']);
  const hiLang = await db.get('SELECT id FROM languages WHERE code = ?', ['hi']);

  const natCat = await db.get('SELECT id FROM categories WHERE slug = ?', ['national']);
  const busCat = await db.get('SELECT id FROM categories WHERE slug = ?', ['business']);
  const spCat = await db.get('SELECT id FROM categories WHERE slug = ?', ['sports']);

  const sampleEditions = [
    {
      title: 'Anandabazar Patrika - Kolkata Edition',
      language_id: bnLang.id,
      category_id: natCat.id,
      edition_date: todayStr,
      description: 'Daily Bengali Newspaper covering West Bengal national and world news.',
      publisher: 'ABP Group',
      filename: `anandabazar_${todayStr}.pdf`,
      pages: 16
    },
    {
      title: 'Bartaman Patrika - Executive Daily',
      language_id: bnLang.id,
      category_id: busCat.id,
      edition_date: todayStr,
      description: 'Leading Bengali newspaper with business and regional insights.',
      publisher: 'Bartaman Pvt Ltd',
      filename: `bartaman_${todayStr}.pdf`,
      pages: 12
    },
    {
      title: 'The Indian Express - National Edition',
      language_id: enLang.id,
      category_id: natCat.id,
      edition_date: todayStr,
      description: 'Journalism of Courage - National headlines, policy analysis & editorials.',
      publisher: 'Indian Express Group',
      filename: `indian_express_${todayStr}.pdf`,
      pages: 24
    },
    {
      title: 'Business Standard - Daily Market Analysis',
      language_id: enLang.id,
      category_id: busCat.id,
      edition_date: todayStr,
      description: 'Comprehensive coverage of financial markets, economy & corporate updates.',
      publisher: 'Business Standard Ltd',
      filename: `business_standard_${todayStr}.pdf`,
      pages: 18
    },
    {
      title: 'Dainik Jagran - Delhi Special',
      language_id: hiLang.id,
      category_id: natCat.id,
      edition_date: todayStr,
      description: 'Popular Hindi national daily with state and national coverage.',
      publisher: 'Jagran Prakashan',
      filename: `dainik_jagran_${todayStr}.pdf`,
      pages: 14
    },
    {
      title: 'The Hindu - Archive Special',
      language_id: enLang.id,
      category_id: spCat.id,
      edition_date: yesterday,
      description: 'Previous day edition covering sports specials and UPSC editorials.',
      publisher: 'THG Publishing',
      filename: `the_hindu_${yesterday}.pdf`,
      pages: 20
    }
  ];

  const forceSeed = process.argv.includes('--force');
  const existingCount = await db.get('SELECT COUNT(*) as count FROM newspapers');

  if (existingCount.count === 0 || forceSeed) {
    if (forceSeed) {
      await db.run('DELETE FROM newspapers');
      console.log('🧹 Cleared existing newspapers (--force flag present)');
    }

    for (const item of sampleEditions) {
      const pdfBuf = await createValidPdfBuffer(item.title, item.pages);
      const pdfFilePath = path.join(storageDir, item.filename);
      fs.writeFileSync(pdfFilePath, pdfBuf);

      await db.run(
        `INSERT INTO newspapers 
        (title, language_id, category_id, edition_date, description, publisher, source_type, pdf_storage_key, thumbnail_url, page_count, status, views_count)
        VALUES (?, ?, ?, ?, ?, ?, 'MANUAL_UPLOAD', ?, '/thumbnails/default_newspaper.png', ?, 'PUBLISHED', ?)`,
        [
          item.title,
          item.language_id,
          item.category_id,
          item.edition_date,
          item.description,
          item.publisher,
          item.filename,
          item.pages,
          Math.floor(Math.random() * 150) + 12
        ]
      );
    }
    console.log('✅ Sample PDF newspapers seeded');
  } else {
    console.log(`ℹ Database already contains ${existingCount.count} newspapers. Preserving existing uploaded editions (use --force to overwrite).`);
  }

  // 5. News Sources
  const existingSources = await db.get('SELECT COUNT(*) as count FROM news_sources');
  if (existingSources.count === 0 || forceSeed) {
    if (forceSeed) await db.run('DELETE FROM news_sources');
    await db.run('INSERT INTO news_sources (name, type, url, language_id, active) VALUES (?, ?, ?, ?, 1)', [
      'Press Information Bureau (PIB) English', 'RSS', 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1', enLang.id
    ]);
    await db.run('INSERT INTO news_sources (name, type, url, language_id, active) VALUES (?, ?, ?, ?, 1)', [
      'PIB Bengali Feed', 'RSS', 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=3', bnLang.id
    ]);
    console.log('✅ News sources seeded');
  }

  // 6. UPSC Articles
  const existingUpsc = await db.get('SELECT COUNT(*) as count FROM upsc_articles');
  if (existingUpsc.count === 0 || forceSeed) {
    if (forceSeed) await db.run('DELETE FROM upsc_articles');
    await db.run(
      `INSERT INTO upsc_articles 
      (title, summary, category, source_url, published_date, prelims_points, mains_analysis, tags, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED')`,
      [
        'India-ASEAN Digital Work Plan 2026 Endorsed for Tech Infrastructure',
        'The 5th ASEAN-India Digital Ministers Meeting approved the Joint Work Plan focusing on AI safety, cyber resilience, and cross-border digital payments.',
        'Top News',
        'https://pib.gov.in',
        todayStr,
        '• ASEAN founded in 1967 (Bangkok Declaration).\n• 10 Member States.\n• India is a Dialogue Partner since 1996.',
        'Examine how ASEAN-India digital partnership enhances Indias Act East policy and offsets strategic digital monopolies in the Indo-Pacific region.',
        'ASEAN, Digital India, International Relations, GS-2'
    ]
  );
  await db.run(
    `INSERT INTO upsc_articles 
    (title, summary, category, source_url, published_date, prelims_points, mains_analysis, tags, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED')`,
    [
      'RBI Guidelines on Green Finance & Climate Risk Disclosure Framework',
      'Reserve Bank of India issues updated regulatory expectations for commercial banks to manage climate-related financial risks.',
      'Economy',
      'https://rbi.org.in',
      todayStr,
      '• Green Bonds framework established in 2023.\n• Network for Greening the Financial System (NGFS).\n• ESG taxonomy alignment.',
      'Discuss the financial stability threats posed by transition risks versus physical climate risks in emerging economies.',
      'RBI, Green Finance, Economy, GS-3'
    ]
  );
    console.log('✅ UPSC Daily Brief seeded');
  }
  console.log('🎉 Seed completed successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error during seeding:', err);
  process.exit(1);
});
