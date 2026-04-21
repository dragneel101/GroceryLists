import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db';

const router = Router();

function signTokens(userId: string) {
  const secret = process.env.JWT_SECRET!;
  const access = jwt.sign({ userId }, secret, { expiresIn: '15m' });
  const refresh = jwt.sign({ userId, type: 'refresh' }, secret, { expiresIn: '30d' });
  return { access, refresh };
}

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    res.status(400).json({ error: 'email, password, and name are required' });
    return;
  }
  try {
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id',
      [email.toLowerCase(), hash, name]
    );
    const tokens = signTokens(result.rows[0].id);
    res.status(201).json(tokens);
  } catch (err: any) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'Email already registered' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    res.json(signTokens(user.id));
  } catch {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  const { refresh } = req.body;
  if (!refresh) {
    res.status(400).json({ error: 'refresh token required' });
    return;
  }
  try {
    const payload = jwt.verify(refresh, process.env.JWT_SECRET!) as { userId: string; type: string };
    if (payload.type !== 'refresh') {
      res.status(401).json({ error: 'Invalid token type' });
      return;
    }
    res.json(signTokens(payload.userId));
  } catch {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

export default router;
