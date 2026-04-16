# Implementation Plan: Expense Tracker App with Auth, Projects, and Reporting

**Branch**: `001-expense-tracker-app` | **Date**: 2026-04-15 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `specs/001-expense-tracker-app/spec.md`  
**Override**: Database set to MySQL per user instruction.

---

## Summary

Build a personal expense tracker web application with email/password authentication, general and project-scoped expense management, custom categories (global and project-scoped), recurring expenses auto-generated via a daily cron job, keyword search and filtering on the expense list, CSV report exports, and an overall summary with a togglable per-source breakdown.

Stack: **Next.js 14+ App Router (TypeScript)** · **MySQL (Aiven)** · **Prisma** · **Auth.js v5** · **Recharts** · **Vercel Cron**

---

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20+  
**Primary Dependencies**: Next.js 14+ (App Router), Auth.js v5, Prisma, React Hook Form, Zod, Recharts, bcryptjs  
**Storage**: MySQL — Aiven for MySQL (Vercel Marketplace) · Prisma ORM (datasource: mysql)  
**Testing**: Vitest + React Testing Library + Playwright  
**Target Platform**: Web browser (Vercel deployment)  
**Project Type**: Full-stack web application  
**Performance Goals**: Report loads ≤ 2 seconds for 500 expenses (SC-003); expense add/edit ≤ 60 seconds UX (SC-002)  
**Constraints**: Vercel free/hobby tier compatible; single-user personal data isolation; Aiven SSL required in connection string; cron limited to daily frequency  
**Scale/Scope**: Personal app (1 user account per deployment); up to ~500 expenses for performance baseline

---

## Constitution Check

The constitution file contains only placeholder template content (no project-specific principles have been ratified). No gates apply. This section will be revisited if a constitution is established before tasks begin.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-expense-tracker-app/
├── plan.md              # This file
├── research.md          # Phase 0 — tech stack decisions
├── data-model.md        # Phase 1 — entity definitions, Prisma schema
├── quickstart.md        # Phase 1 — dev environment setup
├── contracts/
│   └── api.md           # Phase 1 — REST API contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks — not yet created)
```

### Source Code (repository root)

```text
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx             # Login form
│   └── register/
│       └── page.tsx             # Registration form
├── (dashboard)/
│   ├── layout.tsx               # Authenticated shell (nav, sidebar)
│   ├── page.tsx                 # General expense list + search/filter
│   ├── expenses/
│   │   └── [id]/
│   │       └── page.tsx         # Edit expense
│   ├── projects/
│   │   ├── page.tsx             # Project list
│   │   └── [id]/
│   │       └── page.tsx         # Project expense list
│   └── reports/
│       ├── page.tsx             # Overall summary report
│       ├── general/
│       │   └── page.tsx         # General expense report
│       └── projects/
│           └── [id]/
│               └── page.tsx     # Project-specific report
└── api/
    ├── auth/
    │   ├── [...nextauth]/
    │   │   └── route.ts         # Auth.js handler
    │   └── register/
    │       └── route.ts         # Registration endpoint
    ├── expenses/
    │   ├── route.ts             # GET (list + search/filter), POST
    │   └── [id]/
    │       ├── route.ts         # PUT, DELETE
    │       └── cancel-recurrence/
    │           └── route.ts     # PATCH cancel recurring
    ├── projects/
    │   ├── route.ts             # GET, POST
    │   └── [id]/
    │       ├── route.ts         # DELETE
    │       └── expenses/
    │           ├── route.ts     # GET, POST
    │           └── [expenseId]/
    │               └── route.ts # PUT, DELETE
    ├── categories/
    │   ├── route.ts             # GET (scoped), POST
    │   └── [id]/
    │       └── route.ts         # DELETE (soft)
    ├── reports/
    │   ├── general/
    │   │   └── route.ts         # GET (JSON + CSV)
    │   ├── projects/
    │   │   └── [id]/
    │   │       └── route.ts     # GET (JSON + CSV)
    │   └── summary/
    │       └── route.ts         # GET (JSON + CSV, breakdown param)
    └── cron/
        └── recurring-expenses/
            └── route.ts         # Vercel Cron handler (CRON_SECRET protected)

components/
├── auth/
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
├── expenses/
│   ├── ExpenseList.tsx          # Sortable list with search/filter UI
│   ├── ExpenseForm.tsx          # Add/edit (RHF + Zod)
│   ├── ExpenseFilters.tsx       # Keyword search, category, date range
│   └── RecurringBadge.tsx      # Visual indicator for recurring expenses
├── projects/
│   ├── ProjectList.tsx
│   └── ProjectForm.tsx
├── categories/
│   ├── CategoryDropdown.tsx     # Dropdown with inline "Add new" option
│   └── CategoryManager.tsx     # List + soft-delete custom categories
└── reports/
    ├── CategoryTotalsChart.tsx  # Recharts bar chart
    ├── ReportFilters.tsx        # Date range + CSV export button
    └── SummaryToggle.tsx        # Flat / breakdown toggle

lib/
├── auth.config.ts               # Auth.js credentials provider
├── db.ts                        # Prisma client singleton
├── schemas/
│   ├── expense.schema.ts        # Zod: expense create/update
│   ├── project.schema.ts        # Zod: project create
│   └── category.schema.ts      # Zod: category create
└── utils/
    ├── csv.ts                   # CSV streaming helper
    └── recurrence.ts           # nextDueDate calculation logic

prisma/
├── schema.prisma                # Full data model (datasource: mysql)
└── seed.ts                      # Predefined category seeding

middleware.ts                    # Auth.js session protection
vercel.json                      # Cron schedule config
```

**Structure Decision**: Single Next.js project with co-located API routes (App Router Route Handlers). All server logic runs as Vercel Serverless Functions. No separate backend repo required.

---

## Complexity Tracking

No constitution violations present (constitution unpopulated). No complexity justifications required.

---

## Phase 0: Research — Complete

See [research.md](research.md) for all technology decisions.

All unknowns resolved:

| Unknown | Resolution |
| --- | --- |
| Auth strategy | Auth.js v5 (Credentials + Prisma adapter) |
| Database | MySQL — Aiven for MySQL (Vercel Marketplace) |
| ORM | Prisma (datasource: mysql) |
| Recurring expense generation | Vercel Cron (daily 02:00 UTC) |
| CSV export | Server-side streaming Route Handler |
| Form validation | React Hook Form + Zod (shared schemas) |
| Charts | Recharts (Client Components) |
| Testing | Vitest + RTL + Playwright |

---

## Phase 1: Design — Complete

### Artifacts Generated

| Artifact | Path | Status |
| --- | --- | --- |
| Data model | [data-model.md](data-model.md) | Done |
| API contracts | [contracts/api.md](contracts/api.md) | Done |
| Quickstart | [quickstart.md](quickstart.md) | Done |

### Data Model Summary

Four entities: **User**, **Project**, **Expense**, **Category**.

Key design decisions:

- `Expense.projectId = NULL` distinguishes general from project expenses — no separate table needed
- `Category.isDeleted = true` soft-delete preserves FK integrity on existing expenses (MySQL FK constraints fully supported via Aiven)
- `Expense.recurrenceParentId` self-reference links cron-generated instances back to the template
- `Expense.nextDueDate` + `recurrenceLastGeneratedDate` make cron generation idempotent
- Report queries use `GROUP BY categoryId` (and optionally `projectId`) — no separate aggregate table at this scale
- Prisma datasource set to `mysql`; SSL required in `DATABASE_URL` for Aiven connections

### API Summary

31 route handlers across 7 resource groups. All return JSON; report routes accept `?export=csv` for file download. Cron route protected by `CRON_SECRET`. Full contracts in [contracts/api.md](contracts/api.md).

### Post-Design Constitution Check

No violations. The design:

- Uses a single project (no unnecessary repo splitting)
- Does not introduce repository or service layer abstractions beyond what the feature requires
- Keeps schema minimal (4 entities, no premature normalisation)

---

## Next Step

Run `/speckit.tasks` to generate the implementation task breakdown from this plan.
