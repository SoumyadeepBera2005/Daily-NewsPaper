import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
