export enum UserRole {
  BUYER = 'buyer',
  FARMER = 'farmer',
  ADMIN = 'admin'
}

export enum OrderStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  FULFILLED = 'fulfilled',
  CANCELLED = 'cancelled'
}

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  farmerId: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  stockQuantity: number;
  category: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  buyerId: string;
  farmerId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}
