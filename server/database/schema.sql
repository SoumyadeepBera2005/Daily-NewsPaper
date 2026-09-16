-- Daily News Hub Database Schema (SQLite compatible)

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('USER', 'ADMIN')) DEFAULT 'USER',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS languages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  native_name TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS newspapers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  language_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  edition_date DATE NOT NULL,
  description TEXT,
  publisher TEXT NOT NULL,
  source_type TEXT CHECK(source_type IN ('MANUAL_UPLOAD', 'AUTOMATIC_FETCH')) DEFAULT 'MANUAL_UPLOAD',
  pdf_storage_key TEXT NOT NULL,
  thumbnail_url TEXT,
  page_count INTEGER DEFAULT 1,
  status TEXT CHECK(status IN ('DRAFT', 'PUBLISHED', 'UNPUBLISHED')) DEFAULT 'PUBLISHED',
  views_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  newspaper_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, newspaper_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (newspaper_id) REFERENCES newspapers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reading_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  newspaper_id INTEGER NOT NULL,
  last_page INTEGER DEFAULT 1,
  last_read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, newspaper_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (newspaper_id) REFERENCES newspapers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS news_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('RSS', 'API')) DEFAULT 'RSS',
  url TEXT NOT NULL,
  language_id INTEGER NOT NULL,
  active INTEGER DEFAULT 1,
  last_fetched_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS upsc_articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  category TEXT NOT NULL,
  source_url TEXT,
  published_date DATE NOT NULL,
  prelims_points TEXT,
  mains_analysis TEXT,
  tags TEXT,
  status TEXT CHECK(status IN ('DRAFT', 'PUBLISHED')) DEFAULT 'PUBLISHED',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance as specified in section 9 & 16 of specification
CREATE INDEX IF NOT EXISTS idx_newspapers_language ON newspapers(language_id);
CREATE INDEX IF NOT EXISTS idx_newspapers_category ON newspapers(category_id);
CREATE INDEX IF NOT EXISTS idx_newspapers_date ON newspapers(edition_date);
CREATE INDEX IF NOT EXISTS idx_newspapers_publisher ON newspapers(publisher);
CREATE INDEX IF NOT EXISTS idx_newspapers_status ON newspapers(status);
CREATE INDEX IF NOT EXISTS idx_upsc_date ON upsc_articles(published_date);
