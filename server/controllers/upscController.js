import { getDb } from '../config/db.js';

export const getTodayUpscBrief = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const db = await getDb();

    const query = `
      SELECT * FROM upsc_articles
      WHERE status = 'PUBLISHED' AND (published_date = ? OR published_date < ?)
      ORDER BY published_date DESC, id DESC
      LIMIT 20
    `;

    const articles = await db.all(query, [todayStr, todayStr]);

    const structuredBrief = {
      topNews: articles.filter(a => a.category === 'Top News'),
      prelimsFacts: articles.filter(a => a.category === 'Prelims Facts' || a.prelims_points),
      mainsAnalysis: articles.filter(a => a.category === 'Mains Analysis' || a.mains_analysis),
      govtSchemes: articles.filter(a => a.category === 'Govt Schemes'),
      economy: articles.filter(a => a.category === 'Economy'),
      environment: articles.filter(a => a.category === 'Environment'),
      scienceTech: articles.filter(a => a.category === 'Science & Tech'),
      editorialAnalysis: articles.filter(a => a.category === 'Editorial Analysis'),
      practiceQuestions: articles.filter(a => a.category === 'Practice Questions'),
      allArticles: articles
    };

    res.json(structuredBrief);
  } catch (error) {
    console.error('Error fetching today UPSC brief:', error);
    res.status(500).json({ error: 'Failed to fetch UPSC preparation brief' });
  }
};

export const getUpscArticles = async (req, res) => {
  try {
    const { category, search, date } = req.query;
    const db = await getDb();

    let whereClause = ["status = 'PUBLISHED'"];
    let params = [];

    if (category && category !== 'all') {
      whereClause.push('category = ?');
      params.push(category);
    }

    if (search) {
      whereClause.push('(title LIKE ? OR summary LIKE ? OR tags LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (date) {
      whereClause.push('published_date = ?');
      params.push(date);
    }

    const whereStr = `WHERE ${whereClause.join(' AND ')}`;
    const articles = await db.all(`SELECT * FROM upsc_articles ${whereStr} ORDER BY published_date DESC, created_at DESC`, params);

    res.json(articles);
  } catch (error) {
    console.error('Error fetching UPSC articles:', error);
    res.status(500).json({ error: 'Failed to fetch UPSC articles' });
  }
};

export const createUpscArticle = async (req, res) => {
  try {
    const {
      title,
      summary,
      category,
      source_url,
      published_date,
      prelims_points,
      mains_analysis,
      tags,
      status = 'PUBLISHED'
    } = req.body;

    if (!title || !summary || !category || !published_date) {
      return res.status(400).json({ error: 'Title, summary, category, and published date are required' });
    }

    const db = await getDb();
    const result = await db.run(
      `INSERT INTO upsc_articles 
      (title, summary, category, source_url, published_date, prelims_points, mains_analysis, tags, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        summary.trim(),
        category.trim(),
        source_url ? source_url.trim() : '',
        published_date,
        prelims_points || '',
        mains_analysis || '',
        tags || '',
        status
      ]
    );

    const newArticle = await db.get('SELECT * FROM upsc_articles WHERE id = ?', [result.lastID]);
    res.status(201).json(newArticle);
  } catch (error) {
    console.error('Error creating UPSC article:', error);
    res.status(500).json({ error: 'Failed to create UPSC article' });
  }
};

export const updateUpscArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, summary, category, source_url, published_date, prelims_points, mains_analysis, tags, status } = req.body;

    const db = await getDb();
    const existing = await db.get('SELECT * FROM upsc_articles WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'UPSC article not found' });
    }

    await db.run(
      `UPDATE upsc_articles
       SET title = ?, summary = ?, category = ?, source_url = ?, published_date = ?, prelims_points = ?, mains_analysis = ?, tags = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title !== undefined ? title.trim() : existing.title,
        summary !== undefined ? summary.trim() : existing.summary,
        category !== undefined ? category.trim() : existing.category,
        source_url !== undefined ? source_url.trim() : existing.source_url,
        published_date !== undefined ? published_date : existing.published_date,
        prelims_points !== undefined ? prelims_points : existing.prelims_points,
        mains_analysis !== undefined ? mains_analysis : existing.mains_analysis,
        tags !== undefined ? tags : existing.tags,
        status !== undefined ? status : existing.status,
        id
      ]
    );

    const updated = await db.get('SELECT * FROM upsc_articles WHERE id = ?', [id]);
    res.json(updated);
  } catch (error) {
    console.error('Error updating UPSC article:', error);
    res.status(500).json({ error: 'Failed to update UPSC article' });
  }
};

export const deleteUpscArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const result = await db.run('DELETE FROM upsc_articles WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'UPSC article not found' });
    }
    res.json({ message: 'UPSC article deleted successfully' });
  } catch (error) {
    console.error('Error deleting UPSC article:', error);
    res.status(500).json({ error: 'Failed to delete UPSC article' });
  }
};
