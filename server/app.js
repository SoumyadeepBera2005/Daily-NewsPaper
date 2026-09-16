import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { register, login, getMe } from './controllers/authController.js';
import { getLanguages, createLanguage, updateLanguage, deleteLanguage } from './controllers/languageController.js';
import { getCategories, createCategory, updateCategory, deleteCategory } from './controllers/categoryController.js';
import { getTodayNewspapers, searchNewspapers, getNewspaperById, streamNewspaperPdf } from './controllers/newspaperController.js';
import { upload, uploadNewspaper, updateNewspaper, togglePublishStatus, deleteNewspaper, bulkDeleteNewspapers, getAdminDashboardStats, syncGoogleDrive } from './controllers/adminController.js';
import { getTodayUpscBrief, getUpscArticles, createUpscArticle, updateUpscArticle, deleteUpscArticle } from './controllers/upscController.js';
import { getBookmarks, toggleBookmark, getReadingHistory, updateReadingHistory } from './controllers/userActivityController.js';
import { getSourcesStatus, fetchNewsFromSources } from './services/newspaperFetcher.js';
import { authenticateToken, optionalAuth, requireAdmin } from './middleware/auth.js';
import { getDb } from './config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/thumbnails', express.static(path.join(__dirname, 'public/thumbnails')));

// --- AUTH ROUTES ---
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/me', authenticateToken, getMe);

// --- PUBLIC LANGUAGE & CATEGORY ROUTES ---
app.get('/api/languages', getLanguages);
app.get('/api/categories', getCategories);

// --- NEWSPAPER ROUTES ---
app.get('/api/newspapers/today', getTodayNewspapers);
app.get('/api/newspapers/search', searchNewspapers);
app.get('/api/newspapers/:id', getNewspaperById);

// Protected PDF Stream Endpoint
app.get('/api/newspapers/:id/stream', optionalAuth, streamNewspaperPdf);

// --- UPSC ROUTES ---
app.get('/api/upsc/today', getTodayUpscBrief);
app.get('/api/upsc/articles', getUpscArticles);

// --- USER ACTIVITY ROUTES ---
app.get('/api/user/bookmarks', authenticateToken, getBookmarks);
app.post('/api/user/bookmarks', authenticateToken, toggleBookmark);
app.get('/api/user/history', authenticateToken, getReadingHistory);
app.post('/api/user/history', authenticateToken, updateReadingHistory);

// --- ADMIN ROUTES ---
app.get('/api/admin/stats', authenticateToken, requireAdmin, getAdminDashboardStats);
app.post('/api/admin/drive-sync', authenticateToken, requireAdmin, syncGoogleDrive);
app.post('/api/admin/newspapers/upload', authenticateToken, requireAdmin, upload.single('pdf'), uploadNewspaper);
app.post('/api/admin/newspapers/bulk-delete', authenticateToken, requireAdmin, bulkDeleteNewspapers);
app.put('/api/admin/newspapers/:id', authenticateToken, requireAdmin, updateNewspaper);
app.patch('/api/admin/newspapers/:id/publish', authenticateToken, requireAdmin, togglePublishStatus);
app.delete('/api/admin/newspapers/:id', authenticateToken, requireAdmin, deleteNewspaper);

// Admin Dynamic Languages
app.post('/api/admin/languages', authenticateToken, requireAdmin, createLanguage);
app.put('/api/admin/languages/:id', authenticateToken, requireAdmin, updateLanguage);
app.delete('/api/admin/languages/:id', authenticateToken, requireAdmin, deleteLanguage);

// Admin Categories
app.post('/api/admin/categories', authenticateToken, requireAdmin, createCategory);
app.put('/api/admin/categories/:id', authenticateToken, requireAdmin, updateCategory);
app.delete('/api/admin/categories/:id', authenticateToken, requireAdmin, deleteCategory);

// Admin UPSC Management
app.post('/api/admin/upsc/articles', authenticateToken, requireAdmin, createUpscArticle);
app.put('/api/admin/upsc/articles/:id', authenticateToken, requireAdmin, updateUpscArticle);
app.delete('/api/admin/upsc/articles/:id', authenticateToken, requireAdmin, deleteUpscArticle);

// Admin Sources & Fetching Trigger
app.get('/api/admin/sources', authenticateToken, requireAdmin, getSourcesStatus);
app.post('/api/admin/sources/fetch', authenticateToken, requireAdmin, async (req, res) => {
  const result = await fetchNewsFromSources();
  res.json({ message: 'News sources checked', result });
});

const publicThumbnailsDir = path.join(__dirname, 'public/thumbnails');
import fs from 'fs';
if (!fs.existsSync(publicThumbnailsDir)) {
  fs.mkdirSync(publicThumbnailsDir, { recursive: true });
}

app.listen(PORT, async () => {
  try {
    await getDb();
    console.log(`🚀 Daily News Hub Server running on port ${PORT}`);
  } catch (err) {
    console.error('Failed to initialize database on startup:', err);
  }
});
