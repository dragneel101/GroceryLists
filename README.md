# GroceryList

A full-stack grocery list app with smart price tracking, shopping mode, and receipt summaries.

## Features

- **Dashboard** — create and manage multiple grocery lists
- **List Editor** — add items with estimated prices (auto-filled from purchase history), quantities, and units
- **Shopping Mode** — check off items and enter actual prices as you shop
- **Receipt** — itemized summary with tax calculation after completing a trip
- **Price Memory** — actual prices are stored per-item and pre-filled as estimates on future lists
- **Discount Calculator** — standalone tool, no login required
- **Profile** — manage your default tax rate

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Axios |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (no ORM — raw `pg` queries) |
| Auth | JWT (access token 15m + refresh token 30d) |
| Deployment | Docker Compose + nginx reverse proxy |

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Docker (optional, for containerised deployment)

## Setup

### 1. Environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```
DATABASE_URL=postgres://user:password@host:5432/dbname
JWT_SECRET=change-me-to-a-random-secret
```

### 2. Database

Run migrations once against your PostgreSQL instance:

```bash
psql $DATABASE_URL -f backend/migrate.sql
```

### 3. Backend

```bash
cd backend
npm install
npm run dev        # hot-reload dev server on :3001
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev        # Vite dev server on :5173, proxies /api → localhost:3001
```

## Docker

Build and start both containers with a single command:

```bash
docker compose up --build
```

- Frontend: `http://localhost:80`
- Backend API: `http://localhost:3001`

The nginx container serves the Vite build and proxies `/api/` to the backend container.

## Project Structure

```
groceryList/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Express app entry point
│   │   ├── db.ts             # pg.Pool singleton
│   │   ├── middleware/
│   │   │   └── auth.ts       # requireAuth JWT middleware
│   │   └── routes/
│   │       ├── auth.ts       # POST /api/auth/register, /login, /refresh
│   │       ├── users.ts      # GET/PATCH /api/users/me
│   │       ├── items.ts      # GET /api/items (item catalog)
│   │       ├── lists.ts      # CRUD /api/lists
│   │       └── listItems.ts  # CRUD /api/lists/:id/items
│   ├── migrate.sql
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # Router + PrivateRoute / PublicRoute guards
│   │   ├── api/client.ts     # Axios instance with silent token refresh
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   └── pages/
│   │       ├── Landing.tsx
│   │       ├── Login.tsx
│   │       ├── Register.tsx
│   │       ├── Dashboard.tsx
│   │       ├── ListEditor.tsx
│   │       ├── ShoppingMode.tsx
│   │       ├── Receipt.tsx
│   │       ├── Profile.tsx
│   │       └── DiscountCalculator.tsx
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Data Model

```
users
  └── grocery_lists
        └── grocery_list_items ──┐
  └── items (catalog) ←──────────┘  (item_id FK, nullable)
```

- `grocery_list_items.actual_price` updates `items.last_price` on save — this is how estimated prices are auto-populated on future lists.
- `grocery_lists.status`: `draft` → `active` → `completed`
- `users.default_tax_rate` seeds new lists; lists store their own `tax_rate`.

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Get access + refresh tokens |
| POST | `/api/auth/refresh` | — | Exchange refresh token |
| GET | `/api/users/me` | Yes | Current user profile |
| PATCH | `/api/users/me` | Yes | Update name / tax rate |
| GET | `/api/items` | Yes | Item catalog (for autocomplete) |
| GET | `/api/lists` | Yes | All lists for user |
| POST | `/api/lists` | Yes | Create list |
| GET | `/api/lists/:id` | Yes | Single list |
| PATCH | `/api/lists/:id` | Yes | Update list |
| DELETE | `/api/lists/:id` | Yes | Delete list |
| GET | `/api/lists/:id/items` | Yes | Items in a list |
| POST | `/api/lists/:id/items` | Yes | Add item to list |
| PATCH | `/api/lists/:id/items/:itemId` | Yes | Update item (price, checked, etc.) |
| DELETE | `/api/lists/:id/items/:itemId` | Yes | Remove item |

## Available Scripts

### Backend

```bash
npm run dev     # ts-node-dev with hot reload
npm run build   # tsc → dist/
npm start       # node dist/index.js
```

### Frontend

```bash
npm run dev     # Vite dev server
npm run build   # tsc + vite build → dist/
npm run preview # serve production build locally
```
