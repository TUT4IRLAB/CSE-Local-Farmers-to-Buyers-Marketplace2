# Documentation Gaps, Assumptions and Conversion Status

**Version:** 2.0 | **Updated:** 2026-10-15

This file records anything the generated documentation could not establish from the source, plus environment limitations. v2.0 reflects that the backend, database and frontend build were executed on 2026-10-15.

## 1. Format conversion status

| Desired format | Tool available? | Result |
|---|---|---|
| Markdown (`*.md`) | Yes (written directly) | Generated / updated |
| CSV | Yes (written directly) | `docs/PROJECT_TRACKER.csv` generated / updated |
| OpenAPI/Swagger YAML | N/A | **Not generated** - see section 3 |
| PDF | No (`pandoc`, `wkhtmltopdf`, `soffice`/LibreOffice absent) | **Not available** |
| DOCX | No (`pandoc`, `soffice`/LibreOffice absent) | **Not available** |

Markdown sources are complete. PDF/DOCX are not produced because no conversion tool is installed. Install Pandoc or LibreOffice to convert the Markdown files.

## 2. Facts — status update (2026-10-15)

| Topic | v1.0 status | v2.0 status |
|---|---|---|
| Was the backend ever run successfully? | UNKNOWN | **ESTABLISHED** — built, seeded and started; `GET /` and `/api/products` return 200 |
| Is `schema.sql` applied to any database? | UNKNOWN | **ESTABLISHED** — applied to local Docker `farmfoods-pg`; both schema files applied |
| Were any endpoints manually tested? | UNKNOWN | **ESTABLISHED** — register/login/products/orders/status all exercised (see `SERVER_API_DOCUMENTATION.md` §7) |
| Was `services/api.ts` ever wired up? | NOT FOUND | **ESTABLISHED** — imported by all contexts and `CheckoutFlow` |
| Deployment history / dates / milestones | UNKNOWN | Still UNKNOWN (no CI/history) |
| Intended payment provider | UNKNOWN | Still UNKNOWN (checkout is a demo; no charge) |
| Intended production CORS/domain | UNKNOWN | Still UNKNOWN (only `http://localhost:5173`) |
| Admin API design | NOT FOUND | Still NOT FOUND (no admin endpoints) |
| Intended file/upload strategy | NOT FOUND | Still NOT FOUND (image URLs only) |

## 3. Why no OpenAPI spec was generated

An OpenAPI document asserts HTTP status codes, schemas and validation. The API has now been executed, but several behaviours remain intentionally loose (arbitrary order-status strings accepted, no field validation, non-transactional order creation). Publishing a machine-readable spec would over-promise. The verified endpoint reference is in `SERVER_API_DOCUMENTATION.md` (section 7 lists observed results). An OpenAPI file can be authored once validation is hardened.

## 4. Assumptions that must NOT be treated as facts (remaining)

- The **subscription** feature is usable: its table is still in a separate schema file, and there is no UI or payment. *Not verified.*
- The **admin dashboard** performs real management: it is read-only and the backend has no admin endpoints. *Management actions are not available.*
- The `default_secret_change_me` JWT fallback: treat the deployment secret as UNKNOWN; the local `.env` only sets a development secret.
- Docker deployment: `docker-compose up` still does not work (no frontend Dockerfile).

### No longer assumptions (now verified — see v2.0 status in section 2)

- The backend runs, connects to the database, and serves all core endpoints.
- The frontend compiles and calls the backend API for auth, catalog, checkout and orders.

## 5. Verification performed on 2026-10-15

1. Backend dependencies installed; local Docker PostgreSQL (`farmfoods-pg`, port 5433, SSL on) created.
2. Both schema files applied; `npm run seed` succeeded (2 farmers, 2 buyers, 1 admin, 7 products, 2 orders).
3. `npm run build` (backend) exit 0; server started; `GET /` and `GET /api/products` return 200.
4. API flows exercised: register (201), login (200), product create (201), order create (201, `total_price=R13.50`), status patch (200 → `approved`), buyer/farmer order listings, product delete-with-orders (400 after fix).
5. Frontend `npm run build` (`tsc && vite build`) exit 0.

## 6. Still needed before docs can be considered fully "verified"

1. Add and run automated tests (backend + frontend) — the only remaining gap for runtime confidence.
2. Apply and exercise the **subscription** endpoints (schema file still separate).
3. Build the frontend Docker image so the `docker-compose` stack can start.
4. Harden validation (order status enum, quantity, product fields) and add a DB transaction to order creation.
