import { Request, Response } from 'express';
import { query } from '../config/db';

export const getProducts = async (req: Request, res: Response) => {
  const { category, search } = req.query;

  try {
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];

    if (category) {
      params.push(`%${category}%`);
      sql += ` AND category ILIKE $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  const { name, description, price, unit, stock_quantity, category, image_url } = req.body;
  const farmerId = (req as any).user.id;

  try {
    const result = await query(
      'INSERT INTO products (farmer_id, name, description, price, unit, stock_quantity, category, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [farmerId, name, description, price, unit, stock_quantity, category, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, price, unit, stock_quantity, category, image_url } = req.body;
  const farmerId = (req as any).user.id;

  try {
    const result = await query(
      'UPDATE products SET name = $1, description = $2, price = $3, unit = $4, stock_quantity = $5, category = $6, image_url = $7 WHERE id = $8 AND farmer_id = $9 RETURNING *',
      [name, description, price, unit, stock_quantity, category, image_url, id, farmerId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const farmerId = (req as any).user.id;

  try {
    const result = await query('DELETE FROM products WHERE id = $1 AND farmer_id = $2 RETURNING id', [id, farmerId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
