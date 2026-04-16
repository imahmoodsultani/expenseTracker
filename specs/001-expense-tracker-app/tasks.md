# Tasks: Expense Tracker App with Auth, Projects, and Reporting

**Input**: Design documents from `specs/001-expense-tracker-app/`  
**Prerequisites**: plan.md ✓ · spec.md ✓ · data-model.md ✓ · contracts/api.md ✓ · research.md ✓  
**Tests**: Not requested in specification — test tasks omitted per policy.  
**Stack**: Next.js 14+ App Router (TypeScript) · MySQL (Aiven) · Prisma · Auth.js v5 · RHF + Zod · Recharts · Vercel Cron

## Format: `[ID] [P?] [Story] Description with file path`

- **[P]**: Parallelizable — operates on a different file with no dependency on an incomplete task
- **[US#]**: Maps to User Story number from spec.md
- Paths follow the Next.js App Router structure defined in plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Bootstrap the project, install dependencies, and configure tooling.

- [X] T001 Scaffold Next.js 14+ project: `pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` (repository root)
- [X] T002 Install all runtime dependencies: `next-auth@beta bcryptjs @prisma/client react-hook-form zod @hookform/resolvers recharts` (package.json)
- [X] T003 Install all dev dependencies: `prisma @types/bcryptjs vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event @playwright/test jsdom` (package.json)
- [X] T004 [P] Create `.env.local.example` with all required variable names: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `CRON_SECRET` (repository root)
- [X] T005 [P] Create `vercel.json` with cron schedule `0 2 * * *` pointing to `/api/cron/recurring-expenses` (repository root)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, Prisma setup, and shared utilities that every user story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T006 Initialise Prisma with MySQL datasource: `pnpm prisma init --datasource-provider mysql`; set `DATABASE_URL = env("DATABASE_URL")` in `prisma/schema.prisma`
- [X] T007 Define all Prisma models and enums in `prisma/schema.prisma`: `User`, `Project`, `Expense` (with recurrence fields), `Category` (with `isDeleted`); enums `RecurrenceFrequency`, `CategoryType`, `CategoryScope` — use full schema from data-model.md
- [X] T008 Run initial migration: `pnpm prisma migrate dev --name init` (generates SQL for all models)
- [X] T009 Create Prisma seed file `prisma/seed.ts` that inserts the four predefined categories: Food, Vehicle, Household, Medicines (type: PREDEFINED, scope: GLOBAL, userId: null)
- [X] T010 Add seed script to `package.json` (`"prisma": { "seed": "ts-node prisma/seed.ts" }`) and run `pnpm prisma db seed`
- [X] T011 Create Prisma client singleton `lib/db.ts` (global instance pattern to prevent connection exhaustion in serverless)
- [X] T012 [P] Create Zod validation schema `lib/schemas/expense.schema.ts`: fields title (string, min 1), amount (positive decimal string), date (ISO date string), categoryId (string), description (optional string), isRecurring (boolean), recurrenceFrequency (optional enum)
- [X] T013 [P] Create Zod validation schema `lib/schemas/project.schema.ts`: field name (string, min 1)
- [X] T014 [P] Create Zod validation schema `lib/schemas/category.schema.ts`: fields name (string, min 1), projectId (optional string or null)
- [X] T015 [P] Create folder structure per plan: `app/(auth)/`, `app/(dashboard)/`, `app/api/`, `components/auth/`, `components/expenses/`, `components/projects/`, `components/categories/`, `components/reports/`, `lib/schemas/`, `lib/utils/`

**Checkpoint**: Database migrated and seeded; Prisma client ready; Zod schemas available — user story implementation can begin.

---

## Phase 3: User Story 1 — User Registration and Login (Priority: P1) 🎯 MVP

**Goal**: Users can register, log in, and log out. All other routes are protected.

**Independent Test**: Register a new account → log out → log in with the same credentials → confirm redirect to dashboard → attempt access to `/dashboard` while logged out → confirm redirect to `/login`.

- [X] T016 [P] Configure Auth.js v5 in `auth.config.ts`: Credentials provider with email/password; bcrypt password verification against `User.password`; Prisma adapter; session strategy `jwt`
- [X] T017 [P] Create registration API route `app/api/auth/register/route.ts`: POST handler that validates request body with `lib/schemas/category.schema.ts`-equivalent user schema, checks for duplicate email, hashes password with `bcryptjs`, creates `User` record via Prisma, returns `201` with user id and email
- [X] T018 [P] Create `middleware.ts` at repo root: use Auth.js `auth` middleware to protect all routes matching `/(dashboard)(.*)` and redirect unauthenticated users to `/login`
- [X] T019 Create Auth.js route handler `app/api/auth/[...nextauth]/route.ts`: export `{ GET, POST }` from `auth.config.ts`
- [X] T020 [P] [US1] Create `components/auth/RegisterForm.tsx`: RHF form with email, password fields; calls `POST /api/auth/register` then `signIn`; displays validation errors inline
- [X] T021 [P] [US1] Create `components/auth/LoginForm.tsx`: RHF form with email, password fields; calls `signIn("credentials", ...)`; displays auth errors inline
- [X] T022 [US1] Create register page `app/(auth)/register/page.tsx`: renders `<RegisterForm />`; redirect to dashboard if already authenticated
- [X] T023 [US1] Create login page `app/(auth)/login/page.tsx`: renders `<LoginForm />`; redirect to dashboard if already authenticated; serves as the app start page
- [X] T024 [US1] Create authenticated layout `app/(dashboard)/layout.tsx`: renders nav with app name, logout button (calls `signOut`), and link to projects and reports; wraps children

**Checkpoint**: Register → log out → log in flow works end-to-end. Unauthenticated access to dashboard is blocked.

---

## Phase 4: User Story 2 — Adding and Managing General Expenses (Priority: P2)

**Goal**: Logged-in users can add, view (with keyword search + category/date filters), edit, and delete general expenses. Recurring expenses are supported.

**Independent Test**: Add 3 general expenses with different categories → search by keyword → filter by category → edit one → delete one → confirm list updates correctly after each action. Mark one as recurring (monthly) → confirm recurring badge appears.

- [X] T025 [P] [US2] Create recurrence utility `lib/utils/recurrence.ts`: function `getNextDueDate(date: Date, frequency: RecurrenceFrequency): Date` advancing by 7 days / 1 month / 1 year
- [X] T026 [P] [US2] Create CSV export utility `lib/utils/csv.ts`: function `buildCsvResponse(rows: object[], filename: string): Response` — serialises rows to CSV string, returns `Response` with `Content-Type: text/csv` and `Content-Disposition: attachment; filename="[filename].csv"` headers
- [X] T027 [P] [US2] Create general expenses route `app/api/expenses/route.ts`: GET handler queries `Expense` where `projectId IS NULL` for session user with optional `search` (title/description LIKE), `category`, `startDate`, `endDate` query params; POST handler validates body with `lib/schemas/expense.schema.ts`, creates `Expense` with `projectId: null`, sets `nextDueDate` if recurring
- [X] T028 [P] [US2] Create expense detail route `app/api/expenses/[id]/route.ts`: PUT updates expense fields (validates ownership); DELETE removes expense (with Prisma `delete`)
- [X] T029 [P] [US2] Create cancel-recurrence route `app/api/expenses/[id]/cancel-recurrence/route.ts`: PATCH sets `isRecurring: false`, `nextDueDate: null`, `recurrenceFrequency: null` on the parent expense
- [X] T030 [P] [US2] Create Vercel Cron handler `app/api/cron/recurring-expenses/route.ts`: GET validates `Authorization: Bearer $CRON_SECRET`; queries expenses where `isRecurring = true AND nextDueDate <= today AND recurrenceLastGeneratedDate < today`; for each, inserts child `Expense` row copying title/amount/categoryId/description/userId/projectId and setting `recurrenceParentId`; advances `nextDueDate` using `getNextDueDate`; updates `recurrenceLastGeneratedDate`; returns `{ generated: N, errors: [] }`
- [X] T031 [P] [US2] Create `components/expenses/RecurringBadge.tsx`: small visual badge (e.g., "↻ Monthly") rendered when `isRecurring = true`; accepts `frequency` prop
- [X] T032 [P] [US2] Create `components/expenses/ExpenseFilters.tsx`: controlled inputs for keyword search (text), category (select from available categories), start date, end date; calls parent `onFilterChange` callback on change
- [X] T033 [US2] Create `components/expenses/ExpenseForm.tsx`: RHF form with title, amount, date, category (via `<CategoryDropdown />`), description (optional textarea), isRecurring toggle, recurrenceFrequency select (shown when isRecurring = true); validates with `lib/schemas/expense.schema.ts`; submits to POST or PUT endpoint; displays per-field validation errors
- [X] T034 [US2] Create `components/expenses/ExpenseList.tsx`: renders a list of expense rows showing title, amount, date, category name, `<RecurringBadge />` if recurring; edit and delete action buttons per row with delete confirmation; accepts `expenses` array and `onDelete`/`onEdit` callbacks
- [X] T035 [US2] Create general dashboard page `app/(dashboard)/page.tsx`: fetches general expenses from `GET /api/expenses` with current filter state; renders `<ExpenseFilters />`, `<ExpenseList />`, and "Add Expense" button that opens `<ExpenseForm />` in a modal or side panel
- [X] T036 [US2] Create edit expense page `app/(dashboard)/expenses/[id]/page.tsx`: fetches expense by id, pre-fills `<ExpenseForm />`, submits to `PUT /api/expenses/[id]`, redirects to dashboard on success

**Checkpoint**: Full general expense lifecycle works — add, search, filter, edit, delete, recurring badge visible.

---

## Phase 5: User Story 3 — Category Management (Priority: P3)

**Goal**: Predefined categories (Food, Vehicle, Household, Medicines) are always available. Users can add custom global categories and custom project-scoped categories. Soft-deleted categories disappear from dropdowns but remain on historical expenses.

**Independent Test**: Open expense form → confirm 4 predefined categories → add a global custom category "Gym" → confirm it appears in general expense dropdown → open a project expense form → add project-scoped "Tiles" → confirm "Tiles" absent from general expense dropdown → delete "Gym" → confirm "Gym" gone from dropdown but existing expenses labelled "Gym" still show correctly.

- [X] T037 [P] [US3] Create categories route `app/api/categories/route.ts`: GET returns predefined + global categories for session user (plus project-scoped if `?projectId=` param present) where `isDeleted = false`; POST creates custom category with `scope = projectId ? PROJECT : GLOBAL`, validates with `lib/schemas/category.schema.ts`, enforces name uniqueness per scope per user
- [X] T038 [P] [US3] Create category delete route `app/api/categories/[id]/route.ts`: DELETE sets `isDeleted: true` (soft-delete); returns `403` if category is PREDEFINED; returns `403` if session user does not own the category
- [X] T039 [US3] Create `components/categories/CategoryDropdown.tsx`: fetches categories from `GET /api/categories?projectId=[optional]`; renders `<select>` with predefined and custom options; inline "Add new category..." option that shows a text input and submits to `POST /api/categories`; refreshes list on creation; used by `<ExpenseForm />`
- [X] T040 [US3] Create `components/categories/CategoryManager.tsx`: lists all custom categories (global + project-scoped) for the user; delete button per row calls `DELETE /api/categories/[id]`; shows confirmation before delete
- [X] T041 [US3] Wire `<CategoryDropdown />` into `<ExpenseForm />` at `components/expenses/ExpenseForm.tsx`: replace placeholder category field with `<CategoryDropdown projectId={projectId} />`; pass `projectId` prop from expense form context

**Checkpoint**: Predefined categories always present; custom categories created and scoped correctly; soft-delete removes from dropdown but preserves on existing expenses.

---

## Phase 6: User Story 4 — Project Creation and Management (Priority: P4)

**Goal**: Users can create named projects, view a project list on the dashboard, open a project to see its expenses, and delete a project.

**Independent Test**: Create a project "Home Reno" → confirm it appears in the project list → open it → confirm empty expense list → delete it → confirm it is removed from the list.

- [X] T042 [P] [US4] Create projects route `app/api/projects/route.ts`: GET returns all projects for session user with `expenseCount` and `totalAmount` aggregates; POST validates name with `lib/schemas/project.schema.ts`, creates `Project` record
- [X] T043 [P] [US4] Create project delete route `app/api/projects/[id]/route.ts`: DELETE removes project (Prisma cascade removes associated expenses and project-scoped categories); validates ownership
- [X] T044 [P] [US4] Create `components/projects/ProjectForm.tsx`: RHF form with name field; submits to `POST /api/projects`; validates with `lib/schemas/project.schema.ts`; inline error display
- [X] T045 [P] [US4] Create `components/projects/ProjectList.tsx`: renders project cards showing name, expense count, total amount; "Open" and "Delete" actions per card; delete confirmation
- [X] T046 [US4] Create projects list page `app/(dashboard)/projects/page.tsx`: fetches projects from `GET /api/projects`; renders `<ProjectList />` and "New Project" button that opens `<ProjectForm />`

**Checkpoint**: Project list visible on dashboard; create and delete project works; project card shows expense count and total.

---

## Phase 7: User Story 5 — Adding and Managing Project Expenses (Priority: P5)

**Goal**: Expenses added within a project are stored under that project and do not appear on the general dashboard.

**Independent Test**: Open "Home Reno" project → add an expense "Tiles" → confirm it appears in the project expense list → navigate to general dashboard → confirm "Tiles" does NOT appear → edit "Tiles" → delete it → confirm it is removed from the project list only.

- [X] T047 [P] [US5] Create project expenses route `app/api/projects/[id]/expenses/route.ts`: GET returns expenses for project id (same filters as general: search, category, startDate, endDate); POST creates expense with `projectId` set, validates ownership of project and that categoryId is accessible (predefined, global, or project-scoped to this project)
- [X] T048 [P] [US5] Create project expense detail route `app/api/projects/[id]/expenses/[expenseId]/route.ts`: PUT updates expense fields; DELETE removes expense; both validate that expense belongs to the specified project and session user
- [X] T049 [US5] Create project detail page `app/(dashboard)/projects/[id]/page.tsx`: fetches project details and its expenses from `GET /api/projects/[id]/expenses`; renders `<ExpenseFilters />`, `<ExpenseList />`, and "Add Expense" button that opens `<ExpenseForm projectId={id} />`; passes `projectId` to `<ExpenseForm />` so the form sends to the project endpoint and `<CategoryDropdown />` fetches project-scoped categories

**Checkpoint**: Project expenses isolated from general dashboard. All CRUD operations work within the project context.

---

## Phase 8: User Story 6 — Reports and Summary Dashboard (Priority: P6)

**Goal**: Category-total reports for general expenses and per-project expenses; overall summary with flat/breakdown toggle; date range filter; CSV export for all report types.

**Independent Test**: Add expenses across categories in general and two projects → open general report → confirm category totals match → apply date filter → confirm totals change → click CSV export → confirm download contains correct rows → open overall summary → confirm combined totals → toggle to breakdown view → confirm per-source sub-totals → open project report → confirm project-specific totals.

- [X] T050 [P] [US6] Create general report route `app/api/reports/general/route.ts`: GET aggregates `Expense` where `projectId IS NULL` for session user, optionally filtered by `startDate`/`endDate`; groups by `categoryId`; returns `{ totals: [{ categoryName, total, count }], grandTotal }`; if `?export=csv` present, uses `buildCsvResponse` to stream individual rows instead
- [X] T051 [P] [US6] Create project report route `app/api/reports/projects/[id]/route.ts`: same aggregation logic as general report but filtered by `projectId`; validates project ownership; CSV export same pattern
- [X] T052 [P] [US6] Create overall summary route `app/api/reports/summary/route.ts`: aggregates all expenses for session user; if `?breakdown=true`, groups by `categoryId` AND `projectId` (null = General); returns flat or breakdown structure per contracts/api.md; CSV export streams all individual rows
- [X] T053 [P] [US6] Create `components/reports/ReportFilters.tsx`: date range start/end inputs; "Export CSV" button that triggers download via `?export=csv` link; `onFilterChange` callback
- [X] T054 [P] [US6] Create `components/reports/CategoryTotalsChart.tsx`: Recharts `BarChart` (Client Component) rendering category names on X-axis and total amounts on Y-axis; accepts `data: { categoryName: string; total: number }[]` prop
- [X] T055 [P] [US6] Create `components/reports/SummaryToggle.tsx`: toggle button switching between "Flat" and "Breakdown" view; controlled by parent state; calls `onToggle` callback
- [X] T056 [US6] Create general expense report page `app/(dashboard)/reports/general/page.tsx`: fetches from `GET /api/reports/general` with filter params; renders `<ReportFilters />` and `<CategoryTotalsChart />`; shows empty state when no data
- [X] T057 [US6] Create project report page `app/(dashboard)/reports/projects/[id]/page.tsx`: same structure as general report page but fetches from `/api/reports/projects/[id]`; shows project name in heading
- [X] T058 [US6] Create overall summary page `app/(dashboard)/reports/page.tsx`: fetches from `GET /api/reports/summary` with current breakdown toggle state; renders `<SummaryToggle />`, `<ReportFilters />`, and `<CategoryTotalsChart />`; in breakdown mode renders nested rows per source under each category bar

**Checkpoint**: All three report views work with correct totals. CSV downloads contain correct rows. Flat/breakdown toggle updates summary view. Date filters narrow results correctly.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, loading states, navigation, and end-to-end validation.

- [X] T059 [P] Add global `error.tsx` boundary `app/error.tsx` and `app/not-found.tsx` for unhandled errors and unknown routes
- [X] T060 [P] Add loading skeleton components `app/(dashboard)/loading.tsx` and `app/(dashboard)/reports/loading.tsx` for expense list and report page transitions
- [X] T061 [P] Add navigation links to the dashboard layout `app/(dashboard)/layout.tsx`: link to general expenses (home), projects list, and reports summary; active route highlighting
- [X] T062 [P] Add password minimum-length (8 characters) validation to registration form in `app/api/auth/register/route.ts` and `components/auth/RegisterForm.tsx` (Zod `.min(8)`)
- [X] T063 Add cron secret guard and structured JSON error logging to `app/api/cron/recurring-expenses/route.ts`; log each generated expense and any errors to `console.error` for Vercel log drain visibility
- [ ] T064 Run full quickstart.md validation: provision Aiven MySQL, set env vars, `pnpm prisma migrate dev`, `pnpm prisma db seed`, `pnpm dev`; manually execute: register → add 3 expenses (two categories) → add project → add project expense → view reports → export CSV → verify downloaded file

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Requires Phase 1 — **blocks all user stories**
- **Phase 3–8 (User Stories)**: All require Phase 2 completion; can proceed in priority order or in parallel
- **Phase 9 (Polish)**: Requires all desired user stories to be complete
