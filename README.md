# Cogniform — Enterprise Intelligent Form Builder & Response Platform

Cogniform is an end-to-end, enterprise-grade form management platform and dynamic drag-and-drop builder engineered with **NestJS 10**, **Next.js 15 App Router**, **Prisma ORM**, **Turborepo**, and **TypeScript**.

---

## Key Features

- **JWT Authentication & RBAC**: Argon2 password hashing, httpOnly cookies, 15m access / 7d refresh tokens, role-based access control (`OWNER`, `ADMIN`, `EDITOR`, `VIEWER`).
- **Workspaces & Teams**: Multi-tenant workspace switcher, team invitations, and centralized audit logging.
- **17-Field Type Drag-and-Drop Builder**: Driven by `@cogniform/utils` registry with live canvas preview and properties inspector.
- **Conditional Logic Engine**: Dynamic `SHOW`, `HIDE`, `REQUIRE`, `DISABLE`, and `SET_VALUE` rules evaluated per keystroke.
- **Public Form Rendering & Response Capture**: End-user public form pages (`/f/[slug]`) with multi-step section pagination and response duration tracking.
- **Analytics Dashboard**: Recharts visualizer rendering total views, response metrics, conversion rates, and device distribution.
- **Integrations & Webhooks**: HMAC-SHA256 signed HTTP webhooks dispatch worker with Slack, Notion, and Google Sheets adapter cards.
- **Version Control & Collaboration**: Immutable published form version snapshots with restore history drawer.
- **AI Features**: Prompt-to-Form generator producing complete multi-field forms from plain text descriptions.
- **Streaming Response Exports**: One-click response data CSV export endpoints.

---

## Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: v20+
- **pnpm**: v9+
- **Docker** (for local PostgreSQL & Redis containers)

### 2. Infrastructure Setup
```bash
# Start local PostgreSQL and Redis containers
docker compose -f docker/docker-compose.yml up -d

# Install dependencies across all monorepo packages
pnpm install

# Generate Prisma Client
pnpm db:generate
```

### 3. Run Development Servers
```bash
# Launch NestJS API (port 4000) and Next.js Web App (port 3000)
pnpm dev
```

---

## Verification & Monorepo Validation
```bash
# Type check all packages
pnpm type-check

# Production build all packages
pnpm build
```
