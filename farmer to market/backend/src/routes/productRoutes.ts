import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { authMiddleware, ensureRole } from '../middleware/authMiddleware';
import { UserRole } from '../models';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authMiddleware, ensureRole([UserRole.FARMER]), createProduct);
router.put('/:id', authMiddleware, ensureRole([UserRole.FARMER]), updateProduct);
router.delete('/:id', authMiddleware, ensureRole([UserRole.FARMER]), deleteProduct);

export default router;
