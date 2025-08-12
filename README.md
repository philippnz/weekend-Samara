
# Weekend in Samara — Render-ready ZIP

## Quick start (local)
cd backend
cp .env.example .env
npm install
npm run migrate
npm run seed
npm start

Open http://localhost:3000 (frontend), http://localhost:3000/admin (admin), http://localhost:3000/api/routes (API).

Set TELEGRAM_BOT_TOKEN in .env to enable bot. Command /app sends a button with WebApp URL (BASE_URL).

## Render deploy
- Root Directory: backend
- Build Command: npm install && node migrations.js && node seed.js
- Start Command: node index.js
- Env: PORT=3000, DB_PATH=./data.sqlite, BASE_URL=https://YOUR-RENDER-DOMAIN
