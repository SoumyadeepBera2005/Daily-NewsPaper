import Parser from 'rss-parser';
import { getDb } from '../config/db.js';

const parser = new Parser();

export async function fetchNewsFromSources() {
  console.log('🔄 Checking configured news sources...');
  const db = await getDb();
  const sources = await db.all('SELECT s.*, l.name as language_name FROM news_sources s JOIN languages l ON s.language_id = l.id WHERE s.active = 1');

  const results = [];

  for (const source of sources) {
    try {
      if (source.type === 'RSS') {
        const feed = await parser.parseURL(source.url);
        await db.run('UPDATE news_sources SET last_fetched_at = CURRENT_TIMESTAMP WHERE id = ?', [source.id]);
        results.push({
          sourceId: source.id,
          sourceName: source.name,
          status: 'ACTIVE',
          itemsCount: feed.items ? feed.items.length : 0,
          latestTitle: feed.items && feed.items[0] ? feed.items[0].title : null
        });
      }
    } catch (error) {
      console.warn(`⚠ Source ${source.name} failed:`, error.message);
      results.push({
        sourceId: source.id,
        sourceName: source.name,
        status: 'UNAVAILABLE',
        error: error.message,
        fallbackNotice: 'Automatic source unavailable. Admin manual PDF upload required as fallback.'
      });
    }
  }

  return results;
}

export async function getSourcesStatus(req, res) {
  try {
    const db = await getDb();
    const sources = await db.all(`
      SELECT s.*, l.name as language_name, l.native_name as language_native_name
      FROM news_sources s
      JOIN languages l ON s.language_id = l.id
      ORDER BY s.id ASC
    `);

    res.json(sources);
  } catch (error) {
    console.error('Error getting news sources status:', error);
    res.status(500).json({ error: 'Failed to fetch news sources status' });
  }
}
