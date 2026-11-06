# Server API Documentation - Farm Foods Marketplace Backend

**Document version:** 2.0
**Updated:** 2026-10-15
**Source of truth:** `farmer to market/backend/src/**`.
**Status of verification:** The backend was **executed** on 2026-10-15 against a local PostgreSQL database (Docker `farmfoods-pg`, port 5433, SSL enabled) after `npm run build` and `npm run seed`. The core flows (register, login, product create, order create, order status update, buyer/farmer listings, product delete) were exercised over HTTP. Endpoints exercised are marked `VERIFIED`; the subscription endpoints were not executed and remain `IMPLEMENTED, NOT VERIFIED`. Section 7 records the observed results.

---

## 1. Interface type

The application exposes **one server-side interface: an HTTP/JSON REST API** built with Express.

There is **no** TCP socket protocol, **no** serial/RS-232 interface, **no** WebSocket, **no** MQTT/gRPC, and **no** hardware or firmware integration anywhere in the repository. The database is accessed directly by the backend through the `pg` driver (documented in section 5 as an internal interface, not a public API).

- Base URL (development): `http://localhost:5000`
- API prefix: `/api`
- Content type: `application/json` (request and response), except `GET /` which returns plain text.
- CORS: only `http://localhost:5173` is allowed (`backend/src/server.ts:14`). Verified working from the SPA.
- Authentication: JWT bearer tokens.
- Global body parser: `express.json()`.
- Database: PostgreSQL. Verified locally with Docker (`farmfoods-pg`, port 5433, SSL on); Neon (serverless) is also supported.

---

## 2. Authentication and authorization

Implemented in `backend/src/utils/jwt.ts` and `backend/src/middleware/authMiddleware.ts`.

- On login, a JWT is signed (`HS256` default) containing `{ id, username, role }`, expiring in **24h**.
- Protected routes require header: `Authorization: Bearer <token>`.
- Missing/malformed header -> `401 { "message": "Authentication token missing" }`.
- Invalid/expired token -> `401 { "message": "Invalid or expired token" }`.
- Role guard `ensureRole` -> `403 { "message": "Access denied: Insufficient permissions" }`.
- Roles: `buyer`, `farmer`, `admin` (enum `user_role`).
- The JWT secret is read from `JWT_SECRET`; if unset, the code falls back to `default_secret_change_me` (`utils/jwt.ts:6`). **This is a security risk.**

| Route group | Auth required | Roles allowed |
|---|---|---|
| `POST /api/auth/register`, `POST /api/auth/login` | No | any |
| `GET /api/auth/me` | Yes | any authenticated |
| `GET /api/products`, `GET /api/products/:id` | No | any |
| `POST/PUT/DELETE /api/products...` | Yes | farmer |
| `POST /api/orders` | Yes | buyer |
| `GET /api/orders/buyer` | Yes | buyer |
| `GET /api/orders/farmer` | Yes | farmer |
| `PATCH /api/orders/:id/status` | Yes | farmer |
| `GET /api/subscriptions/status` | Yes | farmer |
| `POST /api/subscriptions/subscribe` | Yes | farmer |

---

## 3. Endpoint reference

Route files: `backend/src/routes/*.ts`. Controller files: `backend/src/controllers/*.ts`.

### 3.1 Health / root

#### `GET /`
- Purpose: simple liveness text response.
- Auth: none.
- Response: `200 text/html` -> `Farm Foods Marketplace API is running...`
- Source: `backend/src/server.ts:23-25`.

---

### 3.2 Auth (`/api/auth`) - `routes/authRoutes.ts`

#### `POST /api/auth/register`
- Purpose: create a user.
- Auth: none.
- Request body:

| Field | Type | Required | Notes |
|---|---|---|---|
| username | string | yes | unique (`users.username`) |
| email | string | yes | unique (`users.email`) |
| password | string | yes | hashed with bcrypt (10 rounds); no complexity rule |
| role | string | yes | must be `buyer`, `farmer` or `admin` |

Illustrative request:
```json
{ "username": "jane", "email": "jane@example.com", "password": "secret123", "role": "buyer" }
```
- Responses:
  - `201` -> `{ "id": "<uuid>", "username": "jane", "email": "jane@example.com", "role": "buyer" }`
  - `400 { "message": "All fields are required" }` when a field is missing.
  - `400 { "message": "Invalid role provided" }` when role is not a valid enum value.
  - `400 { "message": "Username or email already exists" }` on Postgres unique violation (code `23505`).
  - `500 { "message": "Internal server error" }` otherwise.
- Validation: field presence + role enum only. No email format, username length, or password strength checks.
- Side effects: inserts one row into `users`.
- Source: `controllers/authController.ts:7-32`.

#### `POST /api/auth/login`
- Purpose: authenticate and obtain a JWT.
- Auth: none.
- Request body:

| Field | Type | Required |
|---|---|---|
| email | string | yes |
| password | string | yes |

Illustrative request:
```json
{ "email": "jane@example.com", "password": "secret123" }
```
- Responses:
  - `200` -> `{ "token": "<jwt>", "user": { "id": "<uuid>", "username": "jane", "role": "buyer", "email": "jane@example.com" } }`
  - `401 { "message": "Invalid credentials" }` if user not found or password mismatch.
  - `500 { "message": "Internal server error" }`.
- Validation: none on field presence (missing email simply fails lookup).
- Side effects: none.
- Source: `controllers/authController.ts:34-50`.

#### `GET /api/auth/me`
- Purpose: return the current authenticated user.
- Auth: bearer token required.
- Responses:
  - `200` -> `{ "id": "<uuid>", "username": "jane", "email": "jane@example.com", "role": "buyer" }`
  - `401` per middleware.
  - `500` on query failure.
- Note: if the token's user id no longer exists, `result.rows[0]` is `undefined` and the handler returns `200` with an empty body (`authController.ts:56`).
- Source: `controllers/authController.ts:52-60`.

---

### 3.3 Products (`/api/products`) - `routes/productRoutes.ts`

All product responses return **raw database columns (snake_case)**: `id, farmer_id, name, description, price, unit, stock_quantity, category, image_url, created_at, updated_at`. Since 2026-10-15, `GET` responses also include the seller name as **`farmer_name`** (from a `LEFT JOIN users`), which the UI displays as "Sold by …".

#### `GET /api/products`
- Purpose: list products with optional filtering.
- Auth: none.
- Query parameters:

| Param | Type | Required | Behaviour |
|---|---|---|---|
| category | string | no | `category ILIKE '%value%'` |
| search | string | no | `name ILIKE '%value%' OR description ILIKE '%value%'` |

- Responses: `200` -> JSON array of product rows with `farmer_name` (possibly empty). `500` on error.
- Illustrative request: `GET /api/products?category=veg&search=tomato`
- Verified: returns the 7 seeded products, each with `farmer_name` (`test_farmer`, `green_valley_farm`).
- Source: `controllers/productController.ts:4-26`.

#### `GET /api/products/:id`
- Purpose: retrieve one product.
- Auth: none.
- Path param: `id` (UUID).
- Responses:
  - `200` -> product row (with `farmer_name`).
  - `404 { "message": "Product not found" }`.
  - `500` on error (e.g. malformed UUID raises a query error -> `500`).
- Source: `controllers/productController.ts:28-39`.

#### `POST /api/products`
- Purpose: create a product owned by the calling farmer.
- Auth: bearer token, role `farmer`.
- Request body:

| Field | Type | Required | Notes |
|---|---|---|---|
| name | string | effectively yes | DB NOT NULL; no code check |
| description | string | no | - |
| price | number | effectively yes | DB NOT NULL |
| unit | string | effectively yes | DB NOT NULL |
| stock_quantity | integer | effectively yes | DB CHECK `>= 0` |
| category | string | no | - |
| image_url | string | no | - |

`farmer_id` is taken from the JWT, **not** from the body.

Illustrative request:
```json
{ "name": "Tomatoes", "description": "Fresh", "price": 2.5, "unit": "kg", "stock_quantity": 50, "category": "Vegetables", "image_url": "https://example.com/t.jpg" }
```
- Responses:
  - `201` -> created product row.
  - `401/403` per middleware.
  - `500` on DB error (missing NOT NULL fields, or missing/absent columns -> generic `500`).
- Validation: none in controller; only DB constraints apply.
- Side effects: inserts one row into `products`.
- Source: `controllers/productController.ts:41-54`.

#### `PUT /api/products/:id`
- Purpose: full update of a product owned by the calling farmer.
- Auth: bearer token, role `farmer`.
- Path param: `id` (UUID).
- Request body: same fields as create (`name, description, price, unit, stock_quantity, category, image_url`).
- Ownership: `WHERE id = $8 AND farmer_id = $9` - a farmer can only update their own products.
- Responses:
  - `200` -> updated row.
  - `404 { "message": "Product not found or unauthorized" }` if no row matched (missing or not owned).
  - `401/403`, `500` as usual.
- Note: this is a full replace, not a partial (PATCH) update.
- Source: `controllers/productController.ts:56-73`.

#### `DELETE /api/products/:id`
- Purpose: delete a product owned by the calling farmer.
- Auth: bearer token, role `farmer`.
- Responses:
  - `200 { "message": "Product deleted successfully" }`.
  - `404 { "message": "Product not found or unauthorized" }`.
  - `400 { "message": "Cannot delete this product because it has existing orders." }` when the product is referenced by an order.
- Side effects: deletes the row. Because `orders.product_id` references `products(id)` **without** `ON DELETE CASCADE` (`schema.sql:36`), deleting a product that has orders raises a foreign-key error (Postgres `23503`). Since 2026-10-15 this is caught and mapped to a **`400`** with a clear message (previously a generic `500`).
- Source: `controllers/productController.ts:75-91`.

---

### 3.4 Orders (`/api/orders`) - `routes/orderRoutes.ts`

#### `POST /api/orders`
- Purpose: place an order (buyer) for a single product.
- Auth: bearer token, role `buyer`.
- Request body:

| Field | Type | Required | Notes |
|---|---|---|---|
| productId | string (UUID) | yes | must exist in `products` |
| quantity | integer | yes | must be > 0 |

Illustrative request:
```json
{ "productId": "3f2b...uuid", "quantity": 2 }
```
- Logic (`orderController.ts:4-36`):
  1. Load product; if absent -> `404 { "message": "Product not found" }`.
  2. If `product.stock_quantity < quantity` -> `400 { "message": "Insufficient stock" }`.
  3. `totalPrice = product.price * quantity`.
  4. Insert order with `status = 'pending'` and `farmer_id = product.farmer_id`.
  5. Decrement `products.stock_quantity` by quantity.
- Responses: `201` -> created order row. `400/404` as above. `401/403`. `500`.
- Side effects: inserts `orders` row; updates `products.stock_quantity`.
- Known limitations:
  - **No transaction** - steps 4 and 5 are separate statements; a failure between them leaves stock/order inconsistent, and concurrent requests can oversell.
  - No validation that `quantity` is a positive integer (relies on DB CHECK `quantity > 0`; a non-integer will surface as `500`).
  - No check that buyer and farmer differ.
- Source: `controllers/orderController.ts:4-36`.

#### `GET /api/orders/buyer`
- Purpose: list the calling buyer's orders.
- Auth: bearer token, role `buyer`.
- Response: `200` -> array of order rows each augmented with `product_name` (JOIN on `products`), ordered by `created_at DESC`.
- Source: `controllers/orderController.ts:38-49`.

#### `GET /api/orders/farmer`
- Purpose: list orders received by the calling farmer.
- Auth: bearer token, role `farmer`.
- Response: `200` -> array of order rows each augmented with `product_name` and `buyer_name` (JOINs on `products` and `users`), ordered by `created_at DESC`.
- Source: `controllers/orderController.ts:51-62`.

#### `PATCH /api/orders/:id/status`
- Purpose: update order status (farmer).
- Auth: bearer token, role `farmer`.
- Path param: `id` (UUID).
- Request body:

| Field | Type | Required | Valid values |
|---|---|---|---|
| status | string | yes | Should be one of `pending, approved, fulfilled, cancelled` (DB enum) but **not validated in code**. An invalid value raises a DB error -> `500`. |

Illustrative request:
```json
{ "status": "approved" }
```
- Ownership: `WHERE id = $2 AND farmer_id = $3`.
- Responses:
  - `200` -> updated order row.
  - `404 { "message": "Order not found or unauthorized" }`.
  - `401/403`, `500`.
- Side effects: updates `orders.status`, `orders.updated_at`.
- Source: `controllers/orderController.ts:64-81`.

---

### 3.5 Subscriptions (`/api/subscriptions`) - `routes/subscriptionRoutes.ts`

> Dependency warning: these endpoints query the `subscriptions` table and `subscription_plan` enum, which are defined **only** in `backend/schema.sql_subscriptions.sql` - a file separate from the main `schema.sql`. If that file has not been applied, both endpoints return `500`.

#### `GET /api/subscriptions/status`
- Purpose: report the farmer's most recent subscription.
- Auth: bearer token, role `farmer`.
- Response:
  - If no rows: `200 { "active": false, "message": "No active subscription found" }`.
  - Else: `200 { "active": <boolean>, "subscription": <row> }` where `active = end_date > now`.
- Note: "active" is computed from `end_date` only; `status` column is not consulted here.
- Source: `controllers/subscriptionController.ts:4-20`.

#### `POST /api/subscriptions/subscribe`
- Purpose: create a subscription for the calling farmer.
- Auth: bearer token, role `farmer`.
- Request body:

| Field | Type | Required | Valid values |
|---|---|---|---|
| plan | string | yes | `monthly_basic` or `yearly_premium` |

- Logic: invalid plan -> `400 { "message": "Invalid subscription plan" }`. Otherwise computes `end_date` = now + 1 month (`monthly_basic`) or now + 1 year (`yearly_premium`) and inserts with default `status = 'active'`.
- Responses: `201` -> created subscription row. `400`, `401/403`, `500`.
- Known limitations: **no payment processing** is implemented - subscribing is free/unchecked; multiple concurrent active subscriptions are possible (no uniqueness constraint).
- Source: `controllers/subscriptionController.ts:22-46`.

---

## 4. Summary table of endpoints

| Method | Path | Auth | Role | Success | Common errors |
|---|---|---|---|---|---|
| GET | `/` | no | - | 200 text | - |
| POST | `/api/auth/register` | no | - | 201 | 400, 500 |
| POST | `/api/auth/login` | no | - | 200 | 401, 500 |
| GET | `/api/auth/me` | yes | any | 200 | 401, 500 |
| GET | `/api/products` | no | - | 200 | 500 |
| GET | `/api/products/:id` | no | - | 200 | 404, 500 |
| POST | `/api/products` | yes | farmer | 201 | 401, 403, 500 |
| PUT | `/api/products/:id` | yes | farmer | 200 | 401, 403, 404, 500 |
| DELETE | `/api/products/:id` | yes | farmer | 200 | 400 (has orders), 401, 403, 404, 500 |
| POST | `/api/orders` | yes | buyer | 201 | 400, 401, 403, 404, 500 |
| GET | `/api/orders/buyer` | yes | buyer | 200 | 401, 403, 500 |
| GET | `/api/orders/farmer` | yes | farmer | 200 | 401, 403, 500 |
| PATCH | `/api/orders/:id/status` | yes | farmer | 200 | 401, 403, 404, 500 |
| GET | `/api/subscriptions/status` | yes | farmer | 200 | 401, 403, 500 |
| POST | `/api/subscriptions/subscribe` | yes | farmer | 201 | 400, 401, 403, 500 |

---

## 5. Database interface (internal)

The backend talks to PostgreSQL via `pg.Pool` (`backend/src/config/db.ts`). This is an internal interface, not exposed to clients. Tables (from `backend/schema.sql`):

- `users(id uuid pk, username unique, email unique, password_hash, role user_role, created_at, updated_at)`
- `products(id uuid pk, farmer_id fk users, name, description, price, unit, stock_quantity check>=0, category, image_url, created_at, updated_at)`
- `orders(id uuid pk, buyer_id fk users, farmer_id fk users, product_id fk products, quantity check>0, total_price, status order_status default 'pending', created_at, updated_at)`
- `subscriptions(...)` (only in `schema.sql_subscriptions.sql`)

Enums: `user_role ('buyer','farmer','admin')`, `order_status ('pending','approved','fulfilled','cancelled')`, `subscription_plan ('monthly_basic','yearly_premium')`.

All queries are parameterised (`$1..$n`), so no direct SQL-injection surface was found.

---

## 6. What was NOT found

- No OpenAPI/Swagger specification exists in the repository. Behaviour is still intentionally loose in places (unvalidated order status, no field validation, non-transactional orders), so a machine-readable spec is deferred until validation is hardened.
- No rate limiting, request logging, health-check endpoint (beyond `GET /`), API versioning, or pagination.
- No admin endpoints (despite an `admin` role and admin UI).
- No file/upload endpoints.
- No WebSocket / server-sent events.
- No password reset / OTP verification endpoint.

Note: the frontend **does** now consume this API (auth, catalog, farmer CRUD, orders). See `SYSTEM_DOCUMENTATION.md`.

---

## 7. Verification results (2026-10-15)

Environment: backend built (`npm run build`, exit 0), seeded (`npm run seed`), started on port 5000; PostgreSQL via Docker (`farmfoods-pg`, port 5433, SSL on). Requests sent over HTTP with `Content-Type: application/json` and `Origin: http://localhost:5173`.

| Step | Request | Observed result | Status |
|---|---|---|---|
| Health | `GET /api/products` | `200` array of 7 products (each with `farmer_name`) | VERIFIED |
| Register | `POST /api/auth/register` (farmer) | `201` user row | VERIFIED |
| Login | `POST /api/auth/login` | `200 { token, user }` | VERIFIED |
| Create product | `POST /api/products` (farmer token) | `201` created row | VERIFIED |
| Place order | `POST /api/orders` (buyer token, `quantity=3`) | `201 status=pending total_price=R13.50` | VERIFIED |
| Update status | `PATCH /api/orders/:id/status { "status":"approved" }` | `200 status=approved` | VERIFIED |
| Buyer orders | `GET /api/orders/buyer` | `200` array (with `product_name`) | VERIFIED |
| Farmer orders | `GET /api/orders/farmer` | `200` array (with `product_name`, `buyer_name`) | VERIFIED |
| Delete product (has orders) | `DELETE /api/products/:id` | `400` "Cannot delete this product because it has existing orders." | VERIFIED |
| Subscriptions | `/api/subscriptions/*` | Not executed this session | NOT VERIFIED |

Seed data present after `npm run seed`: 2 farmers (`test_farmer`/`farmer@example.com`, `green_valley_farm`/`farmer2@example.com`), 2 buyers (`test_buyer`/`buyer@example.com`, `hungry_restaurant`/`buyer2@example.com`), 1 admin (`test_admin`/`admin@example.com`), 7 products with image URLs, 2 sample orders. All passwords: `password123`.

## 8. Related tests

No test files, test frameworks, or test configuration exist in the repository. The results in section 7 are **manual** verification. Automated tests are recommended (Jest + Supertest for the API).
