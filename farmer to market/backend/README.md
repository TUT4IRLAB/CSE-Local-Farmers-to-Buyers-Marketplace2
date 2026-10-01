# Farm Foods Marketplace Backend

This is the backend API for the Farm Foods Marketplace, built with Node.js, Express, and Neon PostgreSQL.

## Prerequisites

- Node.js (v20+)
- A Neon PostgreSQL account and database

## Setup Instructions

### 1. Environment Configuration
Create a `.env` file in the `backend` directory:
```env
PORT=5000
DATABASE_URL=postgresql://user:password@your-neon-host.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your_super_secret_random_key_here
```

### 2. Database Initialization
1. Connect to your Neon PostgreSQL database.
2. Execute the contents of `backend/schema.sql` to create the necessary tables and enums.

### 3. Installation
```bash
cd backend
npm install
```

### 4. Seeding Test Data
Populate the database with initial test users, products, and orders:
```bash
npm run seed
```

### 5. Running the Application
**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm run build
npm start
```

## API Endpoints

### Auth (`/api/auth`)
- `POST /register` - User registration (role: farmer/buyer)
- `POST /login` - User login
- `GET /me` - Get current user profile

### Products (`/api/products`)
- `GET /` - List all products (with filtering)
- `GET /:id` - Get product details
- `POST /` - Create product (Farmer only)
- `PUT /:id` - Update product (Farmer only)
- `DELETE /:id` - Delete product (Farmer only)

### Orders (`/api/orders`)
- `POST /` - Place order (Buyer only)
- `GET /buyer` - View my orders (Buyer only)
- `GET /farmer` - View incoming orders (Farmer only)
- `PATCH /:id/status` - Update order status (Farmer only)

## Docker Execution
From the root directory:
```bash
docker-compose up --build
```
