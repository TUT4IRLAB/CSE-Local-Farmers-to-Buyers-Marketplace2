# System Documentation - CSE Local Farmers to Buyers Marketplace

**Document version:** 2.0
**Updated:** 2026-10-15
**Commit basis:** working tree after the frontend↔backend integration (uncommitted changes on top of `7724b1a`)
**Verification status:** The backend was built, seeded, started and every endpoint was exercised against a real PostgreSQL database. The frontend compiles (`tsc` + `vite build`) and is fully wired to the API. Runtime claims are marked **Verified** with the evidence observed on 2026-10-15.

> Change history: v1.0 (2026-10-14) initial generation from static source inspection. v2.0 (2026-10-15) updated after the system was run end-to-end and the frontend was integrated with the backend.

---

## 1. Title page

| | |
|---|---|
| System name | CSE-Local-Farmers-to-Buyers-Marketplace2 |
| In-product name | "Farmer Market" / "Farm Foods Marketplace" |
| Document | System Documentation |
| Version | 2.0 |
| Date | 2026-10-15 |
| Prepared by | Automated source inspection + live execution of backend, database and frontend build |
| Audience | Developers, maintainers, reviewers |

---

## 2. System overview

The system connects small-scale farmers directly with local buyers (households, small restaurants) so farmers can sell beyond their immediate area and buyers can source local produce.

The repository contains **two integrated parts**:

1. **Backend REST API** (`farmer to market/backend`) - an Express + TypeScript server with PostgreSQL persistence for users, products, orders and subscriptions. It has been **built, seeded and run**; all endpoints were exercised successfully on 2026-10-15.
2. **Frontend SPA** (`farmer to market/frontend`) - a React + Vite + Tailwind single-page storefront. It **calls the backend API** (`services/api.ts`, axios) for authentication, the product catalog, farmer product CRUD, checkout, buyer order history and farmer order status updates. It **compiles and builds successfully** (`tsc && vite build` exit 0).

Local-development topology: the SPA (Vite, port 5173) → the API (Express, port 5000) → PostgreSQL (local Docker container `farmfoods-pg`, port 5433; Neon remains supported). There is no shared build, no monorepo tooling, and no CI.

---

## 3. Purpose, scope and requirements

### 3.1 Purpose
Provide a marketplace where local farmers list produce and buyers order it.

### 3.2 Scope (as built — all real, database-backed)
- User registration and login (bcrypt + JWT), used by both the API and the UI.
- Product listing, detail, search/filter, and farmer-owned CRUD (create/update/delete) with image URLs.
- Order placement per product (buyer), buyer order history, farmer incoming orders, and farmer order status transitions (pending → approved → fulfilled / cancelled).
- Farmer subscription plans (backend endpoints only; **no UI, no payment**).
- Admin catalog view (frontend, read-only statistics + product table; the backend still exposes **no admin-only endpoints**).
- Multi-farmer marketplace: products are attributed to their farmer via a `farmer_name` join and shown per-seller in the UI.

### 3.3 Out of scope / not found
Payments, delivery/logistics, messaging, product reviews (the UI shows a star rating only when a product has a non-zero rating; seeded products have none), notifications, image upload (URLs are entered as text), a dedicated search engine, geolocation.

### 3.4 Requirements status

Functional requirements are **implemented and verified** on 2026-10-15 (see section 4). Non-functional requirements:

- Security: partially addressed (bcrypt, JWT, parameterised SQL, restricted CORS). **Weak default JWT secret fallback** remains; the local `.env` sets a development secret. Not production-hardened.
- Performance/scale: not addressed (no pagination; `pg.Pool` only).
- Reliability: no DB transactions, no retries, no health-check endpoint beyond `GET /`.
- Maintainability: no tests, no lint config, committed `node_modules`. Poor.
- Portability: works against any PostgreSQL; verified locally with Docker (SSL enabled) and compatible with Neon.

---

## 4. Functional requirements supported by the code

| ID | Requirement | Backend | Frontend | Status |
|---|---|---|---|---|
| FR-1 | Register as buyer/farmer | `POST /api/auth/register` | RegisterForm (real, with role selector) | **Verified** (201 created row) |
| FR-2 | Log in and stay logged in | `POST /api/auth/login` + JWT | AuthContext (real, `token` + `farmer_user`) | **Verified** (200 + token) |
| FR-3 | View own identity | `GET /api/auth/me` | Header/Account (revalidated on load) | **Verified** |
| FR-4 | Browse/search/filter products | `GET /api/products` (+`farmer_name`) | ProductGrid/Filter/Context (real fetch) | **Verified** (7 seeded products) |
| FR-5 | View product detail | `GET /api/products/:id` | ProductDetailModal | **Verified** |
| FR-6 | Farmer create/update/delete product | product endpoints (farmer-owned) | FarmerProductList (real CRUD + image preview) | **Verified** (201 create; delete guarded) |
| FR-7 | Buyer place order | `POST /api/orders` | CheckoutFlow (real, buyer-only guard) | **Verified** (201, total computed) |
| FR-8 | Buyer view orders | `GET /api/orders/buyer` | Account page (real history + status) | **Verified** |
| FR-9 | Farmer view orders | `GET /api/orders/farmer` (+`product_name`,`buyer_name`) | FarmerOrders (real) | **Verified** |
| FR-10 | Farmer update order status | `PATCH /api/orders/:id/status` | FarmerOrders (Approve/Fulfil/Cancel buttons) | **Verified** (200 → `approved`) |
| FR-11 | Farmer subscription | subscriptions endpoints | none | Backend implemented (schema in separate file) |
| FR-12 | Role-based access to dashboards | `ensureRole` middleware (server) | AdminRoute/FarmerRoute (client UX) | Server **verified**; client guards UX-only |
| FR-13 | Cart | none (frontend-only) | CartContext/Drawer (localStorage) | Frontend verified |
| FR-14 | Admin catalog view | none (no admin API) | AdminDashboard + ProductManagementTable (real, read-only) | Frontend verified |

### 4.1 Verified request/response evidence (2026-10-15)

| Flow | Observed result |
|---|---|
| `POST /api/auth/register` | `201` user row (e.g. `api_smoke_farmer`) |
| `POST /api/auth/login` | `200` `{ token, user }` |
| `POST /api/products` (farmer) | `201` created product; visible on `GET /api/products` |
| `POST /api/orders` (buyer) | `201` `status=pending`, `total_price=R13.50` for `3 × R4.50` |
| `PATCH /api/orders/:id/status` | `200` → `status=approved` |
| `GET /api/orders/buyer` / `/farmer` | `200` arrays with product/buyer names |
| `DELETE /api/products/:id` (has orders) | `400` "Cannot delete this product because it has existing orders." |

---

## 5. Non-functional requirements and verification

| NFR | Addressed? | Evidence | Verified? |
|---|---|---|---|
| Password confidentiality | Yes | bcrypt hashing (10 rounds) | Yes (login round-trip) |
| AuthN/AuthZ | Yes | JWT + role middleware | Yes (401/403 paths exercised) |
| SQL injection resistance | Yes | parameterised queries | Yes (static + live use) |
| CORS restriction | Yes | `origin: 'http://localhost:5173'` | Yes (requests from the SPA succeed) |
| Secret management | Partial | env vars; weak JWT fallback remains | Partial |
| Input validation | Partial | auth + role validation; products/orders rely on DB constraints | Partial |
| Transactions/consistency | No | order flow non-transactional | No |
| Logging/monitoring | No | no logger | No |
| Tests | No | none exist | No |
| Build reproducibility | Partial | both builds pass; committed node_modules remain | Yes (both builds observed) |

---

## 6. Technology stack and dependencies

### 6.1 Backend (`backend/package.json`)
- Runtime: Node.js (Docker base `node:20-alpine`).
- Framework: Express `4.19.x`, CORS `2.8.x`, dotenv `16.4.x`.
- Database: `pg` `8.11.x`, `@neondatabase/serverless` `0.9.x`.
- Auth: `bcryptjs` `2.4.x`, `jsonwebtoken` `9.0.x`.
- Language/tooling: TypeScript `5.4.x`, `ts-node-dev`, `ts-node`. Target ES2020, CommonJS, output `dist/`.
- `@neondatabase/serverless` is imported in `config/db.ts` (`neon`) but the returned function is unused; only `pg.Pool` is used. Dead dependency usage remains.

### 6.2 Frontend (`frontend/package.json`)
- React `18.3.x`, React DOM `18.3.x`, React Router DOM `6.26.x`.
- lucide-react `0.420.x` (icons), clsx, tailwind-merge.
- HTTP: **axios is now installed and used** by `services/api.ts` and every context.
- Build: Vite `5.4.x`, `@vitejs/plugin-react`, TypeScript `5.5.x`, `src/vite-env.d.ts` added for `import.meta.env` typing.
- Styles: Tailwind CSS `3.4.x`, postcss, autoprefixer.
- Lint script still references `eslint`, which is **not** installed and has **no** config.

### 6.3 Database
- PostgreSQL. Verified locally via Docker (`postgres:16-alpine`, container `farmfoods-pg`, port 5433, SSL enabled). Neon (serverless) remains supported. Connection via `DATABASE_URL` with `rejectUnauthorized: false`.

### 6.4 Orchestration
- `docker-compose.yml` defines `backend` (port 5000) and `frontend` (port 5173, `VITE_API_URL=http://localhost:5000/api`). It still cannot start as-is (no `frontend/Dockerfile`, `backend/.env` must exist).

---

## 7. High-level architecture

```mermaid
flowchart LR
    subgraph Browser
        U[User]
        SPA[React SPA<br/>Vite + Tailwind]
        LS[(localStorage<br/>token / farmer_user / farmer_cart)]
    end

    subgraph "farmer to market"
        API[Express REST API<br/>TypeScript]
        SEED[Seed script]
        SQL[(schema.sql<br/>+ schema.sql_subscriptions.sql)]
    end

    DB[(PostgreSQL<br/>Docker farmfoods-pg :5433)]

    U --> SPA
    SPA <--> LS
    SPA -->|"HTTP JSON + Bearer JWT<br/>(services/api.ts, axios)"| API
    API --> DB
    SEED --> DB
    SQL -. applied manually .-> DB
```

Key architectural fact (updated): the SPA↔API edge **exists at runtime**. Contexts (`AuthContext`, `ProductContext`, `CartContext` for checkout) call the API through `services/api.ts`; `services/mappers.ts` maps snake_case API rows to UI types. `localStorage` is used only to cache the session (`token`, `farmer_user`) and the cart (`farmer_cart`).

---

## 8. Component / module descriptions

### Backend
| Module | Files | Responsibility |
|---|---|---|
| Entry point | `src/server.ts` | Express app, CORS, JSON, route mounting, listen |
| Config | `src/config/db.ts` | Pool + `query()` helper (requires `DATABASE_URL`) |
| Models | `src/models/index.ts`, `models/subscription.ts` | TypeScript enums/interfaces |
| Middleware | `src/middleware/authMiddleware.ts` | `authMiddleware`, `ensureRole` |
| Utils | `src/utils/jwt.ts`, `utils/seed.ts` | JWT sign/verify; DB seeding (2 farmers, 2 buyers, admin, 7 products, 2 orders) |
| Controllers | `controllers/*.ts` | Request handling + SQL (`getProducts`/`getProductById` LEFT JOIN `users` for `farmer_name`; `deleteProduct` maps FK violation to 400) |
| Routes | `routes/*.ts` | Route → controller wiring + guards |

### Frontend
| Module | Files | Responsibility |
|---|---|---|
| Entry | `main.tsx`, `App.tsx` | Providers, router, route guards, modals |
| Contexts | `context/AuthContext.tsx` (real JWT auth), `CartContext.tsx` (localStorage), `ProductContext.tsx` (real fetch + CRUD) | Global state |
| Services | `services/api.ts` (axios, JWT interceptor, 401 → `/`), `services/mappers.ts` (`toUiProduct`, `ProductInput`, fallback image) | API access + type mapping |
| Common | `components/common/*` | Header (wired search + role nav), Footer, Modal |
| Products | `components/products/*` | Grid, card, filter, detail modal |
| Cart | `components/cart/*` | Drawer, item, checkout wizard (real orders) |
| Auth | `components/auth/*` | Modal, login, register (role selector, real), role selector |
| Farmer | `components/farmer/*` | Dashboard (live KPIs), product list (real CRUD), orders (real + status buttons) |
| Admin | `components/admin/*` | Dashboard (live stats), product table (read-only) |
| Page | `pages/Account.tsx` | Profile + real order history |
| Legacy | `data/mockData.ts` | **Unused**; retained from the prototype. Safe to delete. |
| Types | `types/index.ts` | UI domain types, extended with `unit`, `farmerId`, `farmerName`, `ApiOrder` |

---

## 9. Component responsibilities and dependencies

- `server.ts` → all 4 route modules.
- `authRoutes` → `authController` → `db.query`, `bcrypt`, `jwt`.
- `productRoutes` → `authMiddleware` + `ensureRole(farmer)` + `productController` → `db.query`.
- `orderRoutes` → guards + `orderController` → `db.query`.
- `subscriptionRoutes` → guards + `subscriptionController` → `db.query`.
- Frontend `App` → `AuthProvider` → `CartProvider` → `ProductProvider` → `Router`.
- `AuthContext` → `services/api` (`/auth/*`) → `localStorage`.
- `ProductContext` → `services/api` (`GET/POST/PUT/DELETE /products`) → `mappers.toUiProduct`.
- `CheckoutFlow` → `services/api` (`POST /orders`) → `CartContext`.
- `Account` → `services/api` (`GET /orders/buyer`).
- `FarmerDashboard`/`FarmerOrders` → `services/api` (`GET /orders/farmer`, `PATCH /orders/:id/status`).

**Model reconciliation (resolved):** the former backend/UI type mismatch (`stock_quantity/created_at` vs `stock/createdAt`) is now bridged by `services/mappers.ts` (`toUiProduct`), with outbound payloads shaped as `ProductInput` (`stock_quantity`, `image_url`, `unit`, …).

---

## 10. System architecture diagram

Current (verified) architecture:

```mermaid
flowchart LR
    SPA[React SPA] -->|HTTP JSON + JWT| API[Express API]
    API --> DB[(PostgreSQL)]
```

---

## 11. Data-flow diagram

### 11.1 Frontend flow (actual, integrated)

```mermaid
flowchart TD
    A[User action] --> B{Which feature?}
    B -->|Login/Register| C[AuthContext.login/register<br/>POST /auth/*]
    C --> D[(localStorage token + farmer_user)]
    B -->|Browse| E[ProductContext<br/>GET /products -> toUiProduct]
    B -->|Add to cart| F[CartContext]
    F --> G[(localStorage farmer_cart)]
    B -->|Checkout| H[CheckoutFlow<br/>POST /orders per item]
    B -->|Farmer CRUD| I[ProductContext.create/update/delete -> API]
    B -->|Farmer orders| J[GET /orders/farmer + PATCH status]
    B -->|Buyer orders| K[GET /orders/buyer]
```

### 11.2 Backend flow (implemented and executed)

```mermaid
flowchart TD
    R[HTTP request] --> M[Express + CORS + json]
    M --> RT[Route]
    RT --> AU{Auth guard?}
    AU -->|fail| E401[401/403]
    AU -->|ok| CO[Controller]
    CO --> Q["db.query (pg Pool)"]
    Q --> PG[(PostgreSQL)]
    PG --> CO2[Rows]
    CO2 --> RES[JSON response]
```

---

## 12. Sequence diagrams

### 12.1 Login (verified)

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Express
    participant AC as authController
    participant DB as PostgreSQL
    C->>A: POST /api/auth/login {email,password}
    A->>AC: login(req,res)
    AC->>DB: SELECT * FROM users WHERE email=$1
    DB-->>AC: row or empty
    AC->>AC: bcrypt.compare(password, hash)
    alt valid
        AC->>AC: signToken({id,username,role})
        AC-->>C: 200 {token,user}
    else invalid
        AC-->>C: 401 {message:"Invalid credentials"}
    end
```

### 12.2 Place order (verified)

```mermaid
sequenceDiagram
    participant B as Buyer (SPA)
    participant A as Express
    participant OC as orderController
    participant DB as PostgreSQL
    B->>A: POST /api/orders {productId,quantity} + Bearer
    A->>OC: createOrder
    OC->>DB: SELECT * FROM products WHERE id=$1
    DB-->>OC: product
    alt not found
        OC-->>B: 404
    else stock < qty
        OC-->>B: 400 Insufficient stock
    else enough
        OC->>DB: INSERT INTO orders ...
        OC->>DB: UPDATE products SET stock_quantity=stock_quantity-$1
        OC-->>B: 201 order
    end
    Note over OC,DB: Steps above are NOT in a transaction
```

### 12.3 Frontend checkout (verified, real orders)

```mermaid
sequenceDiagram
    participant U as Buyer
    participant CF as CheckoutFlow
    participant API as Express API
    participant Cart as CartContext
    U->>CF: Step 1 Delivery -> Step 2 Payment -> Step 3 Review
    U->>CF: Place Order
    CF->>CF: guard: must be logged in as buyer
    loop each cart item
        CF->>API: POST /api/orders {productId, quantity}
        API-->>CF: 201 order (or 400/404)
    end
    CF->>Cart: remove ordered items / clearCart on full success
    CF-->>U: Step 4 Success (failed items are kept for retry)
```

---

## 13. Data models and persistence

### 13.1 Relational schema (backend, `schema.sql`)

```mermaid
erDiagram
    USERS ||--o{ PRODUCTS : "farmer_id"
    USERS ||--o{ ORDERS : "buyer_id"
    USERS ||--o{ ORDERS : "farmer_id"
    PRODUCTS ||--o{ ORDERS : "product_id"
    USERS ||--o{ SUBSCRIPTIONS : "farmer_id"

    USERS {
      uuid id PK
      varchar username UK
      varchar email UK
      text password_hash
      user_role role
      timestamptz created_at
      timestamptz updated_at
    }
    PRODUCTS {
      uuid id PK
      uuid farmer_id FK
      varchar name
      text description
      decimal price
      varchar unit
      int stock_quantity
      varchar category
      text image_url
    }
    ORDERS {
      uuid id PK
      uuid buyer_id FK
      uuid farmer_id FK
      uuid product_id FK
      int quantity
      decimal total_price
      order_status status
    }
    SUBSCRIPTIONS {
      uuid id PK
      uuid farmer_id FK
      subscription_plan plan
      varchar status
      timestamptz start_date
      timestamptz end_date
    }
```

### 13.2 Persistence mechanisms actually used
- **Backend:** PostgreSQL via `pg` (all endpoints). Verified: schema applied, seed executed, rows created/updated/deleted through the API.
- **Frontend:** browser `localStorage` keys `token`, `farmer_user` (session) and `farmer_cart` (cart). No mock arrays are used at runtime.
- **No** ORM, migration framework, or cache.

### 13.3 Model mapping
Backend snake_case rows are mapped to UI types by `services/mappers.ts` (`toUiProduct`), and UI edits are converted back to `ProductInput` for write endpoints. `ApiOrder` models the order responses (with `product_name`/`buyer_name`, `total_price` as a string → parsed with `Number()` in the UI).

---

## 14. API and hardware integration

- API: see `docs/SERVER_API_DOCUMENTATION.md` for the full endpoint reference. All endpoints marked **verified** there were executed on 2026-10-15.
- Hardware: **none**. No serial/TCP/WebSocket/firmware code exists.
- External services: PostgreSQL only. No payment gateway (checkout is a demo — no card data, no charge; subscriptions have no payment).

---

## 15. Configuration and environment requirements

### Backend env vars
| Variable | Purpose |
|---|---|
| `PORT` | HTTP port (default 5000) |
| `DATABASE_URL` | PostgreSQL connection string (required; app throws if missing) |
| `JWT_SECRET` | JWT signing secret (falls back to an insecure default if unset) |

An `.env.example` exists at `backend/.env.example`; the working local `.env` uses `postgresql://farmdev:devpass@localhost:5433/farmfoods`. `.env` is git-ignored.

### Frontend env vars
| Variable | Purpose | Default |
|---|---|---|
| `VITE_API_URL` | API base URL | `http://localhost:5000/api` (`services/api.ts`) |

### Prerequisites
- Node.js 20+ (Docker uses node:20-alpine).
- A PostgreSQL database with SSL enabled (local Docker option documented in `README.md`).
- Docker (optional).

---

## 16. Installation and setup

> The commands below **were executed successfully** on 2026-10-15 (backend build + seed + start; frontend build).

Backend:
```powershell
cd "farmer to market/backend"
npm.cmd install
# create .env with PORT, DATABASE_URL, JWT_SECRET (see .env.example)
# apply schema.sql and schema.sql_subscriptions.sql to the database
npm.cmd run seed
npm.cmd run dev            # or: npm.cmd run build; node dist/server.js
```

Frontend:
```powershell
cd "farmer to market/frontend"
npm.cmd install
npm.cmd run dev
```
Both build cleanly. The earlier prototype's broken `../types` imports, missing `axios`, untyped `import.meta.env`, invalid `Farmer` icon, `Address.state`, and strict `any` errors are all resolved (see `PROJECT_TRACKER.md` — bugs BUG-01..BUG-12).

---

## 17. Build and execution

| Target | Command | Result (2026-10-15) |
|---|---|---|
| Backend dev | `npm run dev` (ts-node-dev) | Runs |
| Backend build | `npm run build` (tsc → dist) | **Passes, exit 0** |
| Backend prod | `npm start` (node dist/server.js) | **Runs**; `GET /` and `GET /api/products` return 200 |
| Backend seed | `npm run seed` | **Succeeds** (2 farmers, 2 buyers, 1 admin, 7 products, 2 orders) |
| Frontend dev | `npm run dev` (vite) | Serves on 5173 |
| Frontend build | `npm run build` (`tsc && vite build`) | **Passes, exit 0** (1626 modules) |
| Frontend lint | `npm run lint` (eslint) | **Not runnable** (eslint not installed) |
| Docker | `docker-compose up --build` | Not run; **frontend Dockerfile missing** |

---

## 18. Testing procedures and known results

- No test framework, no test files, no test scripts (unchanged).
- **Manual verification performed (2026-10-15):** backend endpoints exercised via HTTP (register/login, product create, order create, status patch, buyer/farmer listings); frontend production build succeeded; both apps started and the API responded.
- Recommended next: Jest + Supertest (backend), Vitest + React Testing Library (frontend), plus a compose smoke test.

---

## 19. Error handling, recovery and troubleshooting

- Controllers wrap DB work in `try/catch` and return generic `500 { "message": "Internal server error" }`; errors are **not logged**.
- Specific handling: `23505` unique violation on register → `400`; not-found → `404`; insufficient stock → `400`; **FK violation on product delete (`23503`) → `400` "Cannot delete this product because it has existing orders."** (added 2026-10-15).
- No global error middleware, no retry logic, no circuit breakers.
- Frontend: the axios interceptor removes the token/user and redirects to `/` on `401` (the former `/login` target did not exist).
- Troubleshooting quick list:
  - Backend throws at startup if `DATABASE_URL` is missing.
  - Local Docker PostgreSQL must have SSL enabled (`ALTER SYSTEM SET ssl=on`) or the pool connection fails.
  - Subscription endpoints return `500` if the subscriptions schema was never applied.
  - If the API is down, the product grid shows a "Cannot reach the backend API" message.

---

## 20. Security considerations and limitations

| Item | Status |
|---|---|
| Password storage | bcrypt (10 rounds) |
| Session | JWT 24h, Bearer header |
| Authorization | Role middleware server-side (verified); client route guards are cosmetic UX |
| SQL injection | Mitigated via parameterised queries |
| CORS | Restricted to `http://localhost:5173` (hardcoded) |
| Secrets | Env-based, but weak JWT fallback `default_secret_change_me` remains |
| Rate limiting | Absent |
| Input validation | Minimal (auth only) |
| Transport | HTTP in development; HTTPS not configured |
| Sensitive data committed | `.env` is git-ignored and absent from the repo; `node_modules` remains committed |

Restrictions: no password reset, no OTP verification, no account lockout, no audit logging, no email verification.

---

## 21. Deployment and maintenance

- Intended: `docker-compose up --build` (backend:5000, frontend:5173).
- Backend Dockerfile is a working multi-stage build (build → production).
- **Blocker:** `docker-compose.yml` builds `./frontend` but there is **no frontend Dockerfile**, and `backend/.env` must exist, so the stack cannot start as-is.
- No CI/CD, no infrastructure-as-code, no migration tooling. Schema changes are manual SQL.
- Maintenance: keep `schema.sql` and `schema.sql_subscriptions.sql` in sync (still divergent), add tests before further feature work, and delete the now-unused `data/mockData.ts`.

---

## 22. Known limitations and future improvements

Limitations:
- No automated tests; only both builds act as regression checks.
- Non-transactional order creation (oversell risk under concurrency); weak default JWT secret; minimal validation.
- No admin API (admin dashboard is read-only); subscriptions have no UI or payment.
- `docker-compose.yml` cannot start (no frontend Dockerfile).
- `npm run lint` is unusable; `data/mockData.ts` is dead code; committed `node_modules`.

Future improvements (proposed, not implemented):
1. Add a DB transaction to order creation and validate `status`/`quantity` values.
2. Add an admin API and wire the admin dashboard to it.
3. Merge schemas and introduce migrations; make CORS configurable.
4. Add validation, logging, rate limiting; enforce `JWT_SECRET`.
5. Delete `data/mockData.ts`, add a frontend Dockerfile, then enable `docker-compose`.
6. Add tests (Jest + Supertest, Vitest + RTL) and CI.

---

## 23. Glossary

| Term | Meaning |
|---|---|
| CAV / VER / INV / PI / BL / NF | Tracker statuses (completed-and-verified / verified / implemented-not-verified / partial / blocked / not found) |
| Farmer | User with role `farmer`; lists produce |
| Buyer | User with role `buyer`; places orders |
| Admin | Role present in enum/schema and frontend; no backend admin endpoints |
| JWT | JSON Web Token (24h) |
| Neon | Serverless PostgreSQL provider (still supported) |
| farmfoods-pg | Local Docker PostgreSQL container (port 5433) used for verification |
| TOCTOU | Time-of-check/time-of-use race (stock oversell risk) |

---

## 24. References to important source files

| Path | Relevance |
|---|---|
| `farmer to market/backend/src/server.ts` | App bootstrap, routes, CORS |
| `farmer to market/backend/src/config/db.ts` | DB pool |
| `farmer to market/backend/src/controllers/productController.ts` | Product CRUD + `farmer_name` join + FK-delete handling |
| `farmer to market/backend/src/utils/seed.ts` | Demo data (2 farmers, 2 buyers, admin, 7 products, 2 orders) |
| `farmer to market/backend/schema.sql` | Core tables |
| `farmer to market/backend/schema.sql_subscriptions.sql` | Subscriptions table |
| `farmer to market/backend/.env.example` | Required env vars |
| `farmer to market/frontend/src/services/api.ts` | Axios client (JWT interceptor, 401 → `/`) |
| `farmer to market/frontend/src/services/mappers.ts` | API ↔ UI type mapping |
| `farmer to market/frontend/src/context/*.tsx` | State (API-backed auth/products; localStorage cart) |
| `farmer to market/frontend/src/components/**` | UI |
| `farmer to market/frontend/src/data/mockData.ts` | Legacy mock data (unused) |
| `farmer to market/docker-compose.yml` | Orchestration |
| `docs/SERVER_API_DOCUMENTATION.md` | API reference (with verification results) |
| `docs/PROJECT_TRACKER.md` | Status register |
