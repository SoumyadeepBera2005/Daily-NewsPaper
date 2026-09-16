import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storageDir = path.resolve(__dirname, '../storage/newspapers');

if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

// Function to extract Google Drive file or folder IDs from any URL
export function extractDriveTarget(inputUrl) {
  if (!inputUrl) return null;
  const text = inputUrl.trim();

  // Match folder link pattern
  const folderMatch = text.match(/\/folders\/([a-zA-Z0-9_-]{20,})/);
  if (folderMatch) return { id: folderMatch[1], type: 'folder' };

  // Match file link patterns
  const fileMatch = text.match(/\/file\/d\/([a-zA-Z0-9_-]{20,})/) || text.match(/id=([a-zA-Z0-9_-]{20,})/);
  if (fileMatch) return { id: fileMatch[1], type: 'file' };

  if (/^[a-zA-Z0-9_-]{20,50}$/.test(text)) {
    return { id: text, type: 'folder' };
  }

  return null;
}

// Download raw PDF binary bytes from Google Drive
async function downloadDrivePdfBinary(fileId) {
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  
  const res = await fetch(downloadUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  if (!res.ok) {
    throw new Error(`Google Drive link returned HTTP ${res.status}.`);
  }

  const arrayBuffer = await res.arrayBuffer();
  let buffer = Buffer.from(arrayBuffer);

  // Check if Google Drive returned a large file confirmation HTML page
  const headerStr = buffer.toString('utf8', 0, Math.min(buffer.length, 3000));
  if (headerStr.includes('confirm=') || headerStr.includes('Google Drive - Virus scan warning')) {
    const confirmMatch = headerStr.match(/confirm=([a-zA-Z0-9_-]+)/);
    const token = confirmMatch ? confirmMatch[1] : 't';
    const confirmUrl = `https://drive.google.com/uc?export=download&confirm=${token}&id=${fileId}`;

    const confirmRes = await fetch(confirmUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const confirmArrayBuf = await confirmRes.arrayBuffer();
    buffer = Buffer.from(confirmArrayBuf);
  }

  return buffer;
}

// Auto-classify newspaper title, language, category and edition date accurately
export async function classifyNewspaper(filename, db) {
  const lowerName = filename.toLowerCase();
  const todayStr = new Date().toISOString().split('T')[0];

  const languages = await db.all('SELECT * FROM languages WHERE is_active = 1');
  const enLang = languages.find(l => l.code === 'en') || languages[0];
  const hiLang = languages.find(l => l.code === 'hi') || enLang;
  const bnLang = languages.find(l => l.code === 'bn') || enLang;
  const taLang = languages.find(l => l.code === 'ta') || enLang;
  const teLang = languages.find(l => l.code === 'te') || enLang;
  const mrLang = languages.find(l => l.code === 'mr') || enLang;
  const guLang = languages.find(l => l.code === 'gu') || enLang;

  let selectedLanguage = enLang;

  // 1. Precise Language Auto-Detection
  if (
    lowerName.startsWith('db ') || lowerName.startsWith('db-') || lowerName.startsWith('db_') ||
    lowerName.includes('bhaskar') || lowerName.includes('jagran') || lowerName.includes('dainik') ||
    lowerName.includes('ujala') || lowerName.includes('navbharat') || lowerName.includes('patrika hindi') ||
    lowerName.includes('hindi') || lowerName.includes('samachar') || lowerName.includes('kesari') ||
    lowerName.includes('jansatta') || lowerName.includes('hindustan') || lowerName.includes('prabhat')
  ) {
    selectedLanguage = hiLang;
  } else if (
    lowerName.startsWith('abp') || lowerName.includes('anandabazar') || lowerName.includes('bartaman') ||
    lowerName.includes('eisamay') || lowerName.includes('ei samay') || lowerName.includes('sangbad') ||
    lowerName.includes('pratidin') || lowerName.includes('uttarbanga') || lowerName.includes('ganashakti') ||
    lowerName.includes('aajkaal') || lowerName.includes('bengali') || lowerName.includes('bangla')
  ) {
    selectedLanguage = bnLang;
  } else if (
    lowerName.includes('dinamalar') || lowerName.includes('dinakaran') || lowerName.includes('thanthi') || lowerName.includes('tamil')
  ) {
    selectedLanguage = taLang;
  } else if (
    lowerName.includes('eenadu') || lowerName.includes('sakshi') || lowerName.includes('andhra') || lowerName.includes('telugu')
  ) {
    selectedLanguage = teLang;
  } else if (
    lowerName.includes('loksatta') || lowerName.includes('sakal') || lowerName.includes('marathi') || lowerName.includes('maharashtra')
  ) {
    selectedLanguage = mrLang;
  } else if (
    lowerName.startsWith('th ') || lowerName.startsWith('ie ') || lowerName.startsWith('et ') ||
    lowerName.startsWith('fe ') || lowerName.startsWith('bl ') || lowerName.startsWith('bs ') ||
    lowerName.includes('hindu') || lowerName.includes('express') || lowerName.includes('times') ||
    lowerName.includes('pioneer') || lowerName.includes('tribune') || lowerName.includes('telegraph') ||
    lowerName.includes('statesman') || lowerName.includes('business') || lowerName.includes('english')
  ) {
    selectedLanguage = enLang;
  }

  // 2. Category Auto-Detection
  const categories = await db.all('SELECT * FROM categories WHERE is_active = 1');
  let selectedCategory = categories.find(c => c.slug === 'national') || categories[0];

  if (
    lowerName.includes('business') || lowerName.includes('market') || lowerName.includes('economy') ||
    lowerName.includes('financial') || lowerName.startsWith('bl ') || lowerName.startsWith('fe ') || lowerName.startsWith('et ')
  ) {
    const bus = categories.find(c => c.slug === 'business');
    if (bus) selectedCategory = bus;
  } else if (lowerName.includes('sport') || lowerName.includes('cricket') || lowerName.includes('game')) {
    const sp = categories.find(c => c.slug === 'sports');
    if (sp) selectedCategory = sp;
  } else if (lowerName.includes('editorial') || lowerName.includes('analysis')) {
    const ed = categories.find(c => c.slug === 'editorial');
    if (ed) selectedCategory = ed;
  }

  // 3. Date Auto-Extraction
  let editionDate = todayStr;
  const isoDateMatch = filename.match(/\b(202\d[-_.][01]\d[-_.][0-3]\d)\b/);
  const dmyDateMatch = filename.match(/\b([0-3]\d[-_.][01]\d[-_.](202\d))\b/);
  const dayMonthMatch = filename.match(/\b([0-3]\d)[-_.](([01]\d)|([A-Za-z]{3}))\b/);

  if (isoDateMatch) {
    editionDate = isoDateMatch[1].replace(/[_.]/g, '-');
  } else if (dmyDateMatch) {
    const parts = dmyDateMatch[1].split(/[-_.]/);
    if (parts.length === 3) {
      editionDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  } else if (dayMonthMatch) {
    const currentYear = new Date().getFullYear();
    const day = dayMonthMatch[1];
    let month = dayMonthMatch[2];
    if (isNaN(month)) {
      const monthMap = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
      month = monthMap[month.toLowerCase()] || '08';
    }
    editionDate = `${currentYear}-${month}-${day}`;
  }

  // 4. Clean Newspaper Title Formatting
  let title = filename
    .replace(/\.pdf$/i, '')
    .replace(/[-_.]/g, ' ')
    .replace(/\b(202\d|19\d\d)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (title.toUpperCase().startsWith('DB ')) title = 'Dainik Bhaskar - ' + title.slice(3);
  else if (title.toUpperCase().startsWith('TH ')) title = 'The Hindu - ' + title.slice(3);
  else if (title.toUpperCase().startsWith('IE ')) title = 'The Indian Express - ' + title.slice(3);
  else if (title.toUpperCase().startsWith('ET ')) title = 'Economic Times - ' + title.slice(3);
  else if (title.toUpperCase().startsWith('FE ')) title = 'Financial Express - ' + title.slice(3);
  else if (title.toUpperCase().startsWith('BL ')) title = 'Business Line - ' + title.slice(3);

  if (!title) title = filename.replace(/\.pdf$/i, '');
  title = title.charAt(0).toUpperCase() + title.slice(1);

  // Publisher formatting
  let publisher = 'National Publisher';
  if (selectedLanguage.code === 'hi') publisher = 'Dainik Bhaskar / Jagran Group';
  else if (selectedLanguage.code === 'bn') publisher = 'ABP / Regional Group';
  else if (title.includes('Hindu')) publisher = 'THG Publishing';
  else if (title.includes('Express')) publisher = 'Indian Express Group';

  return {
    title,
    language_id: selectedLanguage.id,
    language_name: selectedLanguage.name,
    category_id: selectedCategory.id,
    category_name: selectedCategory.name,
    edition_date: editionDate,
    publisher
  };
}

export async function syncGoogleDriveFolder(driveInput) {
  if (!driveInput || !driveInput.trim()) {
    throw new Error('Please enter a Google Drive folder or file URL.');
  }

  const db = await getDb();
  const syncedFiles = [];
  let target = extractDriveTarget(driveInput);

  if (!target) {
    throw new Error('Invalid Google Drive URL. Please copy and paste the complete Google Drive link.');
  }

  let fileEntries = [];

  if (target.type === 'file') {
    fileEntries.push({ id: target.id, name: `Drive_Edition_${target.id.substring(0, 8)}.pdf` });
  } else {
    const folderRes = await fetch(`https://drive.google.com/drive/folders/${target.id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!folderRes.ok) {
      throw new Error(`Google Drive returned HTTP status ${folderRes.status}. Check link sharing permissions.`);
    }

    const html = await folderRes.text();

    const regex = /aria-label="([^"]+?\.(?:pdf|PDF))[^"]*"[^>]*?ssk='[^']*?:([a-zA-Z0-9_-]{25,45})/g;
    let match;
    const seenIds = new Set();

    while ((match = regex.exec(html)) !== null) {
      const fileName = match[1].trim();
      const rawId = match[2];
      const cleanId = rawId.replace(/-\d+-\d+$/, '');

      if (cleanId.length >= 25 && !seenIds.has(cleanId)) {
        seenIds.add(cleanId);
        fileEntries.push({ id: cleanId, name: fileName });
      }
    }

    if (fileEntries.length === 0) {
      const idMatches = html.match(/"1[a-zA-Z0-9_-]{32}"/g);
      if (idMatches) {
        const uniqueIds = Array.from(new Set(idMatches.map(m => m.replace(/"/g, ''))))
          .filter(id => id !== target.id);
        
        fileEntries = uniqueIds.map((fId, idx) => ({
          id: fId,
          name: `Newspaper_Edition_${idx + 1}.pdf`
        }));
      }
    }
  }

  if (fileEntries.length === 0) {
    throw new Error('No PDF files found in this Google Drive folder. Make sure the folder contains PDF files and access is set to "Anyone with the link can view".');
  }

  for (const entry of fileEntries) {
    try {
      console.log(`📥 Syncing Google Drive PDF: "${entry.name}" (ID: ${entry.id})...`);
      const pdfBuffer = await downloadDrivePdfBinary(entry.id);

      const isPdfHeader = pdfBuffer.subarray(0, 4).toString('utf8') === '%PDF';
      if (!isPdfHeader) {
        console.warn(`File ${entry.name} is not a valid PDF file. Skipping.`);
        continue;
      }

      const meta = await classifyNewspaper(entry.name, db);
      const storageKey = `drive-${Date.now()}-${Math.round(Math.random() * 1000)}.pdf`;
      const filePath = path.join(storageDir, storageKey);

      fs.writeFileSync(filePath, pdfBuffer);

      const result = await db.run(
        `INSERT INTO newspapers 
        (title, language_id, category_id, edition_date, description, publisher, source_type, pdf_storage_key, thumbnail_url, page_count, status)
        VALUES (?, ?, ?, ?, ?, ?, 'AUTOMATIC_FETCH', ?, '/thumbnails/default_newspaper.png', 16, 'PUBLISHED')`,
        [
          meta.title,
          meta.language_id,
          meta.category_id,
          meta.edition_date,
          `Auto-synced from Google Drive link (${entry.name})`,
          meta.publisher,
          storageKey
        ]
      );

      syncedFiles.push({
        id: result.lastID,
        title: meta.title,
        filename: entry.name,
        language: meta.language_name,
        category: meta.category_name,
        edition_date: meta.edition_date,
        publisher: meta.publisher
      });
    } catch (singleErr) {
      console.error(`Error processing file ${entry.name}:`, singleErr.message);
    }
  }

  if (syncedFiles.length === 0) {
    throw new Error('Could not download PDF files from Google Drive. Please ensure the link sharing permission is set to "Anyone with the link can view".');
  }

  return {
    success: true,
    syncedCount: syncedFiles.length,
    syncedFiles
  };
}
