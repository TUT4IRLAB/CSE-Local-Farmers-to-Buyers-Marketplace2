import { Router } from 'express';
import { getSubscriptionStatus, subscribe } from '../controllers/subscriptionController';
import { authMiddleware, ensureRole } from '../middleware/authMiddleware';
import { UserRole } from '../models';

const router = Router();

router.get('/status', authMiddleware, ensureRole([UserRole.FARMER]), getSubscriptionStatus);
router.post('/subscribe', authMiddleware, ensureRole([UserRole.FARMER]), subscribe);

export default router;
