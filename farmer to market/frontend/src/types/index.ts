export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'buyer' | 'farmer' | 'admin';
  avatarUrl?: string;
  phoneNumber?: string;
  address?: Address;
  farmName?: string;
  farmLocation?: string;
}

export interface Address {
  street: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  rating: number;
  reviewCount: number;
  variants: ProductVariant[];
  createdAt: string;
  unit?: string;
  farmerId?: string;
  farmerName?: string;
}

// Row returned by the backend /api/orders endpoints (snake_case, totals as strings)
export interface ApiOrder {
  id: string;
  buyer_id?: string;
  farmer_id?: string;
  product_id: string;
  product_name?: string;
  buyer_name?: string;
  quantity: number;
  total_price: string;
  status: 'pending' | 'approved' | 'fulfilled' | 'cancelled';
  created_at: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g., 'Size', 'Color'
  options: string[]; // e.g., ['Small', 'Medium', 'Large']
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariants: Record<string, string>;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress: Address;
  createdAt: string;
  paymentMethod: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
}
