# API Contracts: Expense Tracker App

**Phase 1 Output** | Branch: `001-expense-tracker-app` | Date: 2026-04-15

All routes are Next.js App Router Route Handlers under `app/api/`. All request and response bodies are JSON unless noted (CSV export). All protected routes require a valid Auth.js session cookie; unauthenticated requests receive `401`.

---

## Conventions

- **Success**: `200 OK` (GET/PUT/DELETE) or `201 Created` (POST)
- **Validation error**: `422 Unprocessable Entity` with `{ "errors": { "field": "message" } }`
- **Not found**: `404 Not Found` with `{ "error": "Not found" }`
- **Unauthorized**: `401 Unauthorized`
- **Forbidden**: `403 Forbidden` (resource exists but belongs to another user)
- Dates: ISO 8601 strings (`YYYY-MM-DD` for expense dates, full ISO for timestamps)
- Amounts: Decimal strings (e.g., `"42.50"`) to avoid floating-point issues

---

## Authentication

### POST `/api/auth/register`

Create a new user account.

**Request body**:
```json
{
  "email": "user@example.com",
  "password": "minimum8chars"
}
```

**Validation**:
- `email`: valid email format, not already registered
- `password`: minimum 8 characters

**Response `201`**:
```json
{
  "id": "clx...",
  "email": "user@example.com",
  "createdAt": "2026-04-15T10:00:00Z"
}
```

**Error `422`**: `{ "errors": { "email": "Already registered" } }`

---

### POST/GET `/api/auth/[...nextauth]`

Handled by Auth.js. Used for `signIn`, `signOut`, `getSession`. Not manually implemented — configured in `auth.config.ts`.

---

## Expenses (General)

All endpoints operate on expenses where `projectId IS NULL` for the authenticated user.

### GET `/api/expenses`

List general expenses with optional search and filters.

**Query params**:
- `search` (string, optional): keyword matched against title and description
- `category` (string, optional): category ID to filter by
- `startDate` (YYYY-MM-DD, optional): inclusive lower bound on expense date
- `endDate` (YYYY-MM-DD, optional): inclusive upper bound on expense date

**Response `200`**:
```json
{
  "expenses": [
    {
      "id": "clx...",
      "title": "Groceries",
      "amount": "45.00",
      "date": "2026-04-10",
      "description": null,
      "category": { "id": "clx...", "name": "Food" },
      "isRecurring": false,
      "recurrenceFrequency": null,
      "createdAt": "2026-04-10T09:00:00Z"
    }
  ],
  "total": 1
}
```

---

### POST `/api/expenses`

Create a new general expense.

**Request body**:
```json
{
  "title": "Groceries",
  "amount": "45.00",
  "date": "2026-04-10",
  "description": "Weekly shop",
  "categoryId": "clx...",
  "isRecurring": false,
  "recurrenceFrequency": null
}
```

**Validation**:
- `title`: required, non-empty string
- `amount`: required, positive decimal
- `date`: required, valid date
- `categoryId`: required, must exist and be accessible (predefined, global, or project-scoped to no project)
- `recurrenceFrequency`: required when `isRecurring = true`; must be `WEEKLY`, `MONTHLY`, or `YEARLY`

**Response `201`**: Full expense object (same shape as GET item)

---

### PUT `/api/expenses/[id]`

Update an existing general expense.

**Request body**: Same as POST (all fields optional — partial updates accepted)

**Response `200`**: Updated expense object

**Error `403`**: Expense belongs to another user  
**Error `404`**: Expense not found or is a project expense

---

### DELETE `/api/expenses/[id]`

Delete a general expense permanently.

**Response `200`**: `{ "deleted": true }`

**Error `404`**: Not found; **Error `403`**: Not owner

---

### PATCH `/api/expenses/[id]/cancel-recurrence`

Cancel future auto-generation for a recurring expense. Does not delete existing instances.

**Response `200`**: `{ "id": "clx...", "isRecurring": false, "nextDueDate": null }`

---

## Projects

### GET `/api/projects`

List all projects for the authenticated user.

**Response `200`**:
```json
{
  "projects": [
    {
      "id": "clx...",
      "name": "Home Renovation",
      "expenseCount": 12,
      "totalAmount": "3400.00",
      "createdAt": "2026-03-01T00:00:00Z"
    }
  ]
}
```

---

### POST `/api/projects`

Create a new project.

**Request body**:
```json
{ "name": "Home Renovation" }
```

**Validation**: `name` required, non-empty string

**Response `201`**: Full project object

---

### DELETE `/api/projects/[id]`

Delete a project and all its expenses and project-scoped categories.

**Response `200`**: `{ "deleted": true }`

---

## Project Expenses

Same shape as general expenses. Operates on `projectId = [id]`.

### GET `/api/projects/[id]/expenses`

List expenses for a specific project. Accepts same query params as `/api/expenses`.

### POST `/api/projects/[id]/expenses`

Create an expense within a project. Same request body as general expense. `categoryId` must be predefined, a global category, or a project-scoped category belonging to this project.

### PUT `/api/projects/[id]/expenses/[expenseId]`

Update a project expense.

### DELETE `/api/projects/[id]/expenses/[expenseId]`

Delete a project expense.

---

## Categories

### GET `/api/categories`

List categories available to the caller.

**Query params**:
- `projectId` (string, optional): if provided, returns predefined + global + project-scoped categories for that project. If omitted, returns predefined + global only.

**Response `200`**:
```json
{
  "categories": [
    { "id": "clx...", "name": "Food", "type": "PREDEFINED", "scope": "GLOBAL" },
    { "id": "clx...", "name": "Gym", "type": "CUSTOM", "scope": "GLOBAL" },
    { "id": "clx...", "name": "Tiles", "type": "CUSTOM", "scope": "PROJECT" }
  ]
}
```

Note: Categories where `isDeleted = true` are excluded from this response.

---

### POST `/api/categories`

Create a custom category.

**Request body**:
```json
{
  "name": "Gym",
  "projectId": null
}
```

- `projectId = null` → GLOBAL scope
- `projectId = "clx..."` → PROJECT scope (user must own the project)

**Validation**: `name` required, non-empty; uniqueness enforced within scope per user

**Response `201`**: Full category object

---

### DELETE `/api/categories/[id]`

Soft-delete a custom category. Sets `isDeleted = true`. Predefined categories cannot be deleted (returns `403`).

**Response `200`**: `{ "deleted": true }`

---

## Reports

### GET `/api/reports/general`

Category totals for general expenses (outside projects).

**Query params**:
- `startDate` (YYYY-MM-DD, optional)
- `endDate` (YYYY-MM-DD, optional)
- `export` (`csv`, optional): if present, streams a CSV file download

**Response `200` (JSON)**:
```json
{
  "totals": [
    { "categoryId": "clx...", "categoryName": "Food", "total": "320.00", "count": 8 },
    { "categoryId": "clx...", "categoryName": "Vehicle", "total": "150.00", "count": 3 }
  ],
  "grandTotal": "470.00",
  "dateRange": { "start": null, "end": null }
}
```

**Response (CSV)**: `Content-Type: text/csv`, `Content-Disposition: attachment; filename="general-report.csv"`
Columns: `Title, Amount, Date, Category, Description`

---

### GET `/api/reports/projects/[id]`

Category totals for a specific project.

**Query params**: same as general report  
**Response**: same shape as general report  
**CSV filename**: `project-[name]-report.csv`

---

### GET `/api/reports/summary`

Overall summary across all expenses.

**Query params**:
- `startDate` (optional)
- `endDate` (optional)
- `breakdown` (`true`|`false`, default `false`): if true, includes per-source sub-totals
- `export` (`csv`, optional)

**Response `200` (JSON, flat)**:
```json
{
  "totals": [
    { "categoryName": "Food", "total": "520.00", "count": 14 }
  ],
  "grandTotal": "520.00"
}
```

**Response `200` (JSON, breakdown=true)**:
```json
{
  "totals": [
    {
      "categoryName": "Food",
      "total": "520.00",
      "sources": [
        { "source": "General", "projectId": null, "total": "200.00" },
        { "source": "Home Renovation", "projectId": "clx...", "total": "320.00" }
      ]
    }
  ],
  "grandTotal": "520.00"
}
```

---

## Cron Endpoint

### GET `/api/cron/recurring-expenses`

Internal endpoint invoked by Vercel Cron at `0 2 * * *` (02:00 UTC daily). Protected by `CRON_SECRET` environment variable checked against the `Authorization: Bearer` header.

**Logic**:
1. Query all recurring expenses where `nextDueDate <= TODAY AND recurrenceLastGeneratedDate < TODAY`
2. For each: insert child expense, advance `nextDueDate`, update `recurrenceLastGeneratedDate`

**Response `200`**: `{ "generated": 3, "errors": [] }`
