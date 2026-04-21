# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (`backend/`)
```bash
npm run dev        # ts-node-dev with hot reload (requires DATABASE_URL + JWT_SECRET env vars)
npm run build      # tsc → dist/
npm start          # node dist/index.js (production)
```

### Frontend (`frontend/`)
```bash
npm run dev        # Vite dev server on :5173, proxies /api → localhost:3001
npm run build      # tsc + vite build → dist/
npm run preview    # serve the production build locally
```

### Database
```bash
psql $DATABASE_URL -f backend/migrate.sql   # run once to create all tables
```

### Docker
```bash
docker compose up --build   # builds both images and starts on :80 (frontend) and :3001 (backend)
```

Environment variables needed: `DATABASE_URL` (postgres connection string) and `JWT_SECRET`. Copy `.env.example` to `.env`.

## Architecture

Two independent packages (`backend/`, `frontend/`) — no shared code or monorepo tooling.

### Backend — Express + TypeScript + pg

- **`src/db.ts`** — single `pg.Pool` exported as default, created from `DATABASE_URL`. All routes import this directly; no ORM.
- **`src/middleware/auth.ts`** — `requireAuth` middleware adds `req.userId` (UUID string) from the JWT. Routes that need auth extend `AuthRequest` from this file.
- **`src/routes/`** — one file per resource. `lists.ts` and `listItems.ts` are registered on the same `/api/lists` prefix in `index.ts`.
- JWT uses two token types: access (`15m`, `{ userId }`) and refresh (`30d`, `{ userId, type: "refresh" }`). Both signed with `JWT_SECRET`.

**Key side-effect in `listItems.ts`:** whenever `actual_price` is saved on a `grocery_list_items` row (on create or patch), the route also upserts `items.last_price`. This is how future lists auto-populate `estimated_price` from purchase history.

### Frontend — React + Vite + Tailwind

- **`src/api/client.ts`** — axios instance with a response interceptor that silently refreshes the access token on 401 and replays the queued request. All pages import `api` from here, never raw axios.
- **`src/context/AuthContext.tsx`** — wraps the app; exposes `user`, `login`, `register`, `logout`, `refreshUser`. Token storage is `localStorage` (`access_token` / `refresh_token`).
- **`src/App.tsx`** — React Router v6 with `PrivateRoute` / `PublicRoute` wrappers.
- Pages follow the shopping flow: `Dashboard` → `ListEditor` → `ShoppingMode` → `Receipt`.
- Styling is plain Tailwind utility classes (no shadcn component wrappers yet). CSS variables for the design tokens are defined in `src/index.css`.

### Data model relationships
```
users → grocery_lists → grocery_list_items
users → items (catalog)
grocery_list_items.item_id → items (nullable — new items create a catalog entry on add)
```

### Deployment (Coolify)
`docker-compose.yml` runs two containers. The frontend nginx serves the Vite dist and proxies `/api/` to `http://backend:3001` via `frontend/nginx.conf`. The database is external — only `DATABASE_URL` connects to it.
