import { Router, Response } from 'express';
import pool from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const q = (req.query.q as string) || '';
  try {
    const result = await pool.query(
      `SELECT id, name, default_unit, last_price FROM items
       WHERE user_id = $1 AND name ILIKE $2
       ORDER BY name LIMIT 20`,
      [req.userId, `%${q}%`]
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

export default router;
