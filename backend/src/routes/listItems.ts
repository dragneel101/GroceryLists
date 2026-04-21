import { Router, Response } from 'express';
import pool from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

async function verifyListOwner(listId: string, userId: string): Promise<boolean> {
  const r = await pool.query('SELECT id FROM grocery_lists WHERE id = $1 AND user_id = $2', [listId, userId]);
  return r.rows.length > 0;
}

router.post('/:id/items', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, quantity = 1, unit, estimated_price, actual_price, position = 0 } = req.body;
  if (!name) { res.status(400).json({ error: 'name is required' }); return; }

  try {
    if (!(await verifyListOwner(req.params.id, req.userId!))) {
      res.status(404).json({ error: 'List not found' }); return;
    }

    // Look up catalog entry
    const catalog = await pool.query(
      'SELECT id, last_price FROM items WHERE user_id = $1 AND LOWER(name) = LOWER($2)',
      [req.userId, name]
    );

    let itemId: string | null = null;
    let estPrice = estimated_price ?? null;

    if (catalog.rows[0]) {
      itemId = catalog.rows[0].id;
      if (estPrice === null) estPrice = catalog.rows[0].last_price;
    } else {
      // Create catalog entry
      const newItem = await pool.query(
        'INSERT INTO items (user_id, name, default_unit, last_price) VALUES ($1, $2, $3, $4) RETURNING id',
        [req.userId, name, unit ?? null, actual_price ?? null]
      );
      itemId = newItem.rows[0].id;
    }

    const result = await pool.query(
      `INSERT INTO grocery_list_items (list_id, item_id, name, quantity, unit, estimated_price, actual_price, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.params.id, itemId, name, quantity, unit ?? null, estPrice, actual_price ?? null, position]
    );

    // Update catalog last_price if actual_price provided
    if (actual_price != null && itemId) {
      await pool.query(
        'UPDATE items SET last_price = $1, updated_at = NOW() WHERE id = $2',
        [actual_price, itemId]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Failed to add item' });
  }
});

router.patch('/:id/items/:itemId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { quantity, unit, estimated_price, actual_price, checked, position } = req.body;
  const updates: string[] = [];
  const values: any[] = [];
  let i = 1;

  if (quantity !== undefined) { updates.push(`quantity = $${i++}`); values.push(quantity); }
  if (unit !== undefined) { updates.push(`unit = $${i++}`); values.push(unit); }
  if (estimated_price !== undefined) { updates.push(`estimated_price = $${i++}`); values.push(estimated_price); }
  if (actual_price !== undefined) { updates.push(`actual_price = $${i++}`); values.push(actual_price); }
  if (checked !== undefined) { updates.push(`checked = $${i++}`); values.push(checked); }
  if (position !== undefined) { updates.push(`position = $${i++}`); values.push(position); }

  if (!updates.length) { res.status(400).json({ error: 'Nothing to update' }); return; }

  try {
    if (!(await verifyListOwner(req.params.id, req.userId!))) {
      res.status(404).json({ error: 'List not found' }); return;
    }

    values.push(req.params.itemId, req.params.id);
    const result = await pool.query(
      `UPDATE grocery_list_items SET ${updates.join(', ')} WHERE id = $${i} AND list_id = $${i + 1} RETURNING *`,
      values
    );
    if (!result.rows[0]) { res.status(404).json({ error: 'Item not found' }); return; }

    // Update catalog last_price when actual_price is set
    if (actual_price != null && result.rows[0].item_id) {
      await pool.query(
        'UPDATE items SET last_price = $1, updated_at = NOW() WHERE id = $2',
        [actual_price, result.rows[0].item_id]
      );
    }

    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

router.delete('/:id/items/:itemId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await verifyListOwner(req.params.id, req.userId!))) {
      res.status(404).json({ error: 'List not found' }); return;
    }
    const result = await pool.query(
      'DELETE FROM grocery_list_items WHERE id = $1 AND list_id = $2 RETURNING id',
      [req.params.itemId, req.params.id]
    );
    if (!result.rows[0]) { res.status(404).json({ error: 'Item not found' }); return; }
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

router.get('/:id/receipt', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const list = await pool.query(
      'SELECT * FROM grocery_lists WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (!list.rows[0]) { res.status(404).json({ error: 'List not found' }); return; }

    const items = await pool.query(
      'SELECT name, quantity, unit, actual_price FROM grocery_list_items WHERE list_id = $1',
      [req.params.id]
    );

    const lineItems = items.rows.map((item: any) => ({
      name: item.name,
      quantity: parseFloat(item.quantity),
      unit: item.unit,
      actual_price: item.actual_price ? parseFloat(item.actual_price) : null,
      line_total: item.actual_price ? parseFloat(item.actual_price) * parseFloat(item.quantity) : null,
    }));

    const subtotal = lineItems.reduce((sum: number, i: any) => sum + (i.line_total ?? 0), 0);
    const taxRate = parseFloat(list.rows[0].tax_rate);
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    res.json({
      list: {
        id: list.rows[0].id,
        name: list.rows[0].name,
        tax_rate: taxRate,
        completed_at: list.rows[0].completed_at,
      },
      items: lineItems,
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
    });
  } catch {
    res.status(500).json({ error: 'Failed to generate receipt' });
  }
});

export default router;
