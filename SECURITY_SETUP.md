# Admin security setup

The previous browser `localStorage` content store was not suitable for protected, shared administration. Content now persists in Neon PostgreSQL, and every write is authorized by the Express server in `server/index.mjs`.

## Configure the owner account

1. Run `npm run hash-admin` and enter a strong password.
2. Copy `.env.example` to `.env`.
3. Set `ADMIN_IDENTIFIER` to the owner's email or username.
4. Put the generated bcrypt value in `ADMIN_PASSWORD_HASH`.
5. Set `DATABASE_URL` to your Neon PostgreSQL connection string.
6. Run `npm run migrate` to initialize the database and import existing JSON content.
7. Never commit `.env` or expose either value through a `VITE_` variable.

## Database setup

Create a Neon PostgreSQL database and get your connection string from the Neon dashboard.

```sql
-- The schema is created automatically on first server start via initDb()
-- Tables: content_entries (id, type, title, category, excerpt, image, gallery, status, created_at, updated_at)
```

Run the migration to import existing content:

```bash
npm run migrate
```

## Run

- Development: `npm run dev`
- Production: `npm run build && npm start`

Production must be deployed behind HTTPS. The session cookie is `HttpOnly`, `Secure`, and `SameSite=Strict` in production. Sessions expire after `SESSION_HOURS` and are invalidated by server restarts or logout.

Sessions are stored in-memory (serverless-friendly single instance). For multi-instance deployments, replace the in-memory session map with a shared session store such as Redis.

Image uploads are stored as data URLs or external URLs in the database (not on the Vercel filesystem). For production, configure external object storage (S3/R2/Neon Object Storage) and store image URLs in the `image` and `gallery` fields.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `ADMIN_IDENTIFIER` | Yes | Admin email or username |
| `ADMIN_PASSWORD_HASH` | Yes | Bcrypt hash of admin password |
| `SESSION_HOURS` | No | Session duration in hours (default: 8) |
| `PORT` | No | Server port (default: 5173) |
| `NODE_ENV` | No | `production` or `development` |
