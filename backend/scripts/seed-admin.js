import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { query, pool } from '../config/db.js';

dotenv.config();

const email = process.env.ADMIN_EMAIL || 'admin@campus.local';
const password = process.env.ADMIN_PASSWORD || 'ChangeThisAdminPassword123!';
const name = 'CampusPulse Admin';

try {
  const hash = await bcrypt.hash(password, 12);
  await query(
    `INSERT INTO users(name,email,password,role)
     VALUES($1,$2,$3,'admin')
     ON CONFLICT(email) DO UPDATE SET password=EXCLUDED.password, role='admin'
     RETURNING id,email,role`,
    [name, email.toLowerCase(), hash]
  );
  console.log(`Admin ready: ${email}`);
} finally {
  await pool.end();
}
