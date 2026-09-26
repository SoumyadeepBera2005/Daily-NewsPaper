import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../database/newspaper_hub.sqlite');
const schemaPath = path.resolve(__dirname, '../database/schema.sql');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let dbInstance = null;

async function initEssentialData(db) {
  try {
    // 1. Ensure Admin users exist
    const adminEmails = [
      { email: 'soumyadeepbera911@gmail.com', pass: 'Soumyadeep@2026', name: 'Admin User' },
      { email: 'soumysdeepbera911@gmail.com', pass: 'Soumyadeep@2026', name: 'Admin User' },
      { email: 'admin@dailynewshub.com', pass: 'Admin@123456', name: 'System Admin' }
    ];

    for (const item of adminEmails) {
      const existing = await db.get('SELECT id FROM users WHERE email = ?', [item.email]);
      if (!existing) {
        const hash = await bcrypt.hash(item.pass, 10);
        await db.run(
          'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
          [item.name, item.email, hash, 'ADMIN']
        );
        console.log(`✅ Auto-created admin user: ${item.email}`);
      }
    }

    // 2. Ensure Languages exist
    const langCount = await db.get('SELECT COUNT(*) as count FROM languages');
    if (langCount.count === 0) {
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
        await db.run(
          'INSERT INTO languages (name, code, native_name, is_active, display_order) VALUES (?, ?, ?, 1, ?)',
          [lang.name, lang.code, lang.native_name, lang.display_order]
        );
      }
      console.log('✅ Auto-seeded essential languages');
    }

    // 3. Ensure Categories exist
    const catCount = await db.get('SELECT COUNT(*) as count FROM categories');
    if (catCount.count === 0) {
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
        await db.run('INSERT INTO categories (name, slug, is_active) VALUES (?, ?, 1)', [cat.name, cat.slug]);
      }
      console.log('✅ Auto-seeded essential categories');
    }
  } catch (err) {
    console.error('Error during essential data auto-seeding:', err);
  }
}

export async function getDb() {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await dbInstance.run('PRAGMA foreign_keys = ON');

  try {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await dbInstance.exec(schemaSql);
    await initEssentialData(dbInstance);
  } catch (error) {
    console.error('Error initializing database schema:', error);
  }

  return dbInstance;
}

// Wrapper helper object matching DB queries across controllers
const db = {
  prepare: (sql) => {
    return {
      all: (...params) => {
        if (!dbInstance) throw new Error('Database not initialized yet');
        return dbInstance.all(sql, params);
      },
      get: (...params) => {
        if (!dbInstance) throw new Error('Database not initialized yet');
        return dbInstance.get(sql, params);
      },
      run: (...params) => {
        if (!dbInstance) throw new Error('Database not initialized yet');
        return dbInstance.run(sql, params);
      }
    };
  }
};

export default db;
