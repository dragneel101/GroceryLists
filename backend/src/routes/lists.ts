import { Router, Response } from 'express';
import pool from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, name, tax_rate, status, created_at, completed_at FROM grocery_lists
       WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Failed to fetch lists' });
  }
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name } = req.body;
  if (!name) { res.status(400).json({ error: 'name is required' }); return; }
  try {
    const user = await pool.query('SELECT default_tax_rate FROM users WHERE id = $1', [req.userId]);
    const tax_rate = req.body.tax_rate ?? user.rows[0]?.default_tax_rate ?? 0.13;
    const result = await pool.query(
      'INSERT INTO grocery_lists (user_id, name, tax_rate) VALUES ($1, $2, $3) RETURNING *',
      [req.userId, name, tax_rate]
    );
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Failed to create list' });
  }
});

router.get('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const list = await pool.query(
      'SELECT * FROM grocery_lists WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (!list.rows[0]) { res.status(404).json({ error: 'List not found' }); return; }
    const items = await pool.query(
      'SELECT * FROM grocery_list_items WHERE list_id = $1 ORDER BY position, id',
      [req.params.id]
    );
    res.json({ ...list.rows[0], items: items.rows });
  } catch {
    res.status(500).json({ error: 'Failed to fetch list' });
  }
});

router.patch('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, tax_rate, status } = req.body;
  const updates: string[] = [];
  const values: any[] = [];
  let i = 1;

  if (name !== undefined) { updates.push(`name = $${i++}`); values.push(name); }
  if (tax_rate !== undefined) { updates.push(`tax_rate = $${i++}`); values.push(tax_rate); }
  if (status !== undefined) {
    updates.push(`status = $${i++}`); values.push(status);
    if (status === 'completed') { updates.push(`completed_at = NOW()`); }
  }

  if (!updates.length) { res.status(400).json({ error: 'Nothing to update' }); return; }

  values.push(req.params.id, req.userId);
  try {
    const result = await pool.query(
      `UPDATE grocery_lists SET ${updates.join(', ')} WHERE id = $${i} AND user_id = $${i + 1} RETURNING *`,
      values
    );
    if (!result.rows[0]) { res.status(404).json({ error: 'List not found' }); return; }
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Failed to update list' });
  }
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'DELETE FROM grocery_lists WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );
    if (!result.rows[0]) { res.status(404).json({ error: 'List not found' }); return; }
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete list' });
  }
});

export default router;
