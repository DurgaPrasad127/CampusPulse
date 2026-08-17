import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

function tokenFor(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 8) {
    return res.status(400).json({ message: 'Name, email and password (8+ chars) are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
  if (existing.rowCount) return res.status(409).json({ message: 'Email already registered' });

  const hash = await bcrypt.hash(password, 12);
  const result = await query(
    'INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) RETURNING id,name,email,role',
    [name.trim(), normalizedEmail, hash, 'student']
  );
  const user = result.rows[0];
  return res.status(201).json({ token: tokenFor(user), user });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  const result = await query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
  if (!result.rowCount) return res.status(401).json({ message: 'Invalid email or password' });

  const user = result.rows[0];
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

  return res.json({
    token: tokenFor(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
}

export async function me(req, res) {
  const result = await query('SELECT id,name,email,role,created_at FROM users WHERE id=$1', [req.user.id]);
  if (!result.rowCount) return res.status(404).json({ message: 'User not found' });
  return res.json(result.rows[0]);
}

export async function listUsers(req, res) {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  const result = await query('SELECT id,name,email,role FROM users ORDER BY name ASC');
  return res.json(result.rows);
}
