import { Router, Response } from 'express';
import pool from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, default_tax_rate, created_at FROM users WHERE id = $1',
      [req.userId]
    );
    if (!result.rows[0]) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.patch('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, default_tax_rate } = req.body;
  const updates: string[] = [];
  const values: any[] = [];
  let i = 1;

  if (name !== undefined) { updates.push(`name = $${i++}`); values.push(name); }
  if (default_tax_rate !== undefined) { updates.push(`default_tax_rate = $${i++}`); values.push(default_tax_rate); }

  if (!updates.length) {
    res.status(400).json({ error: 'Nothing to update' });
    return;
  }

  values.push(req.userId);
  try {
    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${i} RETURNING id, email, name, default_tax_rate`,
      values
    );
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;
