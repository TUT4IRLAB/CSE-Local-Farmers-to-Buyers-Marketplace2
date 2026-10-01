import { Router } from 'express';
import { createOrder, getBuyerOrders, getFarmerOrders, updateOrderStatus } from '../controllers/orderController';
import { authMiddleware, ensureRole } from '../middleware/authMiddleware';
import { UserRole } from '../models';

const router = Router();

router.post('/', authMiddleware, ensureRole([UserRole.BUYER]), createOrder);
router.get('/buyer', authMiddleware, ensureRole([UserRole.BUYER]), getBuyerOrders);
router.get('/farmer', authMiddleware, ensureRole([UserRole.FARMER]), getFarmerOrders);
router.patch('/:id/status', authMiddleware, ensureRole([UserRole.FARMER]), updateOrderStatus);

export default router;
