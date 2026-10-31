# Admin security setup

The previous browser `localStorage` content store was not suitable for protected, shared administration. Content now persists in `server/data/content.json`, and every write is authorized by the Express server in `server/index.mjs`.

## Configure the owner account

1. Run `npm run hash-admin` and enter a strong password of at least 12 characters.
2. Copy `.env.example` to `.env`.
3. Set `ADMIN_IDENTIFIER` to the owner's email or username.
4. Put the generated bcrypt value in `ADMIN_PASSWORD_HASH`.
5. Never commit `.env` or expose either value through a `VITE_` variable.

## Run

- Development: `npm run dev`
- Production: `npm run build && npm start`

Production must be deployed behind HTTPS. The session cookie is `HttpOnly`, `Secure`, and `SameSite=Strict` in production. Sessions expire after `SESSION_HOURS` and are invalidated by server restarts or logout.

For a multi-instance deployment, replace the in-memory session map and JSON content file with a shared database and server-side session store such as PostgreSQL and Redis. The same `/api/admin/*` authorization boundary should remain in place.