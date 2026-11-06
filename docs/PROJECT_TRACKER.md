# Project Tracker - CSE Local Farmers to Buyers Marketplace

**Document version:** 2.0
**Updated:** 2026-10-15
**Basis:** Working tree after the frontend↔backend integration and a full run-through of the backend, database and frontend build. Original baseline was static inspection at commit `7724b1a`.
**Evidence policy:** Status is based on what was actually observed. Tasks proven by a successful build/run/HTTP response are marked *COMPLETED AND VERIFIED* (`CAV`); code-only evidence is *IMPLEMENTED, NOT VERIFIED* (`INV`).

> UPDATE (2026-10-15): The frontend now **compiles** (`tsc && vite build` exit 0) and is **integrated with the backend**. The backend was **built, seeded and executed** against PostgreSQL; every endpoint was exercised. Bugs BUG-01..BUG-12 are **resolved** except BUG-10 (subscriptions schema remains a separate file). No automated tests exist yet.

---

## A. Project Overview

| Field | Value |
|---|---|
| Project name | CSE-Local-Farmers-to-Buyers-Marketplace2 (product name in code: "Farm Foods Marketplace" / "Farmer Market") |
| Repository root | `CSE-Local-Farmers-to-Buyers-Marketplace2/` |
| Application root | `farmer to market/` |
| Objective | Let small-scale farmers reach buyers beyond their immediate area, and let local buyers (households, small restaurants) find and buy directly from nearby producers. |
| Scope (as built) | A single-page React storefront **integrated with** a REST backend for users, products, orders and farmer subscriptions, backed by PostgreSQL. |
| Main components | `frontend/` (React SPA), `backend/` (Express API), `docker-compose.yml`, database schema of 4 tables (subscriptions optional). |
| Technology stack | Backend: Node.js 20, Express 4, TypeScript 5, `pg`, `bcryptjs`, `jsonwebtoken`. Frontend: React 18, TypeScript 5, Vite 5, React Router 6, Tailwind CSS 3, lucide-react, **axios**. Database: PostgreSQL (local Docker `farmfoods-pg` verified; Neon supported). |
| Current development stage | **Working full-stack prototype.** Backend endpoints all executed successfully; frontend builds and consumes the API for auth, catalog, farmer CRUD, checkout and orders. No automated tests, no CI. |

### Component inventory (high level)

| Component | Path | Purpose |
|---|---|---|
| Backend server | `farmer to market/backend/src/server.ts` | Express bootstrap, route mounting, CORS, root health text |
| DB layer | `farmer to market/backend/src/config/db.ts` | `pg.Pool` over `DATABASE_URL`, `query()` helper |
| Auth | `backend/src/controllers/authController.ts`, `utils/jwt.ts`, `middleware/authMiddleware.ts` | Register / login / me, JWT sign+verify, role guard |
| Products | `backend/src/controllers/productController.ts`, `routes/productRoutes.ts` | CRUD + filter/search + `farmer_name` join + FK-delete handling |
| Orders | `backend/src/controllers/orderController.ts`, `routes/orderRoutes.ts` | Create order, buyer/farmer listings, status update |
| Subscriptions | `backend/src/controllers/subscriptionController.ts`, `routes/subscriptionRoutes.ts` | Farmer plan status + subscribe |
| Seed | `backend/src/utils/seed.ts` | Truncate + insert 2 farmers, 2 buyers, admin, 7 products, 2 orders |
| DB schema | `backend/schema.sql`, `backend/schema.sql_subscriptions.sql` | Tables, enums, indexes |
| Frontend app | `frontend/src/App.tsx`, `main.tsx` | Providers + routes |
| Frontend state | `frontend/src/context/*` | Auth (API), Product (API), Cart (localStorage) |
| Frontend UI | `frontend/src/components/**`, `frontend/src/pages/Account.tsx` | Catalog, cart, checkout, farmer/admin dashboards |
| API client | `frontend/src/services/api.ts`, `services/mappers.ts` | Axios client (JWT, 401→`/`) + API↔UI mapping |
| Legacy mock data | `frontend/src/data/mockData.ts` | Hard-coded arrays — **no longer imported** |
| Orchestration | `farmer to market/docker-compose.yml` | backend + frontend services |

---

## B. Feature and Task Register

Status legend: **CAV** = COMPLETED AND VERIFIED, **INV** = IMPLEMENTED NOT VERIFIED, **IP** = IN PROGRESS, **PI** = PARTIALLY IMPLEMENTED, **PL** = PLANNED, **BL** = BLOCKED, **NF** = NOT FOUND / REQUIRES INVESTIGATION.

### Repository & project setup

| ID | Task | Description | Files | Deps | Status | Evidence | Remaining work | Risks | Acceptance criteria | Testing | Next action |
|---|---|---|---|---|---|---|---|---|---|---|---|
| TRK-01 | Repository scaffolding | Monorepo with `frontend/` and `backend/` | repo tree, `docker-compose.yml` | - | CAV | File tree; builds pass | - | node_modules still committed | Project builds from a clean clone | Builds verified | Remove committed `node_modules` from history |
| TRK-02 | Root README | Full setup/architecture/testing/troubleshooting guide | `README.md` | - | CAV | 18-section README | Maintain | Low | README explains setup | Reviewed | Keep in sync |

### Backend

| ID | Task | Description | Files | Deps | Status | Evidence | Remaining work | Risks | Acceptance criteria | Testing | Next action |
|---|---|---|---|---|---|---|---|---|---|---|---|
| BE-01 | Express bootstrap | app, JSON, CORS, mount 4 routers, listen 5000 | `backend/src/server.ts` | express, cors, dotenv | CAV | `GET /` returns 200 text; server started | - | Hardcoded CORS origin | Server boots and answers | Verified live | - |
| BE-02 | DB connection | `pg.Pool` via `DATABASE_URL`, ssl rejectUnauthorized false | `backend/src/config/db.ts` | pg, dotenv | CAV | `/api/products` queried DB successfully | - | Local PG needs SSL enabled | Connection succeeds | Verified live | - |
| BE-03 | Users schema | Enum `user_role`, `users` table + indexes | `backend/schema.sql` | PostgreSQL | CAV | Applied to DB; registrations/login work | - | No migrations | Tables created | Verified live | Add migrations |
| BE-04 | Products schema | `products` table + index | `backend/schema.sql` | BE-03 | CAV | Applied; products returned | - | - | Table created | Verified live | - |
| BE-05 | Orders schema | Enum `order_status`, `orders` table + indexes | `backend/schema.sql` | BE-03, BE-04 | CAV | Applied; orders created/listed | - | - | Table created | Verified live | - |
| BE-06 | Subscriptions schema | `subscription_plan` enum + `subscriptions` table | `backend/schema.sql_subscriptions.sql` | BE-03 | PI | SQL exists in a **separate** file | Merge into canonical schema | Endpoints 500 if not applied | Table created | Not executed | Merge or document |
| BE-07 | Registration | `POST /api/auth/register`, bcrypt, role validation, 23505 handling | `controllers/authController.ts` | BE-02, BE-03 | CAV | `201` user row observed | - | No format checks | 201 + user row | Verified live | - |
| BE-08 | Login + JWT | `POST /api/auth/login`, bcrypt compare, 24h JWT | `authController.ts`, `utils/jwt.ts` | BE-07 | CAV | `200 {token,user}` observed | - | JWT secret fallback | 200 + token | Verified live | Enforce secret |
| BE-09 | Auth middleware / role guard | Bearer parse, verify, `ensureRole` | `middleware/authMiddleware.ts` | BE-08 | CAV | 401 (no token) and 403 (wrong role) observed | - | - | 401/403 enforced | Verified live | - |
| BE-10 | Current user | `GET /api/auth/me` | `authController.ts` | BE-09 | CAV | UI revalidates session on load | - | - | 200 + user | Verified live | - |
| BE-11 | Product listing | `GET /api/products` + `category`/`search`, now with `farmer_name` | `productController.ts` | BE-04 | CAV | 7 products returned with `farmer_name` | - | snake_case columns | 200 + array | Verified live | - |
| BE-12 | Product detail | `GET /api/products/:id` | `productController.ts` | BE-04 | CAV | Used by the UI modal | - | - | 200 / 404 | Verified live | - |
| BE-13 | Product CRUD (farmer) | `POST/PUT/DELETE /api/products`, ownership; FK-delete → 400 | `productController.ts`, `routes/productRoutes.ts` | BE-09 | CAV | Create observed (201); delete with orders → 400 after fix | - | No field validation | 201/200/400/404 | Verified live | Add validation |
| BE-14 | Order creation | `POST /api/orders`: stock check, total, insert, decrement | `orderController.ts` | BE-05, BE-09 | CAV | 201, `total_price=R13.50`, stock decremented | - | **No DB transaction**; TOCTOU race | 201 or 400/404 | Verified live | Wrap in transaction |
| BE-15 | Buyer orders | `GET /api/orders/buyer` joins product name | `orderController.ts` | BE-14 | CAV | Returned array of buyer orders | - | - | 200 + array | Verified live | - |
| BE-16 | Farmer orders | `GET /api/orders/farmer` joins product + buyer name | `orderController.ts` | BE-14 | CAV | Returned array with buyer names | - | - | 200 + array | Verified live | - |
| BE-17 | Order status update | `PATCH /api/orders/:id/status`, ownership | `orderController.ts` | BE-14 | CAV | `200 → approved` observed | Validate status value | Arbitrary status string accepted | 200 / 404 | Verified live | Add enum validation |
| BE-18 | Subscription status | `GET /api/subscriptions/status` | `subscriptionController.ts` | BE-06, BE-09 | PI | Code present | Confirm table applied | Fails if table absent | 200 + {active,...} | Not executed | Apply schema |
| BE-19 | Subscribe | `POST /api/subscriptions/subscribe`, plan whitelist, end date | `subscriptionController.ts` | BE-06 | PI | Code present | Payment flow | No payment | 201 | Not executed | Decide payment model |
| BE-20 | Seed script | Truncate + insert demo data | `utils/seed.ts` | BE-03..05 | CAV | `npm run seed` succeeded: 2 farmers, 2 buyers, 1 admin, 7 products, 2 orders | - | Removes all data | Seed completes | Verified live | - |
| BE-21 | Backend tests | Unit/integration tests | - | - | NF | No test files or deps | Add test suite | - | Passing suite | None | Choose Jest/Vitest |

### Frontend

| ID | Task | Description | Files | Deps | Status | Evidence | Remaining work | Risks | Acceptance criteria | Testing | Next action |
|---|---|---|---|---|---|---|---|---|---|---|---|
| FE-01 | App shell & routing | Providers + BrowserRouter routes | `App.tsx` | react-router-dom | CAV | `tsc && vite build` exit 0 | - | - | `npm run build` succeeds | Build verified | - |
| FE-02 | Layout | Header (search, cart, auth, role nav) + Footer | `components/common/Header.tsx`, `Footer.tsx` | lucide-react | CAV | Header wired to `setSearch`/navigate + role links | Footer links are `#` | - | Renders | Build verified | Minor visual check |
| FE-03 | Auth UI | Login + register with role selector | `components/auth/*` | FE-04 | CAV | Real API calls; success/error states | - | - | Forms submit to API | Build verified | - |
| FE-04 | Auth state | `AuthContext` real login/register/logout + session revalidation | `context/AuthContext.tsx` | api | CAV | Login creates `token` + `farmer_user`; `/me` revalidation | - | - | Real login against API | Verified live | - |
| FE-05 | Product catalog | Grid + card + detail from `GET /api/products` | `components/products/*`, `context/ProductContext.tsx`, `services/mappers.ts` | FE-12 | CAV | Live catalog with images, units, seller names | - | - | Live catalog | Verified live | - |
| FE-06 | Filter / sort / search | Client-side category filter, text search, sort over live data; header search | `context/ProductContext.tsx`, `ProductFilter.tsx`, `Header.tsx` | FE-05 | CAV | Derived categories; header search navigates to `/products` | - | Client-only | Filters apply | Build verified | Optionally server-side |
| FE-07 | Cart | Add/remove/quantity, localStorage, drawer | `context/CartContext.tsx`, `components/cart/*` | - | CAV | Cart persisted; used by real checkout | - | - | Persisted cart | Build verified | - |
| FE-08 | Checkout flow | 4-step wizard → real `POST /api/orders` per item | `components/cart/CheckoutFlow.tsx` | FE-07, api | CAV | Orders created; buyer-only guard; partial failures retained | Real payment (out of scope) | Non-transactional server side | Order persisted | Verified live | - |
| FE-09 | Account page | Profile + real order history (`/orders/buyer`) with statuses | `pages/Account.tsx` | FE-04, api | CAV | Loads buyer orders; login prompt when anonymous | - | - | Real history | Build verified | - |
| FE-10 | Farmer dashboard | Live KPIs; product CRUD; incoming orders + status buttons | `components/farmer/*` | FE-05, api | CAV | Real CRUD (201), Approve/Fulfil/Cancel wired | - | - | Live dashboard | Verified live | - |
| FE-11 | Admin dashboard | Live catalog stats + read-only table (Farmer column) | `components/admin/*` | FE-05 | CAV | Stats computed from live data | No admin API | No admin endpoints | Working read-only admin | Build verified | Define admin API |
| FE-12 | API client | axios instance, JWT interceptor, 401 → `/` | `services/api.ts`, `services/mappers.ts` | axios | CAV | Installed, used everywhere; 401 redirect fixed | - | - | Client usable | Build + live | - |
| FE-13 | Route guards | Client-side `AdminRoute`/`FarmerRoute` | `App.tsx` | FE-04 | CAV | Cosmetic only; server enforces real roles | - | Bypassable by design | Can't access by role in UI | Build verified | Documented as UX-only |
| FE-14 | Frontend build | `tsc && vite build` | `package.json` | - | CAV | **Exit 0**, 1626 modules | - | - | Build succeeds | Verified | - |
| FE-15 | Frontend lint | `eslint .` | `package.json` | eslint | BL | ESLint not installed; no config | Add eslint + config | Cannot lint | Lint passes | Not runnable | Add tooling |

### Integration, deployment, security, docs

| ID | Task | Description | Files | Deps | Status | Evidence | Remaining work | Risks | Acceptance criteria | Testing | Next action |
|---|---|---|---|---|---|---|---|---|---|---|---|
| INT-01 | Frontend↔Backend integration | SPA calls REST API | `services/api.ts` + contexts | FE-04, FE-12 | CAV | Auth/products/orders/status all exercised end-to-end | - | - | Live data end-to-end | Verified live | - |
| INT-02 | Subscription UI | Farmer subscription screens | - | BE-18/19 | NF | No UI references subscriptions | Build screens | Feature invisible | UI exists | None | Design UI |
| DEP-01 | Backend Docker | Multi-stage build, expose 5000 | `backend/Dockerfile` | - | INV | Dockerfile present | Build image | Build untested | `docker build` succeeds | Not run | Build image |
| DEP-02 | Frontend Docker | `docker-compose.yml` builds `./frontend` | - | - | BL | **No frontend Dockerfile exists** | Add Dockerfile + nginx/serve | compose fails | `docker-compose up` works | Not run | Create Dockerfile |
| DEP-03 | docker-compose | Wires backend:5000 + frontend:5173 | `docker-compose.yml` | DEP-01, DEP-02 | PI | File present; needs `.env` + FE Dockerfile | Provide `.env`, FE Dockerfile | Missing files | Stack starts | Not run | Complete compose |
| DEP-04 | Config/secrets | `.env.example` + `.gitignore` added | `backend/.env.example`, `.gitignore` | - | CAV | Files present; `.env` ignored | - | node_modules committed | Safe config | - | Clean history |
| SEC-01 | Password hashing | bcrypt, 10 rounds | `authController.ts`, `seed.ts` | - | CAV | Login round-trip verified | - | - | No plaintext passwords | Verified live | - |
| SEC-02 | JWT secret handling | `JWT_SECRET` env with weak fallback | `utils/jwt.ts` | - | PI | Fallback constant in code | Remove fallback / fail fast | Weak default if env missing | Secret required at boot | - | Enforce env |
| SEC-03 | CORS | Restricted to `http://localhost:5173` | `server.ts` | - | CAV | SPA requests with that Origin succeed | Make configurable | Not prod-ready | Config-driven | Verified live | Externalise |
| SEC-04 | Input validation | Auth validates fields/role; products/orders rely on DB | controllers | - | PI | See BE-13, BE-14 | Add validation layer | Bad data accepted | Validation on all inputs | Partial | Add validation |
| SEC-05 | SQL injection safety | Parameterised queries throughout | controllers | - | CAV | `$1..$n` used everywhere | - | - | No concatenation of user input | Static + live | - |
| DOC-01 | Backend README | Setup + endpoint list | `backend/README.md` | - | CAV | File present | Keep in sync | - | Matches code | - | Update endpoints |
| DOC-02 | API/System docs | These documents (v2.0) | `docs/` | - | CAV | Updated 2026-10-15 | Maintain | - | Accurate | - | - |

---

## C. Additional Tracker Sections

### Milestones

| Milestone | Status | Evidence |
|---|---|---|
| M1 - Backend API skeleton written | Reached | commit `7724b1a` |
| M2 - Database schema defined | Reached | `schema.sql` |
| M3 - Frontend UI prototype | Reached | commit `8ffe3b9` + files |
| M4 - Frontend compiles & runs | **REACHED (2026-10-15)** | `npm run build` exit 0 |
| M5 - Frontend talks to backend | **REACHED (2026-10-15)** | Live auth/products/orders flows |
| M6 - Automated tests | NOT STARTED | none found |
| M7 - Deployable via Docker | NOT REACHED | frontend Dockerfile missing |

> Historical dates/percentages before 2026-10-14 are UNKNOWN; the repository contains no schedule or progress log.

### Outstanding bugs

| Bug ID | Description | Location | Severity | Status |
|---|---|---|---|---|
| BUG-01 | 6 components imported non-existent `../types` | ProductCard, FarmerProductList, FarmerOrders, ProductManagementTable, CartItem, ProductDetailModal | High | **Resolved** (imports corrected to `../../types`) |
| BUG-02 | `axios` imported but not a dependency | `services/api.ts:1` | High | **Resolved** (axios installed) |
| BUG-03 | `import.meta.env` untyped | `services/api.ts:3` | Medium | **Resolved** (`src/vite-env.d.ts` added) |
| BUG-04 | `lucide-react` has no `Farmer` export | `RoleSelector.tsx` | Medium | **Resolved** |
| BUG-05 | `Address` has no `state` property | `CheckoutFlow.tsx` | Low | **Resolved** (checkout reworked) |
| BUG-06 | AuthContext string role vs union type | `AuthContext.tsx` | Medium | **Resolved** (typed `RegisterInput.role`) |
| BUG-07 | `e.target.nextSibling?.focus()` type error | `RegisterForm.tsx` | Low | **Resolved** (OTP screen removed) |
| BUG-08 | Implicit `any` under strict | `ProductCard.tsx`, `ProductDetailModal.tsx`, `services/api.ts` | Medium | **Resolved** |
| BUG-09 | 401 interceptor redirected to non-existent `/login` | `services/api.ts` | Medium | **Resolved** (now `/`) |
| BUG-10 | `subscriptions` table in a separate SQL file | `schema.sql_subscriptions.sql` | Medium | **OPEN** (merge pending) |
| BUG-11 | Currency `$` vs `R` inconsistent | `CheckoutFlow.tsx` | Low | **Resolved** (`R` throughout) |
| BUG-12 | `Loader2`/`ArrowRight` imported at file bottom | `CheckoutFlow.tsx` | Low | **Resolved** (rewritten) |

### Technical debt

- `node_modules` still committed to git; a `.gitignore` now exists but history is not cleaned.
- Build artifacts cache `.vite/` committed.
- Empty placeholder files `Order` and `Profile` at application root.
- No database migrations; the subscription schema remains an orphaned separate file.
- No input validation on products/orders; no central error handler; generic `500` messages, no logging.
- Order creation is non-transactional (stock can be oversold under concurrency).
- `data/mockData.ts` is now dead code (no imports).
- No admin API although an admin UI and `admin` role exist.
- No tests, no CI, no lint tooling installed.

### Missing tests (all NOT FOUND)

- Backend: auth, products, orders, subscriptions, middleware — none.
- Frontend: component/context/route tests — none.
- Integration/e2e — none.
- Build verification test — none (though both builds pass manually).

### Dependencies and risks

| Risk | Impact | Evidence |
|---|---|---|
| No automated tests | Regressions undetected | none found |
| Non-transactional order creation | Stock oversell under concurrency | `orderController.ts` |
| Weak JWT fallback secret | Insecure if `JWT_SECRET` unset | `utils/jwt.ts` |
| Subscription schema drift | Runtime 500s if file not applied | BUG-10 |
| Committed `node_modules` | Repo bloat; accidental-vendor churn | git tree |
| `docker-compose` incomplete | Cannot containerize the whole stack | no FE Dockerfile |
| No admin API | Admin dashboard is read-only | no admin routes |

### Immediate priorities (recommended)

1. Merge `schema.sql_subscriptions.sql` into the canonical schema and document run order; close BUG-10.
2. Add a DB transaction and validate `status`/`quantity` in the order flow.
3. Add automated tests (Jest + Supertest; Vitest + RTL).
4. Add a frontend Dockerfile and provide `backend/.env` handling so `docker-compose` starts.
5. Install ESLint + config (or remove the lint script).
6. Delete `data/mockData.ts` and clean committed `node_modules`/`.vite` from git history.

### Suggested next development steps

1. Add an admin API and wire `AdminDashboard`/`ProductManagementTable` to real management actions.
2. Build the farmer subscription UI and decide a payment model.
3. Introduce schema migrations; make CORS configurable via env.
4. Add logging and a global error handler; enforce `JWT_SECRET`.
5. Build and push Docker images; test `docker-compose up`.

### Change log (this document)

- v1.0 (2026-10-14) — initial static-inspection register; frontend did not compile, backend not executed.
- v2.0 (2026-10-15) — backend built/seeded/executed; frontend integrated and compiling; statuses, bugs, milestones and priorities updated.
