import { getDb } from '../config/db.js';

export const getLanguages = async (req, res) => {
  try {
    const db = await getDb();
    const activeOnly = req.query.all !== 'true';
    const query = activeOnly
      ? 'SELECT * FROM languages WHERE is_active = 1 ORDER BY display_order ASC, name ASC'
      : 'SELECT * FROM languages ORDER BY display_order ASC, name ASC';
    
    const languages = await db.all(query);
    res.json(languages);
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({ error: 'Failed to fetch languages' });
  }
};

export const createLanguage = async (req, res) => {
  try {
    const { name, code, native_name, display_order } = req.body;
    if (!name || !code || !native_name) {
      return res.status(400).json({ error: 'Name, code, and native_name are required' });
    }

    const db = await getDb();
    const result = await db.run(
      'INSERT INTO languages (name, code, native_name, display_order, is_active) VALUES (?, ?, ?, ?, 1)',
      [name.trim(), code.toLowerCase().trim(), native_name.trim(), display_order || 0]
    );

    const newLang = await db.get('SELECT * FROM languages WHERE id = ?', [result.lastID]);
    res.status(201).json(newLang);
  } catch (error) {
    console.error('Error creating language:', error);
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Language code already exists' });
    }
    res.status(500).json({ error: 'Failed to create language' });
  }
};

export const updateLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, native_name, is_active, display_order } = req.body;

    const db = await getDb();
    const existing = await db.get('SELECT * FROM languages WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Language not found' });
    }

    await db.run(
      `UPDATE languages
       SET name = ?, code = ?, native_name = ?, is_active = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name !== undefined ? name.trim() : existing.name,
        code !== undefined ? code.toLowerCase().trim() : existing.code,
        native_name !== undefined ? native_name.trim() : existing.native_name,
        is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
        display_order !== undefined ? display_order : existing.display_order,
        id
      ]
    );

    const updated = await db.get('SELECT * FROM languages WHERE id = ?', [id]);
    res.json(updated);
  } catch (error) {
    console.error('Error updating language:', error);
    res.status(500).json({ error: 'Failed to update language' });
  }
};

export const deleteLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const result = await db.run('DELETE FROM languages WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Language not found' });
    }
    res.json({ message: 'Language deleted successfully' });
  } catch (error) {
    console.error('Error deleting language:', error);
    res.status(500).json({ error: 'Failed to delete language' });
  }
};
