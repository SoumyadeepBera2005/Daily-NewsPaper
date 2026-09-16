import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { getDb } from '../config/db.js';
import { syncGoogleDriveFolder } from '../services/driveSyncService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storageDir = path.resolve(__dirname, '../storage/newspapers');

if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedOriginal = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitizedOriginal}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF documents are allowed!'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }
});

// Google Drive Auto-Sync Endpoint
export const syncGoogleDrive = async (req, res) => {
  try {
    const { driveUrl } = req.body;
    if (!driveUrl) {
      return res.status(400).json({ error: 'Please provide a valid Google Drive folder or file link' });
    }

    const result = await syncGoogleDriveFolder(driveUrl);
    res.json(result);
  } catch (error) {
    console.error('Drive Sync Error:', error);
    res.status(500).json({ error: error.message || 'Failed to sync Google Drive folder' });
  }
};

export const uploadNewspaper = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const {
      title,
      language_id,
      category_id,
      edition_date,
      description,
      publisher,
      status = 'PUBLISHED',
      page_count = 16
    } = req.body;

    if (!title || !language_id || !category_id || !edition_date || !publisher) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Title, language, category, edition date, and publisher are required' });
    }

    const storageKey = req.file.filename;
    const db = await getDb();

    const result = await db.run(
      `INSERT INTO newspapers 
      (title, language_id, category_id, edition_date, description, publisher, source_type, pdf_storage_key, thumbnail_url, page_count, status)
      VALUES (?, ?, ?, ?, ?, ?, 'MANUAL_UPLOAD', ?, '/thumbnails/default_newspaper.png', ?, ?)`,
      [
        title.trim(),
        language_id,
        category_id,
        edition_date,
        description ? description.trim() : '',
        publisher.trim(),
        storageKey,
        page_count || 1,
        status
      ]
    );

    const newPaper = await db.get('SELECT * FROM newspapers WHERE id = ?', [result.lastID]);
    res.status(201).json({ message: 'Newspaper uploaded successfully', newspaper: newPaper });
  } catch (error) {
    console.error('Error uploading newspaper:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Failed to save uploaded newspaper' });
  }
};

export const updateNewspaper = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, language_id, category_id, edition_date, description, publisher, status, page_count } = req.body;

    const db = await getDb();
    const existing = await db.get('SELECT * FROM newspapers WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Newspaper edition not found' });
    }

    await db.run(
      `UPDATE newspapers
       SET title = ?, language_id = ?, category_id = ?, edition_date = ?, description = ?, publisher = ?, status = ?, page_count = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title !== undefined ? title.trim() : existing.title,
        language_id !== undefined ? language_id : existing.language_id,
        category_id !== undefined ? category_id : existing.category_id,
        edition_date !== undefined ? edition_date : existing.edition_date,
        description !== undefined ? description.trim() : existing.description,
        publisher !== undefined ? publisher.trim() : existing.publisher,
        status !== undefined ? status : existing.status,
        page_count !== undefined ? page_count : existing.page_count,
        id
      ]
    );

    const updated = await db.get('SELECT * FROM newspapers WHERE id = ?', [id]);
    res.json({ message: 'Newspaper updated successfully', newspaper: updated });
  } catch (error) {
    console.error('Error updating newspaper:', error);
    res.status(500).json({ error: 'Failed to update newspaper' });
  }
};

export const togglePublishStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const existing = await db.get('SELECT status FROM newspapers WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Newspaper edition not found' });
    }

    const newStatus = existing.status === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED';
    await db.run('UPDATE newspapers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newStatus, id]);

    res.json({ message: `Newspaper status updated to ${newStatus}`, status: newStatus });
  } catch (error) {
    console.error('Error toggling publish status:', error);
    res.status(500).json({ error: 'Failed to update publication status' });
  }
};

export const deleteNewspaper = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const existing = await db.get('SELECT pdf_storage_key FROM newspapers WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Newspaper edition not found' });
    }

    await db.run('DELETE FROM newspapers WHERE id = ?', [id]);

    if (existing.pdf_storage_key) {
      const filePath = path.join(storageDir, existing.pdf_storage_key);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ message: 'Newspaper edition deleted successfully' });
  } catch (error) {
    console.error('Error deleting newspaper:', error);
    res.status(500).json({ error: 'Failed to delete newspaper' });
  }
};

export const bulkDeleteNewspapers = async (req, res) => {
  try {
    const { ids } = req.body;
    const db = await getDb();

    let targetIds = [];
    if (ids === 'ALL' || (Array.isArray(ids) && ids.includes('ALL'))) {
      const allRows = await db.all('SELECT id, pdf_storage_key FROM newspapers');
      targetIds = allRows.map(r => r.id);
    } else if (Array.isArray(ids)) {
      targetIds = ids.map(id => Number(id)).filter(id => !isNaN(id));
    }

    if (!targetIds || targetIds.length === 0) {
      return res.status(400).json({ error: 'No valid newspapers selected for deletion' });
    }

    const placeholders = targetIds.map(() => '?').join(',');
    const rows = await db.all(`SELECT pdf_storage_key FROM newspapers WHERE id IN (${placeholders})`, targetIds);

    await db.run(`DELETE FROM newspapers WHERE id IN (${placeholders})`, targetIds);

    for (const row of rows) {
      if (row && row.pdf_storage_key) {
        const filePath = path.join(storageDir, row.pdf_storage_key);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    res.json({ message: `Successfully deleted ${targetIds.length} newspaper editions`, deletedCount: targetIds.length });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ error: 'Failed to execute bulk deletion' });
  }
};

export const getAdminDashboardStats = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const db = await getDb();

    const todayRow = await db.get('SELECT COUNT(*) as count FROM newspapers WHERE date(created_at) = date(?)', [todayStr]);
    const pubRow = await db.get("SELECT COUNT(*) as count FROM newspapers WHERE status = 'PUBLISHED'");
    const totalRow = await db.get('SELECT COUNT(*) as count FROM newspapers');
    const viewsRow = await db.get('SELECT SUM(views_count) as total FROM newspapers');
    const usersRow = await db.get("SELECT COUNT(*) as count FROM users WHERE role = 'USER'");

    const languageStats = await db.all(`
      SELECT l.name as language_name, l.native_name, COUNT(n.id) as count, SUM(n.views_count) as total_views
      FROM languages l
      LEFT JOIN newspapers n ON n.language_id = l.id
      GROUP BY l.id
      ORDER BY count DESC
    `);

    const recentUploads = await db.all(`
      SELECT n.*, l.name as language_name, c.name as category_name
      FROM newspapers n
      JOIN languages l ON n.language_id = l.id
      JOIN categories c ON n.category_id = c.id
      ORDER BY n.created_at DESC
      LIMIT 6
    `);

    res.json({
      todayUploads: todayRow ? todayRow.count : 0,
      publishedCount: pubRow ? pubRow.count : 0,
      totalNewspapers: totalRow ? totalRow.count : 0,
      totalViews: viewsRow ? viewsRow.total || 0 : 0,
      totalUsers: usersRow ? usersRow.count : 0,
      languageStats,
      recentUploads
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin dashboard statistics' });
  }
};
