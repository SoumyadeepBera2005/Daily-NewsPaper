import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_daily_news_hub_jwt_key_2026';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const db = await getDb();
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const lowerEmail = email.toLowerCase().trim();
    const userRole = (lowerEmail === 'soumyadeepbera911@gmail.com' || lowerEmail === 'soumysdeepbera911@gmail.com') ? 'ADMIN' : 'USER';
    const password_hash = await bcrypt.hash(password, 10);
    const result = await db.run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), password_hash, userRole]
    );

    const user = { id: result.lastID, name: name.trim(), email: email.toLowerCase().trim(), role: userRole };
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ message: 'Registration successful', token, user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userData = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ message: 'Login successful', token, user: userData });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

export const getMe = (req, res) => {
  res.json({ user: req.user });
};
