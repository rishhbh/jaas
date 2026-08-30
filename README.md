# Judging-as-a-Service (JaaS)

An automated code evaluation and execution platform infrastructure built with Next.js on the client and a high-performance Bun + Express backend.

## Architecture Overview

```
jaas/
├── client/     # Next.js 15 (App Router, TypeScript, Tailwind CSS)
└── server/     # Express.js backend running on Bun runtime with MongoDB & Google OAuth
```

## Tech Stack

### Backend (`/server`)
- **Runtime**: [Bun](https://bun.sh)
- **Framework**: Express.js (ES Modules)
- **Database**: MongoDB via Mongoose
- **Authentication**: Google OAuth (`google-auth-library`) & Dual JWT strategy (`jsonwebtoken`)
- **Cookies**: HTTP-only (`sameSite: 'none'`, `secure: true`) via `cookie-parser`

### Frontend (`/client`)
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS

---

## Authentication Architecture

JaaS uses a secure dual-token Google OAuth authentication workflow:

1. **Google OAuth Verification**: Frontend sends Google ID Token credential to `POST /api/auth/google`.
2. **User Persistence**: User profile (email, name, avatar, provider, providerId) is saved or updated in MongoDB.
3. **Dual JWT Tokens**:
   - **Access Token**: Short-lived (5 minutes) signed JWT stored in HTTP-only cookie.
   - **Refresh Token**: Long-lived (15 days) signed JWT stored in HTTP-only cookie.
4. **Token Security**: Refresh token is hashed using SHA-256 before being persisted in the database.

---

## API Endpoints

### Health Check
- `GET /`
  - **Response**: `200 OK`
  ```json
  {
    "status": "OK",
    "service": "Judging-as-a-Service API",
    "uptime": 120.45,
    "timestamp": "2026-08-30T14:00:00.000Z"
  }
  ```

### Authentication
- `POST /api/auth/google`
  - **Body**: `{ "credential": "<GOOGLE_ID_TOKEN>" }`
  - **Response**: `200 OK` with HTTP-only cookies (`accessToken` & `refreshToken`).

---

## Environment Configuration

Create a `.env` file in the `server` directory based on `server/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/jaas
CLIENT_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id_here
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
```

---

## Getting Started Locally

### 1. Start Backend (`/server`)

```bash
cd server
bun install
bun run dev
```

### 2. Start Frontend (`/client`)

```bash
cd client
npm install
npm run dev
```
