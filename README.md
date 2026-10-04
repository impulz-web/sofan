# Sofan

This project is a production-oriented Next.js foundation for future feature development. It establishes the architecture, design system, accessibility rules, and performance standards that every following feature must follow.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000 to view the foundation app.

## Documentation

See the internal development guide in [docs/architecture.md](docs/architecture.md).

## Core standards

- App Router with server-first rendering and intentional client boundaries
- Centralized design tokens for layout, color, spacing, type, and motion
- Reusable UI primitives rather than one-off markup
- Accessibility, responsive behavior, and reduced-motion support by default
- Performance-conscious defaults: no unnecessary client state or animation libraries
