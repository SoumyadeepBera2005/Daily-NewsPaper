import { getDb } from '../config/db.js';

export const getCategories = async (req, res) => {
  try {
    const db = await getDb();
    const categories = await db.all('SELECT * FROM categories WHERE is_active = 1 ORDER BY name ASC');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }

    const db = await getDb();
    const result = await db.run(
      'INSERT INTO categories (name, slug, is_active) VALUES (?, ?, 1)',
      [name.trim(), slug.toLowerCase().trim()]
    );

    const newCat = await db.get('SELECT * FROM categories WHERE id = ?', [result.lastID]);
    res.status(201).json(newCat);
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Category slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, is_active } = req.body;

    const db = await getDb();
    const existing = await db.get('SELECT * FROM categories WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await db.run(
      'UPDATE categories SET name = ?, slug = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [
        name !== undefined ? name.trim() : existing.name,
        slug !== undefined ? slug.toLowerCase().trim() : existing.slug,
        is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
        id
      ]
    );

    const updated = await db.get('SELECT * FROM categories WHERE id = ?', [id]);
    res.json(updated);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const result = await db.run('DELETE FROM categories WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};
