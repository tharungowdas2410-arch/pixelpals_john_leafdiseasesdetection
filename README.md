# Plant Disease Spotter – Backend

Node.js + TypeScript backend for the Plant Disease Spotter platform with Google OAuth2, role-aware prediction pipelines, Prisma + PostgreSQL, Socket.IO sensor streaming, and Dockerized deployment.

## Features

- OAuth2 with Google (Passport.js) + JWT access/refresh tokens
- Role-based authorization for Farmer, Agricultural Industry, Pharmaceutical Industry, and Admin
- Multer-based image uploads forwarded to Python inference microservice
- Role-specific enrichment of prediction responses and persistence in PostgreSQL
- Sensor ingestion API with real-time Socket.IO broadcasting
- Plant and disease knowledge base with admin CRUD APIs
- Prisma ORM schema + seed script
- Winston logging, Helmet/CORS, rate limiting, request validation
- Docker Compose stack: backend, Postgres, Redis, inference microservice, Nginx reverse proxy

## Getting Started

### 1. Install dependencies

```bash
cd backend
npm install
```

For the frontend SPA (Vite + React):

```bash
cd ../frontend
npm install
```

### 2. Set up environment variables

Copy `env.example` to `.env` and fill the values (Google OAuth, JWT secrets, DB URL, etc.).
Copy `frontend/env.example` to `frontend/.env` and set `VITE_API_URL` (default `/api` when served behind nginx).

### 3. Prisma

```bash
npx prisma generate
npx prisma migrate dev
npx ts-node prisma/seed.ts
```

### 4. Development server

```bash
npm run dev
```

The frontend dev server can run in parallel:

```bash
cd ../frontend
npm run dev
```

Vite will proxy all API calls to whatever `VITE_API_URL` you configured.

### 5. Docker deployment

```bash
cp env.example .env
cp ../frontend/env.example ../frontend/.env
docker compose up --build
```

This spins up Postgres, Redis, inference placeholder, backend API, Vite-powered frontend, and Nginx reverse proxy (port 80). Requests to `/api/*` are routed to Express; all other routes serve the React frontend. The backend service runs `prisma migrate deploy` before serving traffic.

## Key Scripts

- `npm run dev` – Nodemon + ts-node watcher
- `npm run build` – TypeScript compilation
- `npm run start` – Run compiled server
- `npm run prisma:dev` – Run Prisma migrations locally
- `npm run prisma:seed` – Seed roles/permissions + knowledge base

## Project Structure

```
backend/
  src/
    controllers/    # Request handlers
    services/       # Business logic
    routes/         # Express routers
    middlewares/    # Auth, roles, rate limit, upload
    config/         # Env, passport, Prisma
    utils/          # Logger, JWT, Socket.IO helpers
    app.ts          # Express app setup
    server.ts       # HTTP + Socket.IO bootstrap
  prisma/
    schema.prisma
    seed.ts
  docker/           # Service-specific Dockerfiles/configs
  uploads/          # Multer temp storage (mounted volume)
  Dockerfile
  docker-compose.yml
```

## API Overview

- `GET /health`
- `GET /api/auth/google` – Initiate Google OAuth
- `GET /api/auth/google/callback` – Returns JWT tokens
- `POST /api/auth/manual` – lightweight email+role login for SPA development
- `POST /api/auth/refresh` – Exchange refresh token
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/predict` – Upload image and receive role-based output
- `GET /api/predict/history` – Fetch recent predictions for current user
- `POST /api/sensor` – (Industry/Admin) Submit sensor data + broadcast
- `GET /api/sensor/history`
- `GET /api/plant/:species` – Plant knowledge lookup
- `GET /api/admin/predictions`
- `POST /api/admin/plant/add`
- `POST /api/admin/disease`, `PUT/DELETE /api/admin/disease/:id`
- `POST /api/admin/market-price`

All authenticated routes expect a `Bearer <accessToken>` header.

## Testing the Workflow

1. `GET /api/auth/google` → complete OAuth flow.
2. Use the returned `accessToken` to call `POST /api/predict` with `multipart/form-data` field `image`.
3. Industry users can `POST /api/sensor` with `{ ph, ec, moisture, temperature }` to emit updates over Socket.IO (`sensor:update` events).
4. Admin users manage plant/disease catalogues and inspect predictions via `/api/admin/*`.

## Socket.IO & Frontend Integration

- Socket.IO server is exposed via the backend container; nginx proxies `/socket.io/*`.
- React frontend consumes REST endpoints via `VITE_API_URL` (default `/api`), stores JWTs locally, and reads latest predictions from `/api/predict` + `/api/predict/history`.
- `sensor:update` – Emitted to the user room whenever they submit readings.
- `sensor:public` – Broadcast for dashboards requiring aggregated live data.

## Logging & Monitoring

- Winston JSON logs (info/error) + colorized console output.
- Rate limits guard `/api/*` and `/api/auth/*`.
- Health endpoint for container orchestration checks.

## Inference Microservice

A lightweight Flask placeholder (`docker/inference`) mimics responses. Replace `app.py` with the real model inference implementation; keep the `/predict` interface identical.

## Next Steps

- Integrate Redis caching for plant metadata or rate limiting tokens.
- Hook up production-ready monitoring (Prometheus, Grafana) and alerting.
- Replace placeholder inference service with production ML deployment.

