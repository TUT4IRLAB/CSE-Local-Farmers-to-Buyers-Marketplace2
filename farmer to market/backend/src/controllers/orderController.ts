import { Request, Response } from 'express';
import { query } from '../config/db';

export const createOrder = async (req: Request, res: Response) => {
  const { productId, quantity } = req.body;
  const buyerId = (req as any).user.id;

  try {
    // 1. Check product stock
    const productRes = await query('SELECT * FROM products WHERE id = $1', [productId]);
    const product = productRes.rows[0];

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock_quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const totalPrice = product.price * quantity;

    // 2. Create order
    const orderRes = await query(
      'INSERT INTO orders (buyer_id, farmer_id, product_id, quantity, total_price, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [buyerId, product.farmer_id, productId, quantity, totalPrice, 'pending']
    );

    // 3. Reserve stock
    await query('UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2', [quantity, productId]);

    res.status(201).json(orderRes.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getBuyerOrders = async (req: Request, res: Response) => {
  const buyerId = (req as any).user.id;
  try {
    const result = await query(
      'SELECT o.*, p.name as product_name FROM orders o JOIN products p ON o.product_id = p.id WHERE o.buyer_id = $1 ORDER BY o.created_at DESC',
      [buyerId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getFarmerOrders = async (req: Request, res: Response) => {
  const farmerId = (req as any).user.id;
  try {
    const result = await query(
      'SELECT o.*, p.name as product_name, u.username as buyer_name FROM orders o JOIN products p ON o.product_id = p.id JOIN users u ON o.buyer_id = u.id WHERE o.farmer_id = $1 ORDER BY o.created_at DESC',
      [farmerId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const farmerId = (req as any).user.id;

  try {
    const result = await query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND farmer_id = $3 RETURNING *',
      [status, id, farmerId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found or unauthorized' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
