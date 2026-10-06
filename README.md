# scar-patte

Scar-Patte’s multilingual grooming website, with appointment requests and a protected administration page.

## Development

```sh
npm ci
npm run build
npm run dev
```

The local preview runs at `http://127.0.0.1:4173`, uses a separate SQLite database, and signs in as a local test owner. Local data is excluded from Git.

## Validation

```sh
npm test
```

Database schema lives in `db/schema.ts`; migrations are generated with `npm run db:generate`. Committed migrations are applied by Sites during deployment.

## Deployment

This project uses Sites hosting. Build output contains a Cloudflare Worker and static assets. Production requests are stored in D1. Set the runtime `ADMIN_EMAIL` to the authorized owner’s account; never store secrets in source. The admin page is available at `/admin`.

Page source is in `web/`, server routes in `server/`, and build output in `dist/`. Image sources and free-stock licenses are recorded in `IMAGE-SOURCES.md`.

## Railway

Railway runs `npm run build` then `npm start` on Node 24. The server listens on `0.0.0.0:$PORT`; `/health` checks the database. Mount a persistent volume at `/data` and set `DB_PATH=/data/requests.sqlite`. Configure `ADMIN_USERNAME`, a strong `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` as Railway variables. `/admin/login` uses an eight-hour HttpOnly signed session. Visitor-supplied Sites identity headers are stripped. Railway and Sites have separate databases; this does not migrate existing Sites requests.
