# Source Code Inventory - CSE Local Farmers to Buyers Marketplace

**Version:** 2.0 | **Updated:** 2026-10-15 | **Commit basis:** working tree after frontend↔backend integration (on top of `7724b1a`)

Every tracked, non-`node_modules` file in the repository, with its purpose, dependencies and relevance. Paths are relative to the repository root. Changes from v1.0 are described at the end.

## Root

| File | Purpose | Depends on | Relevance |
|---|---|---|---|
| `README.md` | Full setup, architecture, testing and troubleshooting guide (18 sections) | - | Primary documentation |
| `.gitignore` | Excludes `.env`, `node_modules`, build output | - | Tooling |
| `farmer to market/docker-compose.yml` | Defines `backend` (5000) and `frontend` (5173) services | Docker; `backend/.env`; `frontend/Dockerfile` (missing) | Deployment |
| `farmer to market/Order` | Empty placeholder file (0 bytes) | - | Dead |
| `farmer to market/Profile` | Empty placeholder file (0 bytes) | - | Dead |
| `farmer to market/package-lock.json` | Root lockfile | - | Tooling |
| `farmer to market/.vite/deps/*` | Vite dependency cache (committed) | - | Build artifact; should not be committed |

## Backend (`farmer to market/backend`)

| File | Purpose | Depends on | Relevance |
|---|---|---|---|
| `package.json` | Deps/scripts (start/dev/build/seed) | express, pg, bcryptjs, jsonwebtoken, etc. | Core |
| `tsconfig.json` | TS → `dist`, CommonJS, ES2020 | - | Build config |
| `Dockerfile` | Multi-stage Node 20 image, expose 5000 | package.json | Deployment |
| `README.md` | Setup + endpoint list | - | Docs |
| `.env.example` | Template for `PORT`, `DATABASE_URL`, `JWT_SECRET` | - | Config |
| `.env` | Local runtime config (**git-ignored**, not tracked) | - | Config |
| `schema.sql` | `users`, `products`, `orders`, enums, indexes | PostgreSQL | Core data model |
| `schema.sql_subscriptions.sql` | `subscriptions` table + enum | PostgreSQL | Feature (separate file) |
| `src/server.ts` | Express bootstrap, CORS, route mounting, listen 5000 | express, cors, dotenv, routes | Entry point |
| `src/config/db.ts` | `pg.Pool` + `query()` helper; requires `DATABASE_URL` | pg, @neondatabase/serverless, dotenv | Data access |
| `src/models/index.ts` | `UserRole`, `OrderStatus`, `User`, `Product`, `Order` | - | Domain types |
| `src/models/subscription.ts` | `Subscription` interface | - | Domain type |
| `src/middleware/authMiddleware.ts` | `authMiddleware`, `ensureRole` | jsonwebtoken (via jwt.ts) | Security |
| `src/utils/jwt.ts` | `signToken` (24h), `verifyToken` | jsonwebtoken, dotenv | Security |
| `src/utils/seed.ts` | Truncate + insert demo data: **2 farmers, 2 buyers, 1 admin, 7 products (real image URLs), 2 orders** | bcryptjs, db.ts | Dev tooling |
| `src/routes/authRoutes.ts` | 3 auth routes | authController, authMiddleware | API |
| `src/routes/productRoutes.ts` | 5 product routes + farmer guard | productController, authMiddleware | API |
| `src/routes/orderRoutes.ts` | 4 order routes + role guards | orderController, authMiddleware | API |
| `src/routes/subscriptionRoutes.ts` | 2 subscription routes + farmer guard | subscriptionController, authMiddleware | API |
| `src/controllers/authController.ts` | register, login, getMe | bcryptjs, jwt.ts, db.ts | Business logic |
| `src/controllers/productController.ts` | list/getById (**LEFT JOIN users → `farmer_name`**)/create/update/delete (**FK violation → 400**) | db.ts | Business logic |
| `src/controllers/orderController.ts` | createOrder, buyer/farmer lists, status update | db.ts | Business logic |
| `src/controllers/subscriptionController.ts` | status, subscribe | db.ts | Business logic |

## Frontend (`farmer to market/frontend`)

| File | Purpose | Depends on | Relevance |
|---|---|---|---|
| `package.json` | Deps/scripts (dev/build/lint/preview); **axios now installed**; eslint still missing | react, vite, tailwind, axios | Core |
| `index.html` | SPA host, loads `main.tsx` | - | Entry |
| `vite.config.ts` | Vite + React plugin | @vitejs/plugin-react | Build |
| `tsconfig.json` / `tsconfig.node.json` | TS config (strict, noEmit) | - | Build |
| `src/vite-env.d.ts` | **Added** — Vite client types for `import.meta.env` | - | Types (build fix) |
| `tailwind.config.js` | Custom `primary`/`secondary` palettes | tailwindcss | Styling |
| `postcss.config.js` | tailwind + autoprefixer | - | Styling |
| `src/main.tsx` | React root render | App, index.css | Entry |
| `src/index.css` | Tailwind directives + component classes | tailwindcss | Styling |
| `src/App.tsx` | Providers, Router, routes, guard wrappers; home "Shop Now" now links to `/products` | contexts, components, pages | Core |
| `src/types/index.ts` | UI domain types; **extended with `unit`, `farmerId`, `farmerName`, `ApiOrder`** | - | Types |
| `src/services/api.ts` | axios client, JWT interceptor, **401 → `/`** | axios, `import.meta.env` | **Active** |
| `src/services/mappers.ts` | **New** — `toUiProduct`, `ProductInput`, `FALLBACK_IMAGE`; bridges API↔UI types | types | **Active** |
| `src/context/AuthContext.tsx` | **Real** register/login/logout against `/api/auth`; persists `token` + `farmer_user`; revalidates via `/auth/me` | types, api | State |
| `src/context/CartContext.tsx` | Cart CRUD, localStorage `farmer_cart` (used by checkout) | types | State |
| `src/context/ProductContext.tsx` | **Real** `GET /api/products` + `createProduct`/`updateProduct`/`deleteProduct`; client-side filter/sort/search; derived categories | types, api, mappers | State |
| `src/components/common/Header.tsx` | Nav, **wired search → `setSearch` + `/products`**, cart badge, role-based links, avatar, logout | Cart/Auth/Product contexts, react-router | UI |
| `src/components/common/Footer.tsx` | Static footer links | lucide-react | UI |
| `src/components/common/Modal.tsx` | Reusable modal (Esc to close) | lucide-react | UI |
| `src/components/products/ProductGrid.tsx` | Grid of ProductCards + detail modal; loading/error states | ProductContext, ProductCard, ProductDetailModal | UI |
| `src/components/products/ProductCard.tsx` | Product tile + add-to-cart; `R{price}/{unit}`, "Sold by {farmer}", rating hidden when 0 | types, CartContext | UI |
| `src/components/products/ProductFilter.tsx` | Category + sort controls (categories derived from live data) | ProductContext | UI |
| `src/components/products/ProductDetailModal.tsx` | Detail view, quantity; unit price + seller + conditional rating | types, CartContext | UI |
| `src/components/cart/CartDrawer.tsx` | Slide-over cart + totals | CartContext, CartItem, react-router | UI |
| `src/components/cart/CartItem.tsx` | Cart line item controls | types, CartContext | UI |
| `src/components/cart/CheckoutFlow.tsx` | 4-step wizard; **places real orders** (`POST /api/orders` per item, buyer-only guard, `R` currency, partial-failure handling) | CartContext, AuthContext, api | UI |
| `src/components/auth/AuthModal.tsx` | Login/register modal switcher (passes `onClose` to login) | Modal, LoginForm, RegisterForm | UI |
| `src/components/auth/LoginForm.tsx` | **Real** email/password login; closes modal on success; API error messages | AuthContext | UI |
| `src/components/auth/RegisterForm.tsx` | **Real** register with buyer/farmer role selector + auto-login; success screen | AuthContext, RoleSelector | UI |
| `src/components/auth/RoleSelector.tsx` | Buyer/Farmer picker | lucide-react | UI |
| `src/components/farmer/FarmerDashboard.tsx` | **Live** KPIs (listings, stock, pending orders, order value) from `GET /orders/farmer`; passes orders down | contexts, api, FarmerProductList, FarmerOrders | UI |
| `src/components/farmer/FarmerProductList.tsx` | **Real** CRUD (create/edit/delete own products) with image preview; filter by `farmerId === user.id`; confirm-delete | types, ProductContext, AuthContext, mappers | UI |
| `src/components/farmer/FarmerOrders.tsx` | **Real** incoming orders + working Approve/Cancel/Mark-Fulfilled buttons (`PATCH /orders/:id/status`) | types, api | UI |
| `src/components/admin/AdminDashboard.tsx` | **Live** catalog stats (catalog value, products, farmers, low stock) | ProductContext, AuthContext, ProductManagementTable | UI |
| `src/components/admin/ProductManagementTable.tsx` | **Real, read-only** catalog table across farmers (adds Farmer column) | ProductContext | UI |
| `src/pages/Account.tsx` | Profile + **real** order history (`GET /orders/buyer`) with status badges | AuthContext, types, api | UI |
| `src/data/mockData.ts` | **Legacy** mock arrays — no longer imported by any component | types | Dead code (safe to delete) |

## Committed artifacts that should not be tracked

- `farmer to market/node_modules/**` and `farmer to market/frontend/node_modules/**` - still committed (a root `.gitignore` now exists, but history is not cleaned).
- `farmer to market/.vite/**` cache.
- Empty `Order` and `Profile` files.

## Files referenced but absent

| Referenced by | Missing item |
|---|---|
| `docker-compose.yml` (`build: ./frontend`) | `frontend/Dockerfile` |
| `docker-compose.yml` (`env_file: ./backend/.env`) | `backend/.env` (present locally, git-ignored — not committed) |
| `package.json` lint script | `eslint` + config |

## Resolved since v1.0

The following v1.0 "missing/broken" items are now resolved and the files exist/compile:

- `axios` dependency — **installed and used** (v1.0 reverse-referenced item removed).
- `src/vite-env.d.ts` — **added**.
- `/login` route redirect — interceptor now redirects to the existing `/` route.
- Backend `farmer_name` join and FK-aware product delete — **implemented**.
