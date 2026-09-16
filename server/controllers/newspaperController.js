import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storageDir = path.resolve(__dirname, '../storage/newspapers');

export const getTodayNewspapers = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const db = await getDb();
    
    const query = `
      SELECT n.*, l.name as language_name, l.code as language_code, l.native_name as language_native_name, c.name as category_name, c.slug as category_slug
      FROM newspapers n
      JOIN languages l ON n.language_id = l.id
      JOIN categories c ON n.category_id = c.id
      WHERE n.edition_date = ? AND n.status = 'PUBLISHED'
      ORDER BY n.created_at DESC
    `;

    const newspapers = await db.all(query, [todayStr]);

    if (newspapers.length === 0) {
      const fallbackQuery = `
        SELECT n.*, l.name as language_name, l.code as language_code, l.native_name as language_native_name, c.name as category_name, c.slug as category_slug
        FROM newspapers n
        JOIN languages l ON n.language_id = l.id
        JOIN categories c ON n.category_id = c.id
        WHERE n.status = 'PUBLISHED'
        ORDER BY n.edition_date DESC, n.created_at DESC
        LIMIT 10
      `;
      const fallback = await db.all(fallbackQuery);
      return res.json({ newspapers: fallback, isFallback: true });
    }

    res.json({ newspapers, isFallback: false });
  } catch (error) {
    console.error('Error fetching today newspapers:', error);
    res.status(500).json({ error: 'Failed to fetch today newspapers' });
  }
};

export const searchNewspapers = async (req, res) => {
  try {
    const {
      q,
      language,
      languageCode,
      newspaper,
      category,
      date,
      publisher,
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const db = await getDb();
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const offset = (pageNum - 1) * limitNum;

    let whereClause = ["n.status = 'PUBLISHED'"];
    let params = [];

    if (q && q.trim() !== '') {
      const searchTerm = `%${q.trim()}%`;
      whereClause.push('(n.title LIKE ? OR n.description LIKE ? OR n.publisher LIKE ? OR l.name LIKE ? OR c.name LIKE ?)');
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (languageCode && languageCode !== 'all') {
      whereClause.push('l.code = ?');
      params.push(languageCode);
    } else if (language && language !== 'all') {
      whereClause.push('(l.name = ? OR l.native_name = ?)');
      params.push(language, language);
    }

    if (newspaper && newspaper !== 'all') {
      whereClause.push('n.title LIKE ?');
      params.push(`%${newspaper.trim()}%`);
    }

    if (category && category !== 'all') {
      whereClause.push('(c.slug = ? OR c.name = ?)');
      params.push(category, category);
    }

    if (date && date.trim() !== '') {
      whereClause.push('n.edition_date = ?');
      params.push(date.trim());
    }

    if (publisher && publisher !== 'all') {
      whereClause.push('n.publisher LIKE ?');
      params.push(`%${publisher.trim()}%`);
    }

    let orderBy = 'n.edition_date DESC, n.created_at DESC';
    if (sort === 'oldest') {
      orderBy = 'n.edition_date ASC, n.created_at ASC';
    } else if (sort === 'views') {
      orderBy = 'n.views_count DESC';
    } else if (sort === 'title') {
      orderBy = 'n.title ASC';
    }

    const whereStr = whereClause.length > 0 ? `WHERE ${whereClause.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*) as total
      FROM newspapers n
      JOIN languages l ON n.language_id = l.id
      JOIN categories c ON n.category_id = c.id
      ${whereStr}
    `;
    const totalRow = await db.get(countSql, params);
    const total = totalRow ? totalRow.total : 0;

    const dataSql = `
      SELECT n.*, l.name as language_name, l.code as language_code, l.native_name as language_native_name, c.name as category_name, c.slug as category_slug
      FROM newspapers n
      JOIN languages l ON n.language_id = l.id
      JOIN categories c ON n.category_id = c.id
      ${whereStr}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;
    const newspapers = await db.all(dataSql, [...params, limitNum, offset]);

    res.json({
      newspapers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    console.error('Error searching newspapers:', error);
    res.status(500).json({ error: 'Failed to execute newspaper search' });
  }
};

export const getNewspaperById = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    const newspaper = await db.get(`
      SELECT n.*, l.name as language_name, l.code as language_code, l.native_name as language_native_name, c.name as category_name, c.slug as category_slug
      FROM newspapers n
      JOIN languages l ON n.language_id = l.id
      JOIN categories c ON n.category_id = c.id
      WHERE n.id = ?
    `, [id]);

    if (!newspaper) {
      return res.status(404).json({ error: 'Newspaper edition not found' });
    }

    await db.run('UPDATE newspapers SET views_count = views_count + 1 WHERE id = ?', [id]);

    res.json(newspaper);
  } catch (error) {
    console.error('Error fetching newspaper details:', error);
    res.status(500).json({ error: 'Failed to fetch newspaper details' });
  }
};

export const streamNewspaperPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    const newspaper = await db.get('SELECT pdf_storage_key, status FROM newspapers WHERE id = ?', [id]);
    if (!newspaper) {
      return res.status(404).json({ error: 'Newspaper stream not found' });
    }

    const isAdmin = req.user && req.user.role === 'ADMIN';
    if (newspaper.status !== 'PUBLISHED' && !isAdmin) {
      return res.status(403).json({ error: 'This edition is not yet published' });
    }

    const filePath = path.join(storageDir, newspaper.pdf_storage_key);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'PDF file is missing on storage server' });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });

      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'X-Content-Type-Options': 'nosniff'
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'X-Content-Type-Options': 'nosniff'
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    console.error('Error streaming PDF file:', error);
    res.status(500).json({ error: 'Failed to stream PDF document' });
  }
};
