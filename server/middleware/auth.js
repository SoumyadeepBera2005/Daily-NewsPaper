import jwt from 'jsonwebtoken';
import { getDb } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_daily_news_hub_jwt_key_2026';

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token missing or invalid' });
  }

  jwt.verify(token, JWT_SECRET, async (err, userPayload) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    try {
      const db = await getDb();
      let user = await db.get('SELECT id, name, email, role FROM users WHERE id = ?', [userPayload.id]);
      if (!user && userPayload.email) {
        user = await db.get('SELECT id, name, email, role FROM users WHERE email = ?', [userPayload.email]);
      }
      if (!user) {
        return res.status(401).json({ error: 'User account no longer exists. Please log out and log back in.' });
      }

      req.user = user;
      next();
    } catch (dbErr) {
      res.status(500).json({ error: 'Authentication database error' });
    }
  });
}

export async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, async (err, userPayload) => {
      if (!err) {
        try {
          const db = await getDb();
          const user = await db.get('SELECT id, name, email, role FROM users WHERE id = ?', [userPayload.id]);
          if (user) req.user = user;
        } catch (e) {}
      }
      next();
    });
  } else {
    next();
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied: Admin role required' });
  }
  next();
}
