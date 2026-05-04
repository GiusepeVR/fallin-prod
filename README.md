# FallIn

Browser-based 3D gyroscope maze game. Roll the ball, collect orbs, escape the floor.

## Repo layout

```
fallin/
├── frontend/          # static index.html — deploy to Vercel
│   └── index.html
├── backend/           # Express + Prisma — deploy to Railway
│   ├── src/
│   ├── prisma/
│   └── package.json
└── vercel.json
```

## Frontend

Single static `frontend/index.html`. No build step. Open it in a browser to play.

Vercel deploy: set the project's **Root Directory** to `frontend`.

To point the frontend at a deployed backend, inject this in the `<head>` (before the main `<script>` block):
```html
<script>window.FALLIN_API_URL = 'https://your-backend.railway.app';</script>
```

If unset, the frontend defaults to `http://localhost:3001` and silently no-ops auth/leaderboard requests when offline.

## Backend

Express + Prisma + Postgres. JWT auth (30-day tokens), bcrypt password hashes.

Local dev:
```bash
cd backend
cp .env.example .env       # set DATABASE_URL, JWT_SECRET
npm install
npx prisma migrate dev --name init    # first time only — creates the schema
npm run dev
```

Endpoints:
- `POST /auth/register` `{ username, password }` → `{ token, user }`
- `POST /auth/login` `{ username, password }` → `{ token, user }`
- `POST /scores` (auth) `{ points, level, timeMs }` → `{ id }`
- `GET /scores/global` → top 20 leaderboard
- `GET /health` → `{ ok: true }`

Railway deploy:
1. Connect this repo, set **Root Directory** to `backend`.
2. Attach the Postgres plugin.
3. Set env vars: `JWT_SECRET`, `FRONTEND_URL` (your Vercel URL).
4. After first deploy, run `npm run db:migrate` from the Railway shell.

## Game features

- Procedurally generated maze, growing each level.
- Tilt (gyro), keyboard, or virtual joystick controls.
- Auto-detects device and shows device-appropriate onboarding hints.
- English / Spanish UI based on browser locale.
- Progress auto-saved to `localStorage` after each level.
- Patrolling enemies appear from floor 4 onward.
- Optional account for cross-device leaderboard; anonymous play always available.
