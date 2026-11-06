# CSE-Local-Farmers-to-Buyers-Marketplace2

Small-scale farmers often struggle to reach buyers beyond their immediate area, while local buyers (households, small restaurants) don't have an easy way to find and buy directly from nearby producers. This project ("Farm Foods Marketplace") is a marketplace application intended to connect the two.

---

## 1. Application Overview

The repository contains **two separate applications** under the `farmer to market/` folder:

| Component | Technology | What it does | Run command |
|---|---|---|---|
| **Backend API** (`farmer to market/backend`) | Node.js + Express + TypeScript + PostgreSQL | REST API for users (register/login with JWT), products, orders and farmer subscriptions | `npm run dev` (port **5000**) |
| **Frontend SPA** (`farmer to market/frontend`) | React 18 + Vite + TypeScript + Tailwind CSS | Browser storefront with cart, checkout, farmer dashboard and admin dashboard | `npm run dev` (port **5173**) |

> **Important — current state of the system (verified 2026-10-15):**
>
> - The **backend is a complete, working REST API**. It was built, seeded, started and every endpoint was exercised successfully during the last verification session (see section 12).
> - The **frontend is fully integrated with the backend** (verified 2026-10-15): the contexts call the real API — registration/login (JWT), product catalog (loaded from the database), farmer product CRUD, checkout that creates real orders, buyer order history, and farmer order status updates. The `localStorage` keys `farmer_user`/`farmer_cart` only cache the session and the cart.
> - There are **no automated tests** in this project (no test framework, no test files). Section 12 explains how to test manually and with the build/type-check commands that do exist.

---

## 2. Architecture and Components

```
Browser (React SPA at http://localhost:5173)
   │
   │  HTTP fetch via axios (services/api.ts) + JWT from localStorage
   │
Express REST API (http://localhost:5000)
   │
   │  DATABASE_URL (SSL required)
   │
PostgreSQL (Docker `farmfoods-pg` on port 5433, or any PostgreSQL with SSL enabled)
```

- **Authentication:** JSON/Email+Password registration and login on the backend. Passwords are hashed with **bcrypt** (10 rounds). Login returns a **JWT** valid for 24 hours, sent as `Authorization: Bearer <token>`. Role-based guards (`buyer`, `farmer`, `admin`) are enforced server-side per route.
- **Database:** plain PostgreSQL accessed with the `pg` driver. No ORM, no migration tool — the schema is applied manually from two SQL files (section 7).
- **CORS:** the backend only accepts browser requests from `http://localhost:5173` (hard-coded in `backend/src/server.ts:14`).
- **Docker:** a `docker-compose.yml` exists but **cannot currently start** (the frontend has no Dockerfile and `backend/.env` must exist first) — see Known Limitations.

---

## 3. Prerequisites

| Requirement | Minimum version | Why | How to verify |
|---|---|---|---|
| **Node.js** | v18+ (v20+ recommended; Docker image uses node:20) | Runs the backend and frontend | `node --version` |
| **npm** | comes with Node.js | Installs dependencies | `npm --version` |
| **PostgreSQL** | 13+ (or a Neon account) | Backend database; `gen_random_uuid()` is used | Via your provider, or `docker --version` if using the Docker option |
| **psql** (only if not using Neon) | any recent | To apply the schema SQL files | `psql --version` |
| **Docker** (optional) | any recent | Easiest way to run a local PostgreSQL | `docker --version` |

> **Windows note (important):** on this machine, running `npm` in PowerShell fails with *"npm.ps1 cannot be loaded because running scripts is disabled"*. Use **`npm.cmd`** instead of `npm` in every command (e.g. `npm.cmd install`). All commands below use `npm.cmd`; if your system allows `npm`, either form works.

Verified environment for this README: Node v24.19.0, npm (bundled), Docker 29.x, PostgreSQL 16 (Docker) and PostgreSQL 18 (local service), Windows 11/PowerShell.

---

## 4. Project Directory Structure

```
CSE-Local-Farmers-to-Buyers-Marketplace2/
├── README.md                      ← this file
├── .gitignore
├── docs/                          ← system documentation, API notes, project tracker
└── farmer to market/              ← application root (NOTE: folder name contains spaces)
    ├── docker-compose.yml         ← Docker stack (currently incomplete — see Known Limitations)
    ├── backend/
    │   ├── package.json           ← scripts: dev / build / start / seed
    │   ├── .env.example           ← copy to .env
    │   ├── schema.sql             ← core database schema (users, products, orders)
    │   ├── schema.sql_subscriptions.sql  ← subscriptions table (apply second)
    │   └── src/
    │       ├── server.ts          ← entry point (Express, port 5000)
    │       ├── config/db.ts       ← PostgreSQL pool (requires DATABASE_URL, forces SSL)
    │       ├── controllers/       ← auth, product, order, subscription logic + SQL
    │       ├── routes/            ← /api/auth, /api/products, /api/orders, /api/subscriptions
    │       ├── middleware/authMiddleware.ts  ← JWT verification + role guards
    │       ├── models/            ← TypeScript enums/interfaces (UserRole, OrderStatus…)
    │       └── utils/             ← jwt.ts, seed.ts (test data seeder)
    └── frontend/
        ├── package.json           ← scripts: dev / build / preview / lint (lint broken)
        ├── vite.config.ts         ← Vite dev server (default port 5173)
        └── src/
            ├── App.tsx            ← routes: /, /products, /checkout, /account, /farmer/dashboard, /admin
            ├── context/           ← AuthContext (real JWT auth), CartContext (localStorage), ProductContext (real CRUD via API)
            ├── services/api.ts    ← axios client used by all contexts (JWT interceptor)
            ├── services/mappers.ts ← maps API rows (snake_case) to UI types
            ├── components/        ← UI (products, cart, auth, farmer, admin, common)
            └── pages/Account.tsx
```

---

## 5. Installation

Open a terminal in the repository root. Always quote the app folder because of the space in its name.

```powershell
# 1. Backend dependencies
cd "farmer to market/backend"
npm.cmd install

# 2. Frontend dependencies
cd "../frontend"
npm.cmd install
```

Both installs were verified working on 2026-10-15 (backend: 188 packages; frontend: includes the `axios` dependency added to fix the build).

---

## 6. Environment Configuration

Create the file `farmer to market/backend/.env` (a template is provided):

```powershell
cd "farmer to market/backend"
Copy-Item .env.example .env
# then edit .env with any text editor
```

`.env` must contain:

```env
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE
JWT_SECRET=some_long_random_string
```

| Variable | Required | Notes |
|---|---|---|
| `PORT` | No | Defaults to `5000` if omitted (`server.ts:12`). |
| `DATABASE_URL` | **Yes** | Full PostgreSQL connection string. **The server refuses to start without it** (`config/db.ts:7` throws immediately). |
| `JWT_SECRET` | Strongly recommended | Signs login tokens. If unset, an insecure built-in default (`default_secret_change_me`) is used — never use that outside local experiments. |

> **SSL requirement:** `config/db.ts` forces an SSL connection for every query. This matches **Neon** (add `?sslmode=require` to the URL). A *default* local PostgreSQL (SSL off) will fail — see "Database options" below and Troubleshooting.

### Database options

**Option A — Neon (cloud, as originally designed):** create a free project at neon.tech, copy the connection string (it already contains `sslmode=require`), and paste it as `DATABASE_URL`. *Not re-verified in the last test session; the same code path was verified against a local SSL-enabled PostgreSQL.*

**Option B — local PostgreSQL with SSL (verified 2026-10-15):** run PostgreSQL 16 in Docker with a self-signed certificate. These are the exact steps that were executed successfully:

```powershell
# 1. Start PostgreSQL (port 5433 so it won't clash with any existing 5432 install)
docker run -d --name farmfoods-pg `
  -e POSTGRES_PASSWORD=devpass -e POSTGRES_USER=farmdev -e POSTGRES_DB=farmfoods `
  -p 5433:5432 postgres:16-alpine

Start-Sleep -Seconds 10

# 2. Generate a self-signed certificate (uses Git for Windows' openssl)
$certs = "$env:TEMP\pgcert"; New-Item -ItemType Directory -Force $certs | Out-Null
& "C:\Program Files\Git\usr\bin\openssl.exe" req -new -x509 -days 365 -nodes `
  -out "$certs\server.crt" -keyout "$certs\server.key" -subj "/CN=localhost"

# 3. Install the certificate inside the container and enable SSL
docker cp "$certs\server.crt" farmfoods-pg:/var/lib/postgresql/data/server.crt
docker cp "$certs\server.key" farmfoods-pg:/var/lib/postgresql/data/server.key
docker exec -u root farmfoods-pg chown postgres:postgres /var/lib/postgresql/data/server.crt /var/lib/postgresql/data/server.key
docker exec -u root farmfoods-pg chmod 600 /var/lib/postgresql/data/server.key
docker exec farmfoods-pg psql -U farmdev -d farmfoods -c "ALTER SYSTEM SET ssl = on;"
docker exec farmfoods-pg psql -U farmdev -d farmfoods -c "ALTER SYSTEM SET ssl_cert_file = 'server.crt';"
docker exec farmfoods-pg psql -U farmdev -d farmfoods -c "ALTER SYSTEM SET ssl_key_file = 'server.key';"
docker restart farmfoods-pg
```

With Option B, your `.env` should use:

```env
DATABASE_URL=postgresql://farmdev:devpass@localhost:5433/farmfoods
```

---

## 7. Database Setup and Migrations

There is no migration tool. The schema is two SQL files that must be applied **in this order**, once, to the database named in `DATABASE_URL`.

**With Neon:** use the Neon SQL Editor, paste and run each file.

**With the Docker database from Option B:**

```powershell
cd "farmer to market/backend"
docker cp schema.sql farmfoods-pg:/tmp/schema.sql
docker cp schema.sql_subscriptions.sql farmfoods-pg:/tmp/schema_subscriptions.sql
docker exec farmfoods-pg psql -U farmdev -d farmfoods -v ON_ERROR_STOP=1 -f /tmp/schema.sql
docker exec farmfoods-pg psql -U farmdev -d farmfoods -v ON_ERROR_STOP=1 -f /tmp/schema_subscriptions.sql
```

**With any other local PostgreSQL:**

```powershell
psql "$env:DATABASE_URL" -v ON_ERROR_STOP=1 -f "farmer to market/backend/schema.sql"
psql "$env:DATABASE_URL" -v ON_ERROR_STOP=1 -f "farmer to market/backend/schema.sql_subscriptions.sql"
```

Expected result: `users`, `products`, `orders`, `subscriptions` tables plus 3 enum types.

### Seed test data

```powershell
cd "farmer to market/backend"
npm.cmd run seed
```

Expected output:

```
Starting database seeding...
Cleaned existing data.
Test users created.
Test products created.
Test order created.
Seeding completed successfully!
```

> **Warning:** seeding runs `TRUNCATE users, products, orders RESTART IDENTITY CASCADE`, which **deletes all existing users, products, orders and subscriptions** and recreates the demo rows. Only run it on a development database.

---

## 8. Running the Backend

Start order: **database first → backend second → frontend third.**

```powershell
# Terminal 1 — backend (leave this terminal open)
cd "farmer to market/backend"
npm.cmd run dev
```

`npm run dev` runs `ts-node-dev --respawn --transpile-only src/server.ts`.

**Expected successful startup message:**

```
Server is running on port 5000
```

*(If the message does not appear within a few seconds, check the Troubleshooting section — most likely `.env` is missing or `DATABASE_URL` is unset, which crashes the process immediately.)*

Production-style alternative:

```powershell
npm.cmd run build     # compiles TypeScript to dist/
npm.cmd start         # runs node dist/server.js
```

**Confirm the backend is up** (Terminal 2 or a browser):

```powershell
Invoke-RestMethod http://localhost:5000/
# → Farm Foods Marketplace API is running...
```

**Verify database connectivity:** the health text above does *not* touch the database. Query an endpoint that reads the DB:

```powershell
Invoke-RestMethod http://localhost:5000/api/products
# → returns the seeded products as JSON
```

If that returns products, backend → database connectivity (including SSL) is confirmed.

---

## 9. Running the Frontend

```powershell
# Terminal 2 — frontend (separate terminal, leave open)
cd "farmer to market/frontend"
npm.cmd run dev
```

**Expected output:**

```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in a browser. The storefront shows the **real products from the database** (browsing works without login). Both the backend (section 8) and PostgreSQL (section 6) must be running — the UI loads products from the API and shows a clear error if the API is unreachable.

The frontend talks to the backend through `frontend/src/services/api.ts` (axios client using `VITE_API_URL`, default `http://localhost:5000/api`). Every authenticated call attaches the JWT from `localStorage`. Real workflows in the UI:

- **Register/login** (header → Login) — accounts are stored in PostgreSQL; roles (buyer/farmer/admin) decide which dashboard appears.
- **Shop:** browse/filter/search products (with real images, prices, units and farmer names), add to cart, and check out — each cart item becomes a real order via `POST /api/orders`.
- **Farmer dashboard** (`/farmer/dashboard`): list/edit/remove your own produce (name, price, unit, stock, category, image URL), see real KPIs, and approve/fulfil/cancel incoming orders.
- **Account page:** shows your real order history and statuses.
- **Admin dashboard** (`/admin`): live catalog statistics and a read-only product table across all farmers.

Production build:

```powershell
npm.cmd run build     # tsc + vite build → dist/ (verified passing)
npm.cmd run preview   # serves the built app
```

> `npm.cmd run lint` **does not work** — the script references ESLint, which is not installed and has no config (Known Limitation).

---

## 10. Starting Additional Services

| Service | Mandatory? | How to start |
|---|---|---|
| **PostgreSQL** (Docker/local with SSL, or Neon) | **Mandatory** | Local Docker: section 6, Option B |
| Backend API | **Mandatory** (the UI loads all data from it) | Section 8 |
| Frontend dev server | **Mandatory** for UI testing | Section 9 |
| Redis, queues, workers, AI services, hardware | **None required** | not present in this project |
| Docker Compose stack | **Does not currently work** | see Known Limitations |

---

## 11. Test Accounts and Login Credentials

### 11.1 Backend / database accounts (created by `npm run seed`)

These are **development-only** accounts stored (as bcrypt hashes) in the database by `backend/src/utils/seed.ts`. They were **verified by real logins** on 2026-10-15 against the running API.

| Role | Test ID / Username | Email | Password | Purpose |
|---|---|---|---|---|
| Farmer | `test_farmer` | `farmer@example.com` | `password123` | Seeded with 4 products: product CRUD, incoming orders, order status updates |
| Farmer | `green_valley_farm` | `farmer2@example.com` | `password123` | Second farmer with 3 products — demonstrates the multi-farmer marketplace |
| Buyer | `test_buyer` | `buyer@example.com` | `password123` | Place orders, view own orders on the Account page |
| Buyer | `hungry_restaurant` | `buyer2@example.com` | `password123` | Second buyer account |
| Administrator | `test_admin` | `admin@example.com` | `password123` | Access to `/admin` dashboard (read-only catalog stats); the backend exposes **no admin-only endpoints** |

All five accounts work **in both the API and the UI login modal**. Database UUIDs are generated per seed — log in with the email, never the UUID.

These credentials exist **only in development databases you seed yourself**. Never seed or reuse them against production. To reset them at any time: re-run `npm run seed` (this deletes all other data).

### 11.2 Logging in from the UI

The login modal calls the real API (`POST /api/auth/login`). Use the accounts in 11.1 — wrong credentials show a "Invalid email or password" error. Registration (`POST /api/auth/register`) creates a real database account and logs you in immediately; the role chosen at registration (buyer/farmer) decides which dashboard you get.

---

## 12. How to Test the Application

### 12.1 Log in with the test accounts (backend)

Start the backend (section 8), then in a second terminal:

```powershell
# Farmer login
Invoke-RestMethod -Uri http://localhost:5000/api/auth/login -Method Post `
  -ContentType "application/json" `
  -Body '{"email":"farmer@example.com","password":"password123"}'
# → returns { token = "...", user = { id, username, role, email } }
```

A wrong password returns **HTTP 401** `{ "message": "Invalid credentials" }` (verified).

### 12.2 Test each role through the API (verified 2026-10-15)

Save a token once, then call the role-protected endpoints:

```powershell
$base = "http://localhost:5000"
$farmer = Invoke-RestMethod "$base/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"farmer@example.com","password":"password123"}'
$buyer  = Invoke-RestMethod "$base/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"buyer@example.com","password":"password123"}'
$hf = @{ Authorization = "Bearer $($farmer.token)" }
$hb = @{ Authorization = "Bearer $($buyer.token)" }

# Public
Invoke-RestMethod "$base/api/products"                       # list products (works without login)
Invoke-RestMethod "$base/api/auth/me" -Headers $hf           # current user (farmer)

# Farmer-only
$np = Invoke-RestMethod "$base/api/products" -Method Post -Headers $hf -ContentType "application/json" `
        -Body '{"name":"Test Carrots","description":"fresh","price":1.75,"unit":"kg","stock_quantity":10,"category":"Vegetables","image_url":"https://example.com/c.jpg"}'
Invoke-RestMethod "$base/api/products/$($np.id)" -Method Put -Headers $hf -ContentType "application/json" `
        -Body '{"name":"Test Carrots XL","description":"fresh","price":2.0,"unit":"kg","stock_quantity":8,"category":"Vegetables","image_url":"x"}'
Invoke-RestMethod "$base/api/orders/farmer" -Headers $hf     # incoming orders
Invoke-RestMethod "$base/api/subscriptions/status" -Headers $hf
Invoke-RestMethod "$base/api/subscriptions/subscribe" -Method Post -Headers $hf -ContentType "application/json" -Body '{"plan":"monthly_basic"}'

# Buyer-only
Invoke-RestMethod "$base/api/orders" -Method Post -Headers $hb -ContentType "application/json" -Body (@{productId=$np.id;quantity=2}|ConvertTo-Json)
Invoke-RestMethod "$base/api/orders/buyer" -Headers $hb
```

Expected results from the verification session:

| Check | Expected |
|---|---|
| Farmer login + `/api/auth/me` | 200, user `test_farmer`, role `farmer` |
| Buyer places order | 201 with order JSON, `status=pending`, `total_price` = price × quantity; product stock decreases |
| Buyer calls `/api/orders/farmer` | **403** (wrong role) |
| Request without token to `/api/auth/me` | **401** |
| Duplicate registration | **400** "Username or email already exists" |
| Registration with invalid role | **400** "Invalid role provided" |
| Subscribe `monthly_basic` | 201, `end_date` ≈ one month ahead |
| Subscription status before subscribing | `{ "active": false, ... }` |

### 12.3 Verify frontend ↔ backend communication

The UI is fully wired to the API. With the database, backend and frontend all running:

1. Browse http://localhost:5173 — the product grid shows the seeded products (with images and farmer names) loaded from `GET /api/products`.
2. Log in as `farmer@example.com` / `password123` → header shows the name, "My Farm" link appears.
3. Log in as `buyer@example.com` / `password123` → add a product to the cart, check out → the order appears on the Account page and in the farmer's dashboard (status `pending`).
4. As the farmer, Approve/Mark Fulfilled the order — the buyer's Account page updates the status.

If the backend is stopped, the product grid shows "Cannot reach the backend API" instead of products.

### 12.4 Verify database operations

```powershell
# After placing an order via the API, inspect the database directly (Docker option):
docker exec farmfoods-pg psql -U farmdev -d farmfoods -c "SELECT username, email, role FROM users;"
docker exec farmfoods-pg psql -U farmdev -d farmfoods -c "SELECT name, price, stock_quantity FROM products;"
docker exec farmfoods-pg psql -U farmdev -d farmfoods -c "SELECT status, quantity, total_price FROM orders;"
```

Rows created through the API appear here — that is the end-to-end database check.

### 12.5 Test important features manually in the UI

With the database, backend **and** frontend running, open http://localhost:5173:

1. **Browse/filter/search** products on the home page (real data, images, prices like `R2.50 / kg`); open a product detail modal.
2. **Register/login** via the header button using a test account (11.1), or register a new account and pick a role.
3. **Buyer flow:** add items to the cart, run the 4-step checkout — real orders are created; watch them appear under **My Orders** on the Account page.
4. **Farmer flow:** log in as a farmer → `/farmer/dashboard` → "List Produce" (real create with image preview), edit price/stock, remove listings, and use Approve/Cancel/Mark Fulfilled on incoming orders.
5. **Admin flow:** log in as `admin@example.com` → `/admin` shows live catalog statistics and every product with its farmer.

### 12.6 Automated tests

**There are no automated tests in this project** — no test framework, no test files, no `test` script in either `package.json`. Do not expect `npm test` to exist. The closest available checks are the build/type-check commands below, which act as regression tests for the code itself:

```powershell
# Backend: type-check + compile (verified passing, exit 0)
cd "farmer to market/backend";  npm.cmd run build

# Frontend: type-check + production build (verified passing, exit 0)
cd "farmer to market/frontend"; npm.cmd run build

# Frontend: type-check only
cd "farmer to market/frontend"; npx.cmd tsc --noEmit
```

Failures print TypeScript errors with file/line references. Recommended future work: Jest + Supertest for the API, Vitest + React Testing Library for the UI.

### 12.7 Reset the local test environment

```powershell
# Wipe and rebuild schema (Docker option shown)
docker exec farmfoods-pg psql -U farmdev -d farmfoods -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
cd "farmer to market/backend"
docker cp schema.sql farmfoods-pg:/tmp/schema.sql
docker cp schema.sql_subscriptions.sql farmfoods-pg:/tmp/schema_subscriptions.sql
docker exec farmfoods-pg psql -U farmdev -d farmfoods -v ON_ERROR_STOP=1 -f /tmp/schema.sql
docker exec farmfoods-pg psql -U farmdev -d farmfoods -v ON_ERROR_STOP=1 -f /tmp/schema_subscriptions.sql
npm.cmd run seed
```

For the UI, clearing the browser's `localStorage` (keys `farmer_user`, `farmer_cart`) logs you out and empties the cart.

---

## 13. API Endpoints and Health Checks

Base URL: `http://localhost:5000` — the API prefix is `/api`.

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Health text: `Farm Foods Marketplace API is running...` |
| POST | `/api/auth/register` | Public | Body `{username, email, password, role}`; role ∈ `buyer`\|`farmer`\|`admin`; 201 + user |
| POST | `/api/auth/login` | Public | Body `{email, password}`; 200 + `{token, user}` or 401 |
| GET | `/api/auth/me` | Any authenticated user | Current user profile |
| GET | `/api/products` | Public | Supports `?category=` and `?search=` filters |
| GET | `/api/products/:id` | Public | Single product or 404 |
| POST | `/api/products` | Farmer only | Create product |
| PUT | `/api/products/:id` | Farmer only (owner) | Update own product |
| DELETE | `/api/products/:id` | Farmer only (owner) | Delete own product |
| POST | `/api/orders` | Buyer only | Body `{productId, quantity}`; 201, or 400 insufficient stock, or 404 |
| GET | `/api/orders/buyer` | Buyer only | Own orders (with product name) |
| GET | `/api/orders/farmer` | Farmer only | Incoming orders (with product + buyer name) |
| PATCH | `/api/orders/:id/status` | Farmer only (owner) | Body `{status}` (`pending`\|`approved`\|`fulfilled`\|`cancelled`) |
| GET | `/api/subscriptions/status` | Farmer only | Latest subscription and whether it is active |
| POST | `/api/subscriptions/subscribe` | Farmer only | Body `{plan}` ∈ `monthly_basic`\|`yearly_premium` |

**Health checks:**

```powershell
Invoke-RestMethod http://localhost:5000/                 # server up (no DB check)
Invoke-RestMethod http://localhost:5000/api/products     # server + database + SSL OK
```

Full endpoint reference with examples: `docs/SERVER_API_DOCUMENTATION.md`.

---

## 14. Troubleshooting

| Problem | Likely cause / how to diagnose | Fix |
|---|---|---|
| `npm : File ... npm.ps1 cannot be loaded` | PowerShell execution policy blocks `npm.ps1` | Use `npm.cmd` / `npx.cmd` instead of `npm` / `npx` |
| Backend exits immediately: `DATABASE_URL environment variable is not defined` | `backend/.env` missing or has no `DATABASE_URL` (`config/db.ts:7`) | Create `.env` from `.env.example` (section 6) and restart |
| Backend starts but DB queries fail | Wrong credentials, DB not running, or **server does not support SSL** | Confirm the URL/credentials; the backend always forces SSL — use Neon, or enable SSL on your local server (section 6, Option B). A plain `docker run postgres` **without** the SSL steps will fail |
| `Error: listen EADDRINUSE :::5000` | Another process occupies port 5000 | `netstat -ano | findstr :5000`, stop that PID, or set `PORT=5001` in `.env` (restart backend; frontend default URL is still 5000 — adjust `VITE_API_URL` if changed) |
| Seed fails with `relation "users" does not exist` | Schema not applied | Apply `schema.sql` then `schema.sql_subscriptions.sql` (section 7), re-run `npm run seed` |
| Subscription endpoints return 500 | `schema.sql_subscriptions.sql` never applied | Apply that file (section 7) |
| `401 Invalid credentials` on login | Wrong password, or database was re-seeded/truncated | Log in with the seeded emails + `password123`, or re-run `npm run seed` |
| `400 Username or email already exists` on register | Unique constraint | Choose another username/email, or log in instead |
| CORS error in browser (`Access-Control-Allow-Origin`) | Requesting from an origin other than `http://localhost:5173` | Use the Vite URL, or extend the CORS config in `backend/src/server.ts:14` |
| Frontend `npm run dev` fails or blank page | Dependency or import errors | `npm.cmd install`; if components were edited, check the browser console and `npx.cmd tsc --noEmit` |
| Frontend `npm run build` type errors | Broken imports/types | This was fixed on 2026-10-15 (see section 18); re-check with `npx.cmd tsc --noEmit` |
| `npm run lint` fails with "eslint: not found" | ESLint is not installed (script is aspirational) | Ignore, or add ESLint + a config as future work |
| `docker-compose up` fails | No `frontend/Dockerfile`; `backend/.env` must exist; builds `./frontend` which cannot build | Run the two apps directly with `npm.cmd run dev` (sections 8–9) instead |
| Deleting a product that has orders | Foreign key on `orders.product_id` prevents deletion | The API now returns **400** "Cannot delete this product because it has existing orders." — delete/complete the orders first, or keep the listing |
| Empty product list / empty dashboards after seeding | The backend is not running, or the DB was not seeded | Start the backend (section 8); the UI shows a "Cannot reach the backend API" error banner if the API is down |

---

## 15. Stopping the Application

- Stop the **backend** and **frontend** terminals with `Ctrl + C` in each.
- Stop (or remove) the local Docker database if you used Option B:

```powershell
docker stop farmfoods-pg            # keep data for next time
# or remove it completely:
docker rm -f farmfoods-pg
```

---

## 16. Resetting the Development/Test Environment

See section 12.7. Short version: drop/recreate the schema, re-apply the two `.sql` files, then `npm.cmd run seed` in `backend/`. For the UI, clear `localStorage`.

---

## 17. Security Notes

- All seeded passwords are **bcrypt hashes**; plaintext passwords exist only in `seed.ts`/this README as clearly-labelled dev credentials.
- **Never** seed or reuse `password123` accounts outside development; **never** commit `backend/.env` (a root `.gitignore` now excludes it).
- Always set a strong `JWT_SECRET`; the built-in fallback is insecure.
- SQL uses parameterised queries throughout (injection-safe by construction).
- CORS is locked to `http://localhost:5173`; broaden it only deliberately.
- The backend has no rate limiting, no password reset, and minimal input validation — fine for coursework/dev, not production.
- Historical note: `node_modules` folders are committed in this repository (there was no `.gitignore` originally). A `.gitignore` was added; removing the already-committed `node_modules` from git history is recommended future work.

---

## 18. Known Limitations

1. **`data/mockData.ts` is now unused legacy code** — the UI reads all data from the API; the file can be deleted in a cleanup pass.
2. **No automated tests.** Only `npm run build` / `tsc --noEmit` guard against regressions.
3. **`docker-compose.yml` cannot start** — the frontend has no Dockerfile and `backend/.env` must be provided first.
4. **`npm run lint` is unusable** — ESLint is not installed and no config exists.
5. **Subscriptions live in a separate schema file** that is easy to forget; the admin role exists in the DB but there are **no admin API endpoints** — the `/admin` dashboard is read-only (catalog stats and product table).
6. **Order creation is not transactional** (stock check + insert + decrement are separate queries — concurrent orders can oversell).
7. **No input validation** on product/order endpoints; status update accepts any string; no logging or global error handler.
8. **Committed `node_modules`** and empty placeholder files (`Order`, `Profile`) in `farmer to market/`.
9. Minor UI inconsistencies (mixed `$`/`R` currency symbols).

### Changes made for reliable setup (2026-10-15)

| Change | Why |
|---|---|
| Fixed 6 broken `../types` → `../../types` imports (ProductCard, ProductDetailModal, CartItem, FarmerOrders, FarmerProductList, ProductManagementTable) | They prevented `tsc`/the app from working at all |
| Added `axios` to frontend dependencies; added `src/vite-env.d.ts` | `services/api.ts` imported axios (undeclared) and used `import.meta.env` untyped — build failed |
| Fixed small type errors (unused `Farmer` icon import, `Address.state` → `province`, `nextSibling` focus cast, `AuthContext` role typing) | `npm run build` for the frontend now passes |
| Added a `test_admin` account to `backend/src/utils/seed.ts` | The `admin` role existed in the schema but no admin account was ever seeded |
| Added `backend/.env.example` and root `.gitignore` | Documented configuration; prevents committing `.env` |

All of the above were verified: backend build passes, seed succeeds, every API endpoint tested live, frontend type-check and production build pass, frontend dev server serves HTTP 200.
