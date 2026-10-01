import { Request, Response } from 'express';
import { query } from '../config/db';

export const getSubscriptionStatus = async (req: Request, res: Response) => {
  const farmerId = (req as any).user.id;
  try {
    const result = await query(
      'SELECT * FROM subscriptions WHERE farmer_id = $1 ORDER BY end_date DESC LIMIT 1',
      [farmerId]
    );
    if (result.rows.length === 0) {
      return res.json({ active: false, message: 'No active subscription found' });
    }
    const sub = result.rows[0];
    const isActive = new Date(sub.end_date) > new Date();
    res.json({ active: isActive, subscription: sub });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const subscribe = async (req: Request, res: Response) => {
  const { plan } = req.body;
  const farmerId = (req as any).user.id;

  if (!['monthly_basic', 'yearly_premium'].includes(plan)) {
    return res.status(400).json({ message: 'Invalid subscription plan' });
  }

  try {
    const endDate = new Date();
    if (plan === 'monthly_basic') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const result = await query(
      'INSERT INTO subscriptions (farmer_id, plan, end_date) VALUES ($1, $2, $3) RETURNING *',
      [farmerId, plan, endDate]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
