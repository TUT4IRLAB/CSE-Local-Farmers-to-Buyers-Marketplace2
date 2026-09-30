import { Product, Category, User, Order } from '../types';

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Vegetables', icon: 'leaf', image: 'https://images.unsplash.com/photo-1566385101042-1a07a6fd853e?auto=format&fit=crop&q=80&w=400' },
  { id: 'cat2', name: 'Fruits', icon: 'apple', image: 'https://images.unsplash.com/photo-1619566636986-97e76b776451?auto=format&fit=crop&q=80&w=400' },
  { id: 'cat3', name: 'Dairy & Eggs', icon: 'egg', image: 'https://images.unsplash.com/photo-1550583724-7a7e55f26c6e?auto=format&fit=crop&q=80&w=400' },
  { id: 'cat4', name: 'Honey & Jams', icon: 'droplet', image: 'https://images.unsplash.com/photo-1589733955941-5ee597752102?auto=format&fit=crop&q=80&w=400' },
  { id: 'cat5', name: 'Grains & Nuts', icon: 'wheat', image: 'https://images.unsplash.com/photo-1509460985627-76e77996bc5a?auto=format&fit=crop&q=80&w=400' },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Organic Heirloom Tomatoes',
    description: 'Juicy, sun-ripened heirloom tomatoes grown without synthetic pesticides.',
    price: 4.99,
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadc675?auto=format&fit=crop&q=80&w=800',
    stock: 50,
    rating: 4.8,
    reviewCount: 124,
    variants: [
      { id: 'v1', name: 'Weight', options: ['500g', '1kg', '2kg'] }
    ],
    createdAt: '2024-01-15',
  },
  {
    id: 'p2',
    name: 'Wild Honey',
    description: 'Pure, unfiltered wildflower honey harvested from local hives.',
    price: 12.50,
    category: 'Honey & Jams',
    image: 'https://images.unsplash.com/photo-1587049352846-6ed67c7747d7?auto=format&fit=crop&q=80&w=800',
    stock: 30,
    rating: 4.9,
    reviewCount: 89,
    variants: [
      { id: 'v2', name: 'Size', options: ['250g', '500g'] }
    ],
    createdAt: '2024-02-10',
  },
  {
    id: 'p3',
    name: 'Fresh Farm Eggs',
    description: 'Free-range organic eggs from happy, pasture-raised hens.',
    price: 6.00,
    category: 'Dairy & Eggs',
    image: 'https://images.unsplash.com/photo-1506976785004-579752f3f53d?auto=format&fit=crop&q=80&w=800',
    stock: 100,
    rating: 4.7,
    reviewCount: 210,
    variants: [
      { id: 'v3', name: 'Pack', options: ['6 Eggs', '12 Eggs'] }
    ],
    createdAt: '2024-03-05',
  },
  {
    id: 'p4',
    name: 'Crispy Gala Apples',
    description: 'Sweet and crunchy Gala apples, perfect for snacking or baking.',
    price: 3.25,
    category: 'Fruits',
    image: 'https://images.unsplash.com/photo-1560807707-877776f735ee?auto=format&fit=crop&q=80&w=800',
    stock: 80,
    rating: 4.6,
    reviewCount: 67,
    variants: [
      { id: 'v4', name: 'Quantity', options: ['1kg', '3kg'] }
    ],
    createdAt: '2024-03-20',
  },
  {
    id: 'p5',
    name: 'Organic Baby Spinach',
    description: 'Freshly harvested organic baby spinach leaves, rich in iron.',
    price: 3.99,
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1576045057995-5697ef44a77d?auto=format&fit=crop&q=80&w=800',
    stock: 40,
    rating: 4.5,
    reviewCount: 42,
    variants: [],
    createdAt: '2024-04-01',
  },
  {
    id: 'p6',
    name: 'Artisan Sourdough Bread',
    description: 'Traditional sourdough bread baked daily using a natural starter.',
    price: 7.50,
    category: 'Grains & Nuts',
    image: 'https://images.unsplash.com/photo-1585478282244-2946d455476b?auto=format&fit=crop&q=80&w=800',
    stock: 20,
    rating: 4.9,
    reviewCount: 156,
    variants: [
      { id: 'v5', name: 'Loaf', options: ['Half', 'Full'] }
    ],
    createdAt: '2024-04-10',
  },
];

export const MOCK_USER: User = {
  id: 'u1',
  email: 'customer@example.com',
  fullName: 'Jane Doe',
  role: 'buyer',
  avatarUrl: 'https://i.pravatar.cc/150?u=u1',
  phoneNumber: '+1 234 567 8901',
  address: {
    street: '123 Farm Road',
    suburb: 'Green Valley',
    city: 'Stellenbosch',
    province: 'Western Cape',
    postalCode: '7600',
    country: 'South Africa',
  },
};

export const MOCK_ADMIN: User = {
  id: 'admin1',
  email: 'admin@farmmarket.com',
  fullName: 'Farmer Bob',
  role: 'admin',
  avatarUrl: 'https://i.pravatar.cc/150?u=admin1',
  phoneNumber: '+1 987 654 3210',
};

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord1',
    userId: 'u1',
    items: [
      { ...MOCK_PRODUCTS[0], quantity: 2, selectedVariants: { 'Weight': '1kg' } },
      { ...MOCK_PRODUCTS[2], quantity: 1, selectedVariants: { 'Pack': '12 Eggs' } },
    ],
    totalAmount: 15.98,
    status: 'Delivered',
    shippingAddress: MOCK_USER.address!,
    createdAt: '2024-05-01',
    paymentMethod: 'Credit Card',
  },
];
