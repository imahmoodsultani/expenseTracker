# Data Model: Expense Tracker App

**Phase 1 Output** | Branch: `001-expense-tracker-app` | Date: 2026-04-15  
**Database**: MySQL (Aiven for MySQL via Vercel Marketplace)

---

## Entities Overview

```text
User ──< Project ──< Expense
  │                    │
  └──< Category ───────┘
       (GLOBAL or PROJECT-scoped)
```

- A **User** owns all Projects, global Categories, and general Expenses.
- A **Project** owns project-scoped Categories and project Expenses.
- Every **Expense** belongs to exactly one Category and either to the User (general) or a Project.
- A recurring **Expense** may link to child Expense instances via `recurrenceParentId`.

---

## Entity Definitions

### User

Managed primarily by Auth.js. Stores identity and links all owned data.

| Field | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | String (cuid) | PK | Auto-generated |
| email | String | Unique, not null | Login identifier |
| password | String | Not null | Bcrypt hash — never plain text |
| emailVerified | DateTime | Nullable | Reserved for future email verification |
| createdAt | DateTime | Not null | Auto-set on insert |

**Relationships**: has many Projects, Expenses (general), Categories (global custom)

---

### Project

A named container for grouping related expenses.

| Field | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | String (cuid) | PK | Auto-generated |
| name | String | Not null, non-empty | User-provided |
| userId | String | FK → User.id, not null | Cascade delete |
| createdAt | DateTime | Not null | Auto-set |
| updatedAt | DateTime | Not null | Auto-updated |

**Relationships**: belongs to User; has many Expenses; has many Categories (project-scoped)  
**Deletion**: Deleting a Project cascades to all its Expenses and project-scoped Categories.

---

### Expense

A single recorded spending event — either general (no project) or project-scoped.

| Field | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | String (cuid) | PK | Auto-generated |
| title | String | Not null, non-empty | Required |
| amount | Decimal(10,2) | Not null, > 0 | Positive values only |
| date | DateTime | Not null | Date of the expense (stored as DATETIME(3) in MySQL) |
| description | String (TEXT) | Nullable | Optional free text |
| categoryId | String | FK → Category.id, not null | Retained even if category is soft-deleted |
| userId | String | FK → User.id, not null | Owner |
| projectId | String | FK → Project.id, nullable | Null = general expense |
| isRecurring | Boolean | Not null, default false | Maps to TINYINT(1) in MySQL |
| recurrenceFrequency | Enum | Nullable | WEEKLY \| MONTHLY \| YEARLY; required when isRecurring = true |
| nextDueDate | DateTime | Nullable | Next date the cron should generate a child instance |
| recurrenceLastGeneratedDate | DateTime | Nullable | Guards against duplicate generation on cron retries |
| recurrenceParentId | String | FK → Expense.id, nullable | Links auto-generated child back to parent template |
| createdAt | DateTime | Not null | Auto-set |
| updatedAt | DateTime | Not null | Auto-updated |

**Relationships**: belongs to User; optionally belongs to Project; belongs to Category; may have one recurrence parent; may have many recurrence children

**Validation rules**:

- `amount` must be a positive decimal (> 0.00)
- `title` must be non-empty string (trim before validation)
- `date` must be a valid calendar date
- `recurrenceFrequency` is required when `isRecurring = true`
- `nextDueDate` is set on creation of a recurring expense; advanced after each generation

**Recurrence behaviour**:

- Cron reads: `isRecurring = true AND nextDueDate <= TODAY AND recurrenceLastGeneratedDate < TODAY`
- On generation: inserts child row with same title/amount/category/description, sets `recurrenceParentId`, sets `date = nextDueDate`
- Advances `nextDueDate`: +7 days (WEEKLY), +1 month (MONTHLY), +1 year (YEARLY)
- Updates `recurrenceLastGeneratedDate = TODAY` on parent

---

### Category

A label applied to expenses. Can be predefined (system-wide), global custom (user-owned), or project-scoped.

| Field | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | String (cuid) | PK | Auto-generated |
| name | String | Not null, non-empty | Display label |
| type | Enum | Not null | PREDEFINED \| CUSTOM |
| scope | Enum | Not null | GLOBAL \| PROJECT |
| isDeleted | Boolean | Not null, default false | Maps to TINYINT(1); hides from dropdown, retains on expenses |
| userId | String | FK → User.id, nullable | Null for PREDEFINED; set for CUSTOM |
| projectId | String | FK → Project.id, nullable | Set only when scope = PROJECT |
| createdAt | DateTime | Not null | Auto-set |

**Relationships**: belongs to User (custom); optionally belongs to Project (project-scoped); referenced by many Expenses

**Rules**:

- PREDEFINED categories are seeded at app boot; `userId = null`, `projectId = null`
- GLOBAL custom categories have `userId = <owner>`, `projectId = null`
- PROJECT-scoped custom categories have `userId = <owner>`, `projectId = <project>`
- When `isDeleted = true`: excluded from dropdown queries; FK references on Expense rows remain valid
- Predefined categories cannot be deleted or edited by users
- Category name uniqueness enforced per-scope-per-user

---

## Enums

```text
RecurrenceFrequency: WEEKLY | MONTHLY | YEARLY

CategoryType: PREDEFINED | CUSTOM

CategoryScope: GLOBAL | PROJECT
```

MySQL stores Prisma enums as `ENUM(...)` columns — no extra mapping needed.

---

## Predefined Category Seed Data

| Name | Type | Scope |
| --- | --- | --- |
| Food | PREDEFINED | GLOBAL |
| Vehicle | PREDEFINED | GLOBAL |
| Household | PREDEFINED | GLOBAL |
| Medicines | PREDEFINED | GLOBAL |

---

## Prisma Schema Snippet

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String     @id @default(cuid())
  email         String     @unique
  password      String
  emailVerified DateTime?
  createdAt     DateTime   @default(now())
  projects      Project[]
  expenses      Expense[]
  categories    Category[]
}

model Project {
  id         String     @id @default(cuid())
  name       String
  userId     String
  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  expenses   Expense[]
  categories Category[]
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
}

enum RecurrenceFrequency {
  WEEKLY
  MONTHLY
  YEARLY
}

enum CategoryType {
  PREDEFINED
  CUSTOM
}

enum CategoryScope {
  GLOBAL
  PROJECT
}

model Expense {
  id                          String               @id @default(cuid())
  title                       String
  amount                      Decimal              @db.Decimal(10, 2)
  date                        DateTime
  description                 String?              @db.Text
  categoryId                  String
  category                    Category             @relation(fields: [categoryId], references: [id])
  userId                      String
  user                        User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  projectId                   String?
  project                     Project?             @relation(fields: [projectId], references: [id], onDelete: Cascade)
  isRecurring                 Boolean              @default(false)
  recurrenceFrequency         RecurrenceFrequency?
  nextDueDate                 DateTime?
  recurrenceLastGeneratedDate DateTime?
  recurrenceParentId          String?
  recurrenceParent            Expense?             @relation("RecurrenceTree", fields: [recurrenceParentId], references: [id])
  recurrenceChildren          Expense[]            @relation("RecurrenceTree")
  createdAt                   DateTime             @default(now())
  updatedAt                   DateTime             @updatedAt
}

model Category {
  id        String        @id @default(cuid())
  name      String
  type      CategoryType
  scope     CategoryScope
  isDeleted Boolean       @default(false)
  userId    String?
  user      User?         @relation(fields: [userId], references: [id], onDelete: Cascade)
  projectId String?
  project   Project?      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  expenses  Expense[]
  createdAt DateTime      @default(now())
}
```

---

## Key Relationships & Constraints

| Relationship | Cardinality | Cascade |
| --- | --- | --- |
| User → Project | 1:N | Delete user → delete projects |
| User → Expense (general) | 1:N | Delete user → delete expenses |
| User → Category (global custom) | 1:N | Delete user → delete categories |
| Project → Expense | 1:N | Delete project → delete expenses |
| Project → Category | 1:N | Delete project → delete project-scoped categories |
| Category → Expense | 1:N | No cascade — category soft-deleted; expense retains label |
| Expense → Expense (recurrence) | 1:N (self) | Cancel recurring → set isRecurring=false, nextDueDate=null; children remain |

---

## Report Query Patterns

| Report | Query Pattern |
| --- | --- |
| General expense report | `WHERE projectId IS NULL AND userId = ? [AND date BETWEEN ? AND ?]` |
| Project report | `WHERE projectId = ? AND userId = ? [AND date BETWEEN ? AND ?]` |
| Overall summary (flat) | `WHERE userId = ? [AND date BETWEEN ? AND ?]` GROUP BY categoryId |
| Overall summary (breakdown) | Same + GROUP BY categoryId, projectId (NULL = General) |
| CSV export | Same as above, skip GROUP BY, return individual rows |
