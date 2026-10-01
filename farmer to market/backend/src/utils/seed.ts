import bcrypt from 'bcryptjs';
import { query } from '../config/db';
import { UserRole } from '../models';

async function seed() {
  try {
    console.log('Starting database seeding...');

    // 1. Clean existing data
    await query('TRUNCATE users, products, orders RESTART IDENTITY CASCADE');
    console.log('Cleaned existing data.');

    // 2. Create Test Users
    const farmerPassword = await bcrypt.hash('password123', 10);
    const buyerPassword = await bcrypt.hash('password123', 10);

    const farmerRes = await query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['test_farmer', 'farmer@example.com', farmerPassword, UserRole.FARMER]
    );
    const farmerId = farmerRes.rows[0].id;

    const buyerRes = await query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['test_buyer', 'buyer@example.com', buyerPassword, UserRole.BUYER]
    );
    const buyerId = buyerRes.rows[0].id;

    console.log('Test users created.');

    // 3. Create Test Products
    const products = [
      ['Organic Tomatoes', 'Fresh red tomatoes', 2.5, 'kg', 50, 'Vegetables', 'https://example.com/tomatoes.jpg'],
      ['Fresh Eggs', 'Free range eggs', 5.0, 'dozen', 20, 'Dairy', 'https://example.com/eggs.jpg'],
      ['Brown Rice', 'Local organic brown rice', 3.0, 'kg', 100, 'Grains', 'https://example.com/rice.jpg'],
    ];

    for (const p of products) {
      await query(
        'INSERT INTO products (farmer_id, name, description, price, unit, stock_quantity, category, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [farmerId, ...p]
      );
    }
    console.log('Test products created.');

    // 4. Create Test Orders
    const productRes = await query('SELECT id FROM products LIMIT 1');
    const productId = productRes.rows[0].id;

    await query(
      'INSERT INTO orders (buyer_id, farmer_id, product_id, quantity, total_price, status) VALUES ($1, $2, $3, $4, $5, $6)',
      [buyerId, farmerId, productId, 2, 5.0, 'pending']
    );

    console.log('Test order created.');
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    process.exit();
  }
}

seed();
