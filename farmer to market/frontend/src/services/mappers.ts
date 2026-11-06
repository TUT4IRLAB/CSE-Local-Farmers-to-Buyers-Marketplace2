import { Product } from '../types';

export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800';

// Payload the API accepts for POST/PUT /api/products
export interface ProductInput {
  name: string;
  description: string;
  price: number;
  unit: string;
  stock_quantity: number;
  category: string;
  image_url: string;
}

// Backend product row -> UI product
export const toUiProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  description: p.description ?? '',
  price: typeof p.price === 'string' ? parseFloat(p.price) : Number(p.price ?? 0),
  category: p.category || 'Other',
  image: p.image_url || FALLBACK_IMAGE,
  stock: Number(p.stock_quantity ?? 0),
  rating: 0,
  reviewCount: 0,
  variants: [],
  createdAt: p.created_at ?? new Date().toISOString(),
  unit: p.unit || 'unit',
  farmerId: p.farmer_id,
  farmerName: p.farmer_name,
});
