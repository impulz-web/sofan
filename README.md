# Sofan

This project is a production-oriented Next.js foundation for future feature development. It establishes the architecture, design system, accessibility rules, and performance standards that every following feature must follow.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000 to view the foundation app.

## SOFAN admin demo

The administration interface is available at `/sofan`. Dashboard, Finance, News, and Events switch client-side without changing that route.

The admin reads and writes PostgreSQL data using `DATABASE_URL`. Copy `.env.example` to `.env.local`, set the existing PostgreSQL connection string, then apply the schema and clearly marked demo rows:

```bash
psql "$DATABASE_URL" -f db/schema.sql
psql "$DATABASE_URL" -f db/seed.sql
```

The route shows a database setup/unavailable state instead of fabricated totals when PostgreSQL is not connected. Demo mode has no password by design; add authentication and authorization before exposing this interface outside a trusted demo environment.

## Documentation

See the internal development guide in [docs/architecture.md](docs/architecture.md).

## Core standards

- App Router with server-first rendering and intentional client boundaries
- Centralized design tokens for layout, color, spacing, type, and motion
- Reusable UI primitives rather than one-off markup
- Accessibility, responsive behavior, and reduced-motion support by default
- Performance-conscious defaults: no unnecessary client state or animation libraries
