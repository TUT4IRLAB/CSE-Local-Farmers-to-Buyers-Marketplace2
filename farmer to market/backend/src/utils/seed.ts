import bcrypt from 'bcryptjs';
import { query } from '../config/db';
import { UserRole } from '../models';

async function seed() {
  try {
    console.log('Starting database seeding...');

    // 1. Clean existing data
    await query('TRUNCATE users, products, orders RESTART IDENTITY CASCADE');
    console.log('Cleaned existing data.');

    // 2. Create Test Users (development-only credentials)
    const password = await bcrypt.hash('password123', 10);

    const farmerRes = await query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['test_farmer', 'farmer@example.com', password, UserRole.FARMER]
    );
    const farmerId = farmerRes.rows[0].id;

    const farmer2Res = await query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['green_valley_farm', 'farmer2@example.com', password, UserRole.FARMER]
    );
    const farmer2Id = farmer2Res.rows[0].id;

    const buyerRes = await query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['test_buyer', 'buyer@example.com', password, UserRole.BUYER]
    );
    const buyerId = buyerRes.rows[0].id;

    const buyer2Res = await query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['hungry_restaurant', 'buyer2@example.com', password, UserRole.BUYER]
    );
    const buyer2Id = buyer2Res.rows[0].id;

    await query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['test_admin', 'admin@example.com', password, UserRole.ADMIN]
    );

    console.log('Test users created (2 farmers, 2 buyers, 1 admin).');

    // 3. Create Test Products with working image URLs
    const products: [string, string, string, number, string, number, string, string][] = [
      // farmer 1
      [farmerId, 'Organic Tomatoes', 'Fresh red tomatoes grown without synthetic pesticides.', 2.5, 'kg', 50, 'Vegetables', 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&q=80&w=800'],
      [farmerId, 'Free-Range Eggs', 'Free range eggs from pasture-raised hens.', 5.0, 'dozen', 20, 'Dairy & Eggs', 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&q=80&w=800'],
      [farmerId, 'Organic Baby Spinach', 'Freshly harvested organic baby spinach, rich in iron.', 3.99, 'bunch', 40, 'Vegetables', 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&q=80&w=800'],
      [farmerId, 'Wild Honey', 'Pure, unfiltered wildflower honey from local hives.', 12.5, 'jar', 25, 'Honey & Jams', 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=80&w=800'],
      // farmer 2
      [farmer2Id, 'Crispy Gala Apples', 'Sweet and crunchy Gala apples, perfect for snacking.', 3.25, 'kg', 80, 'Fruits', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=800'],
      [farmer2Id, 'Artisan Sourdough Bread', 'Traditional sourdough baked daily with a natural starter.', 7.5, 'loaf', 20, 'Grains & Nuts', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800'],
      [farmer2Id, 'Brown Rice', 'Local organic brown rice, sustainably grown.', 3.0, 'kg', 100, 'Grains & Nuts', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800'],
    ];

    const productIds: Record<string, string> = {};
    for (const [fid, name, description, price, unit, stock, category, imageUrl] of products) {      const inserted = await query(
        'INSERT INTO products (farmer_id, name, description, price, unit, stock_quantity, category, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
        [fid, name, description, price, unit, stock, category, imageUrl]
      );
      productIds[name] = inserted.rows[0].id;
    }
    console.log(`Test products created (${products.length} products across 2 farmers).`);

    // 4. Create Test Orders (spread across both farmers so each sees incoming orders)
    const makeOrder = (
      productName: string,
      buyer: string,
      farmer: string,
      quantity: number,
      price: number,
      status: string
    ) =>
      query(
        'INSERT INTO orders (buyer_id, farmer_id, product_id, quantity, total_price, status) VALUES ($1, $2, $3, $4, $5, $6)',
        [buyer, farmer, productIds[productName], quantity, price * quantity, status]
      );

    await makeOrder('Organic Tomatoes', buyerId, farmerId, 2, 2.5, 'pending');
    await makeOrder('Free-Range Eggs', buyer2Id, farmerId, 1, 5.0, 'approved');
    await makeOrder('Crispy Gala Apples', buyerId, farmer2Id, 3, 3.25, 'pending');
    await makeOrder('Artisan Sourdough Bread', buyer2Id, farmer2Id, 1, 7.5, 'fulfilled');

    console.log('Test orders created (spread across both farmers).');
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    process.exit();
  }
}

seed();
