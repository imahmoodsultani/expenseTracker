# Research: Expense Tracker App

**Phase 0 Output** | Branch: `001-expense-tracker-app` | Date: 2026-04-15  
**Override applied**: Database changed to MySQL per user instruction.

---

## Technology Decisions

### 1. Framework & Language

**Decision**: Next.js 14+ (App Router) with TypeScript  
**Rationale**: App Router provides server components, server actions, and built-in route handling — reducing boilerplate for a full-stack app. TypeScript ensures type safety across schema, API, and UI layers.  
**Alternatives considered**: Remix (good choice but Vercel-native DX is better with Next.js), plain React + Express (more setup, less integrated).

---

### 2. Authentication

**Decision**: Auth.js v5 (NextAuth) with Credentials provider + Prisma adapter  
**Rationale**: Built specifically for Next.js App Router; handles email/password auth natively; database-backed sessions via Prisma adapter mean no extra vendor dependency. Zero cost.  
**Alternatives considered**: Clerk (excellent DX but paid at scale and adds vendor lock-in for a simple personal tool).  
**Key consideration**: Passwords hashed with `bcryptjs` before storage; no plain-text credentials ever persisted.

---

### 3. Database

**Decision**: MySQL — hosted on **Aiven for MySQL** (via Vercel Marketplace)  
**Rationale**: User-specified MySQL. Aiven for MySQL is the most practical Vercel-native MySQL option: available directly in the Vercel Marketplace, supports standard MySQL with full foreign key constraints, and provides a free trial. Supports all relational features needed (FK, self-referential joins, decimal types).  
**Alternatives considered**:

- Neon Postgres — rejected (user override to MySQL)
- PlanetScale — MySQL-compatible (Vitess) but no free tier; uses `relationMode = "prisma"` to emulate FKs, adding complexity
- Railway MySQL — good but not Vercel Marketplace native

**Key consideration**: Full FK support means standard Prisma schema with `@relation` directives and no `relationMode = "prisma"` workarounds needed.

---

### 4. ORM

**Decision**: Prisma  
**Rationale**: Schema-first design, auto-generated migrations, and strong TypeScript types. Works seamlessly with MySQL — datasource set to `mysql`. Handles the self-referential `Expense` relationship (recurrence parent/child) and soft-deleted categories cleanly.  
**MySQL-specific notes**:

- `Boolean` maps to `TINYINT(1)` — Prisma handles this transparently
- `DateTime` maps to `DATETIME(3)` for millisecond precision
- `Decimal` supported natively
- `@default(cuid())` supported for string PKs

**Alternatives considered**: Drizzle (faster, lighter, but more verbose for complex schemas; fewer ecosystem guides for Auth.js adapter).

---

### 5. Recurring Expense Generation

**Decision**: Vercel Cron Job running daily at 02:00 UTC  
**Rationale**: Reliable server-side scheduling; zero client dependency; audit log visible in Vercel dashboard. Daily resolution is sufficient (weekly/monthly/yearly frequencies).  
**Pattern**: Cron handler queries all expenses where `isRecurring = true AND nextDueDate <= today`. For each match, inserts a new Expense row (copying title, amount, category, description, setting `recurrenceParentId`), then advances `nextDueDate` to the next interval.  
**Idempotency**: Uses a `recurrenceLastGeneratedDate` field to prevent duplicate generation on retries.  
**Alternatives considered**: Lazy on-login generation (unreliable if user doesn't log in on the due date); client-side trigger (breaks if browser is closed).

---

### 6. CSV Export

**Decision**: Server-side streaming response (Next.js Route Handler)  
**Rationale**: Handles unlimited rows without blocking UI; runs in the serverless context with proper `Content-Disposition: attachment` headers; no client-side library needed.  
**Pattern**: Route handler queries filtered expenses, formats rows as CSV string, returns with `Content-Type: text/csv; charset=utf-8` and `Content-Disposition: attachment; filename="report.csv"`.  
**Alternatives considered**: Client-side PapaParse (breaks on large datasets; requires all data to be in browser memory first).

---

### 7. Form Validation

**Decision**: React Hook Form + Zod  
**Rationale**: RHF provides real-time client-side feedback (highlight missing fields immediately); Zod schemas are defined once and reused in both the form and server-side validation (API route / server action).  
**Key pattern**: Single schema file at `lib/schemas/` — imported by both UI components and route handlers.  
**Alternatives considered**: Server Actions only with Zod (no real-time client feedback; every field error requires a round trip).

---

### 8. Data Visualisation (Reports)

**Decision**: Recharts  
**Rationale**: React-native (no DOM manipulation), works as Client Component in App Router, ~60 KB gzipped, well-maintained. Bar chart for category totals; no design system lock-in.  
**Alternatives considered**: Chart.js (heavier, requires canvas ref handling in RSC context); Tremor (locks into its design system).

---

### 9. Testing

**Decision**: Vitest + React Testing Library + Playwright  
**Rationale**: Vitest matches Vite-family tooling (fast, TS-native); RTL for component behaviour tests; Playwright for E2E flows (register → add expense → export CSV). No mocking of database — E2E tests use a dedicated Aiven MySQL test database.  
**Coverage targets**: Unit tests for validation schemas and utility functions; integration tests for Server Actions; E2E for all P1–P3 user stories.

---

## Summary

| Concern | Chosen Solution |
| --- | --- |
| Framework | Next.js 14+ App Router (TypeScript) |
| Auth | Auth.js v5 + Credentials + Prisma adapter |
| Database | MySQL — Aiven for MySQL (Vercel Marketplace) |
| ORM | Prisma (datasource: mysql) |
| Recurring jobs | Vercel Cron (daily, 02:00 UTC) |
| CSV export | Server-side streaming route |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Testing | Vitest + RTL + Playwright |
