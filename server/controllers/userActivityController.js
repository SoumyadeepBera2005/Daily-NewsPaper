import { getDb } from '../config/db.js';

export const getBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;
    const db = await getDb();

    const bookmarks = await db.all(`
      SELECT b.id as bookmark_id, b.created_at as bookmarked_at, n.*, l.name as language_name, l.code as language_code, c.name as category_name
      FROM bookmarks b
      JOIN newspapers n ON b.newspaper_id = n.id
      JOIN languages l ON n.language_id = l.id
      JOIN categories c ON n.category_id = c.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `, [userId]);

    res.json(bookmarks);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ error: 'Failed to fetch saved bookmarks' });
  }
};

export const toggleBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newspaperId } = req.body;

    if (!newspaperId) {
      return res.status(400).json({ error: 'Newspaper ID is required' });
    }

    const db = await getDb();
    const existing = await db.get('SELECT id FROM bookmarks WHERE user_id = ? AND newspaper_id = ?', [userId, newspaperId]);

    if (existing) {
      await db.run('DELETE FROM bookmarks WHERE id = ?', [existing.id]);
      return res.json({ isBookmarked: false, message: 'Removed from bookmarks' });
    } else {
      await db.run('INSERT INTO bookmarks (user_id, newspaper_id) VALUES (?, ?)', [userId, newspaperId]);
      return res.json({ isBookmarked: true, message: 'Saved to bookmarks' });
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    res.status(500).json({ error: 'Failed to update bookmark state' });
  }
};

export const getReadingHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const db = await getDb();

    const history = await db.all(`
      SELECT rh.id as history_id, rh.last_page, rh.last_read_at, n.*, l.name as language_name, l.code as language_code, c.name as category_name
      FROM reading_history rh
      JOIN newspapers n ON rh.newspaper_id = n.id
      JOIN languages l ON n.language_id = l.id
      JOIN categories c ON n.category_id = c.id
      WHERE rh.user_id = ?
      ORDER BY rh.last_read_at DESC
    `, [userId]);

    res.json(history);
  } catch (error) {
    console.error('Error fetching reading history:', error);
    res.status(500).json({ error: 'Failed to fetch reading history' });
  }
};

export const updateReadingHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newspaperId, page } = req.body;

    if (!newspaperId || !page) {
      return res.status(400).json({ error: 'Newspaper ID and page number are required' });
    }

    const db = await getDb();
    const existing = await db.get('SELECT id FROM reading_history WHERE user_id = ? AND newspaper_id = ?', [userId, newspaperId]);

    if (existing) {
      await db.run('UPDATE reading_history SET last_page = ?, last_read_at = CURRENT_TIMESTAMP WHERE id = ?', [page, existing.id]);
    } else {
      await db.run('INSERT INTO reading_history (user_id, newspaper_id, last_page) VALUES (?, ?, ?)', [userId, newspaperId, page]);
    }

    res.json({ message: 'Reading progress recorded' });
  } catch (error) {
    console.error('Error updating reading history:', error);
    res.status(500).json({ error: 'Failed to update reading history' });
  }
};
