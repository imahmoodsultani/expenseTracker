# Quickstart: Expense Tracker App

**Phase 1 Output** | Branch: `001-expense-tracker-app` | Date: 2026-04-15  
**Database**: MySQL (Aiven for MySQL via Vercel Marketplace)

---

## Prerequisites

- Node.js 20+
- pnpm (preferred) or npm
- An Aiven for MySQL database (provision via Vercel Marketplace → Storage → Add New → Aiven for MySQL)
- Vercel account (for cron jobs and deployment)

---

## 1. Bootstrap the Project

```bash
pnpm create next-app@latest expense-tracker --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd expense-tracker
```

---

## 2. Install Dependencies

```bash
# ORM & database
pnpm add @prisma/client
pnpm add -D prisma

# Auth
pnpm add next-auth@beta bcryptjs
pnpm add -D @types/bcryptjs

# Forms & validation
pnpm add react-hook-form zod @hookform/resolvers

# Charts
pnpm add recharts

# Testing
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event @playwright/test jsdom
```

---

## 3. Environment Variables

Create `.env.local`:

```env
# Aiven MySQL
DATABASE_URL="mysql://user:password@host:port/dbname?ssl-mode=REQUIRED"

# Auth.js
AUTH_SECRET="generate-with: openssl rand -base64 32"
AUTH_URL="http://localhost:3000"

# Cron security
CRON_SECRET="generate-with: openssl rand -hex 32"
```

> **SSL**: Aiven requires SSL. Append `?ssl-mode=REQUIRED` (or `?sslaccept=strict`) to the connection string. The exact parameter depends on your MySQL client version — check the Aiven connection details page for the recommended string.

---

## 4. Initialise Prisma

```bash
pnpm prisma init --datasource-provider mysql
```

Replace the generated `prisma/schema.prisma` with the full schema from [data-model.md](data-model.md), then run:

```bash
pnpm prisma migrate dev --name init
pnpm prisma db seed          # seeds predefined categories (Food, Vehicle, Household, Medicines)
```

---

## 5. Configure Auth.js

Create `auth.config.ts` at the project root with the Credentials provider (email + bcrypt password check) and the Prisma adapter. Create `middleware.ts` to protect all routes under `/(dashboard)`.

---

## 6. Configure Vercel Cron

Create `vercel.json` at the project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/recurring-expenses",
      "schedule": "0 2 * * *"
    }
  ]
}
```

The cron handler at `app/api/cron/recurring-expenses/route.ts` validates `Authorization: Bearer $CRON_SECRET` before processing.

---

## 7. Run Locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the login/register page.

---

## 8. Run Tests

```bash
# Unit + integration
pnpm vitest

# E2E (requires dev server running)
pnpm playwright test
```

---

## Key File Locations (once implemented)

| Path | Purpose |
| --- | --- |
| `prisma/schema.prisma` | Database schema (datasource: mysql) |
| `prisma/seed.ts` | Predefined category seeding |
| `auth.config.ts` | Auth.js credentials provider config |
| `middleware.ts` | Route protection |
| `app/api/expenses/` | General expense CRUD |
| `app/api/projects/` | Project CRUD |
| `app/api/categories/` | Category management |
| `app/api/reports/` | Report + CSV export |
| `app/api/cron/` | Recurring expense cron handler |
| `lib/schemas/` | Shared Zod validation schemas |
| `components/expenses/` | Expense form, list, search/filter UI |
| `components/reports/` | Recharts-based report views |
| `vercel.json` | Cron schedule configuration |
