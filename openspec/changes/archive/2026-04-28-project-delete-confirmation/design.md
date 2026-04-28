## Context

The current delete flow in `ProjectList.tsx` uses a simple inline confirm/cancel pattern (a `confirmId` state). When a project has expenses, the `DELETE /api/projects/:id` call silently fails because Prisma with the libSQL/SQLite adapter does not reliably cascade-delete related records in the right order — expenses reference categories, so deleting the project while both expenses and categories still exist can violate FK constraints. The UI reads `res.ok` but calls `setConfirmId(null)` regardless of the result, so the user sees nothing.

The fix has two independent parts: (1) harden the API, (2) replace the UI confirmation pattern.

## Goals / Non-Goals

**Goals:**
- Fix the silent failure so project deletion actually works when expenses exist
- Add a warning dialog for projects with expenses before deletion proceeds
- Add a case-sensitive name-verification step for all project deletions
- Implement entirely with Tailwind and React state (no new UI library)

**Non-Goals:**
- Soft-delete / archive — deletion remains permanent
- Undo functionality after deletion
- Bulk project deletion

## Decisions

### 1. API fix: explicit transaction with ordered deletes

**Decision**: In `DELETE /api/projects/:id`, use `db.$transaction([...])` to delete in order: expenses first, then categories, then the project.

**Rationale**: SQLite FK constraints require child rows to be removed before parents. Prisma's application-level cascade emulation for libSQL may not handle the two-level dependency chain (Expense → Category → Project) in a single `project.delete()`. An explicit ordered transaction is reliable and avoids relying on cascade emulation.

**Alternative considered**: Set `relationMode = "prisma"` in the Prisma schema to force application-level emulation for all relations. Rejected because it changes schema-level behaviour globally and requires schema regeneration; an explicit transaction is surgical and self-documenting.

### 2. UI state machine: `idle → warning → verifying`

**Decision**: Replace the `confirmId` boolean toggle with a discriminated-union state:
- `{ step: "idle" }` — default
- `{ step: "warning", project: Project }` — shown when `expenseCount > 0`
- `{ step: "verifying", project: Project }` — name input shown

Projects with `expenseCount === 0` skip the warning step and go straight to `verifying`.

**Rationale**: A state machine makes the multi-step flow explicit and prevents invalid transitions (e.g., jumping from idle to verifying without warning). The discriminated union carries the target project through the flow without a second state variable.

**Alternative considered**: Separate `isWarningOpen` / `isVerifyOpen` booleans. Rejected because it allows impossible states (both open simultaneously) and requires tracking the project object separately.

### 3. Modal rendered as a full-screen overlay inside `ProjectList`

**Decision**: Render the modal as a fixed overlay (`position: fixed`, `inset-0`) within the same component, conditionally mounted when state is not `idle`.

**Rationale**: Keeps the modal co-located with the list that owns the deletion logic. No need for a portal or React context. The component is already a client component.

**Alternative considered**: Extract to a separate `DeleteProjectModal.tsx`. Acceptable but unnecessary for a single-use modal at this stage.

### 4. Name verification: case-sensitive, exact match, trim whitespace

**Decision**: The delete button in the `verifying` step is enabled only when `inputValue === project.name` (strict equality, no `.trim()`, no `.toLowerCase()`).

**Rationale**: The user's requirement is case-sensitive. Trimming is deliberately omitted — a trailing space should not count as a match, reinforcing that the user must type the name exactly as shown.

## Risks / Trade-offs

- **[Risk] Long project names** — typing a 60-character name is tedious. → Mitigation: the project name is displayed above the input as a reference; users who named it can type it.
- **[Risk] Transaction failure in production** — if Turso has transactional limitations. → Mitigation: the existing Prisma libSQL adapter supports transactions; wrap in try/catch and return a 500 with an error message so the UI can surface it.
- **[Risk] UI doesn't surface API errors** — current `handleDelete` ignores non-ok responses. → Mitigation: add an `error` state to the component and display it inside the modal on failure.
