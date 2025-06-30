# Jordi

VOLKSFEST APP for Wuidi.at

## Setup

### Backend
1. Copy `backend/.env.example` to `backend/.env` and update the values.
2. Install dependencies and start the server:
   ```sh
   cd backend
   npm install
   npm run dev
   ```

### Frontend
1. Install dependencies and start the development server:
   ```sh
   cd frontend
   npm install
   npm start
   ```

The frontend proxies API requests to `http://localhost:5000` by default (see `frontend/package.json`).
