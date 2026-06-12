# Checkers Game

A modern checkers (damas) game with AI opponent, authentication, skin purchases, and cross-device ranking.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS 4 |
| Backend | Bun + Elysia + MongoDB (Mongoose) |
| Auth | Clerk (JWT, stateless) |
| Payments | Stripe Checkout |
| AI | A* search algorithm |
| Deployment | Docker Compose |

## Features

- **Classic 8x8 checkers** against an AI opponent using A* search
- **Clerk authentication** — sign in with Google, GitHub, or email
- **Stripe skins** — purchase board/piece color themes
- **Persistent ranking** — win/loss records stored in MongoDB, viewable from any device
- **Cross-device** — log in on any device and your ranking follows you

## Architecture

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│  React  │────▶│  Elysia │────▶│ MongoDB │
│  (Vite) │     │  (Bun)  │     │         │
└────┬────┘     └────┬────┘     └─────────┘
     │                │
     ▼                ▼
  Clerk JWT       Stripe API
```

### Request flow

1. User signs in via Clerk (modal popup)
2. Clerk issues a JWT — frontend attaches it as `Authorization: Bearer <token>` to every API call
3. API verifies the JWT with Clerk backend SDK
4. On game end, result is posted to `POST /users/game-result` → rating updated in MongoDB
5. Ranking page fetches `GET /ranking` → sorted list from DB

### AI (A*)

The AI in `web/src/game/AIPlayer.ts` uses A* search:

- **State**: board configuration + king status
- **Heuristic**: `3×king + 1×man + 0.1×advancement` for each AI piece, negated for opponent
- **Expansion**: generates all legal moves (captures forced), evaluates to depth 3
- **Selection**: chooses the move with the highest `f(n) = g(n) + h(n)` score

### Payment flow

1. Player clicks "Buy" on a skin in the Shop
2. Frontend calls `POST /skins/create-checkout` → creates Stripe Checkout session
3. Redirects to Stripe, payment processed
4. Stripe sends webhook to `POST /skins/webhook`
5. Webhook adds `skinId` to user's `ownedSkins` array in MongoDB
6. Player can now equip the skin

## Setup

### Prerequisites

- [Bun](https://bun.sh) (for API)
- [Node.js](https://nodejs.org) >= 22 (for web build, optional if using Bun for everything)
- [MongoDB](https://mongodb.com) 7+ (local or Atlas)
- Clerk account (free tier)
- Stripe account (free tier)

### 1. Clone and install

```bash
cd checkers-game

# API
cd api
bun install
cp .env.example .env
# Edit .env with your keys

# Web
cd ../web
bun install
cp .env.example .env.local
# Edit .env.local with your keys
```

### 2. Environment variables

**`api/.env`**
```
MONGODB_URI=mongodb://localhost:27017/checkers
CLERK_SECRET_KEY=sk_test_...        # From Clerk Dashboard → API Keys
STRIPE_SECRET_KEY=sk_test_...       # From Stripe Dashboard
STRIPE_WEBHOOK_SECRET=whsec_...     # From Stripe CLI/webhook settings
FRONTEND_URL=http://localhost:5173
PORT=3000
```

**`web/.env.local`**
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:3000
```

### 3. Configure Clerk

1. Create an application at https://dashboard.clerk.com
2. Under **API Keys**, copy the Publishable Key to `VITE_CLERK_PUBLISHABLE_KEY` and the Secret Key to `CLERK_SECRET_KEY`
3. Under **Sessions**, configure JWT template (default is fine)
4. Add OAuth providers (Google, GitHub) or enable email/password

### 4. Configure Stripe

1. Create a Stripe account at https://dashboard.stripe.com
2. Create products/prices for each skin (prices in cents):
   - Ocean Deep: $2.99 (price_xxx)
   - Midnight: $2.99 (price_xxx)
   - Royal Crimson: $4.99 (price_xxx)
   - Neon Nights: $4.99 (price_xxx)
3. Copy the price IDs to `api/src/seed.ts` (replace the placeholders)
4. Copy Stripe secret key to `STRIPE_SECRET_KEY`
5. Set up webhook endpoint → `http://localhost:3000/skins/webhook` (use Stripe CLI for local dev)
6. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 5. Seed the database

```bash
cd api
bun run seed
```

This inserts the 5 default skins (Classic is free, others require purchase).

### 6. Run

```bash
# Start MongoDB (if local)
mongod

# Terminal 1: API
cd api
bun run dev

# Terminal 2: Web
cd web
bun run dev
```

Open http://localhost:5173

### Docker (full stack)

```bash
docker compose up --build
```

This starts MongoDB, API (port 3000), and Web (port 8080 via Nginx).

## Project structure

```
checkers-game/
├── api/
│   ├── src/
│   │   ├── index.ts          # Entry point, routes
│   │   ├── db.ts             # MongoDB connection
│   │   ├── seed.ts           # Skin seeder
│   │   ├── middleware/
│   │   │   └── auth.ts       # Clerk JWT verification
│   │   ├── models/
│   │   │   ├── User.ts       # User + ranking fields
│   │   │   ├── Skin.ts       # Skin definitions
│   │   │   └── Game.ts       # Game history
│   │   └── routes/
│   │       ├── ranking.ts    # GET /ranking
│   │       ├── skins.ts      # Shop + Stripe webhook
│   │       └── users.ts      # Sync + game results
│   ├── package.json
│   └── Dockerfile
├── web/
│   ├── src/
│   │   ├── main.tsx          # React entry
│   │   ├── App.tsx           # Router + Clerk provider
│   │   ├── index.css         # Tailwind base
│   │   ├── lib/
│   │   │   ├── api.ts        # HTTP client with Clerk token
│   │   │   └── stripe.ts     # Stripe init
│   │   ├── game/
│   │   │   ├── CheckersGame.ts  # Board logic, moves, captures
│   │   │   └── AIPlayer.ts      # A* AI opponent
│   │   ├── store/
│   │   │   └── gameStore.ts     # Zustand game state
│   │   ├── components/
│   │   │   ├── Board.tsx        # Checkers board render
│   │   │   ├── GameControls.tsx # New game, save result
│   │   │   ├── Header.tsx       # Nav + auth buttons
│   │   │   └── SessionSync.tsx  # Token injection
│   │   └── pages/
│   │       ├── GamePage.tsx     # Play screen
│   │       ├── RankingPage.tsx  # Leaderboard
│   │       └── ShopPage.tsx     # Skin store
│   ├── package.json
│   ├── Dockerfile
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```

## API routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | — | Health check |
| `POST` | `/users/sync` | Clerk | Create/update user |
| `POST` | `/users/game-result` | Clerk | Submit game result (updates rating) |
| `GET` | `/ranking` | — | Get leaderboard |
| `GET` | `/ranking/:clerkId` | — | Get single user |
| `GET` | `/skins` | — | List all skins |
| `POST` | `/skins/create-checkout` | Clerk | Create Stripe checkout session |
| `POST` | `/skins/webhook` | Stripe sig | Handle successful payments |
| `POST` | `/skins/equip` | Clerk | Equip owned skin |

## Ranking system

- Each user starts at **1000 rating** (ELO-like)
- Win: **+25**, Loss: **-25**, Draw: **+5**
- Ranking is stored in MongoDB → accessible from any device after login
- Only users with at least 1 game played appear on the leaderboard
- Sorted by rating descending

## Skins

| Skin | Price | Board | Pieces |
|------|-------|-------|--------|
| Classic | Free | Wood tones | Black / White |
| Ocean Deep | $2.99 | Light blue / Ocean | Dark blue / White |
| Midnight | $2.99 | Dark purple / Near black | Green neon / Red neon |
| Royal Crimson | $4.99 | Beige / Dark red | Gold / White |
| Neon Nights | $4.99 | Dark blue / Indigo | Magenta / Cyan |
