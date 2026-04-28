## Why

Deleting a project that contains expenses silently fails — the API errors out (likely due to Prisma/libSQL cascade ordering with SQLite foreign keys) but the UI swallows the error and shows nothing, leaving the user confused. Additionally, the current single-click inline confirm provides no safeguard against accidental destruction of a project and all its data.

## What Changes

- Fix the silent delete failure: use an explicit Prisma transaction that deletes expenses and categories before the project, so FK constraints are never violated
- Replace the current inline confirm UI with a two-step modal flow for projects that have expenses:
  1. **Warning dialog** — "This project contains N expenses. Do you really want to delete it?" (No / Yes)
  2. **Name verification dialog** — Text input prompting the user to type the project name exactly (case-sensitive) before the delete button becomes active
- Projects with zero expenses skip the warning dialog and go straight to the name verification step (consistent UX, prevents accidental deletion of empty projects too)

## Capabilities

### New Capabilities

- `project-delete-confirmation`: Two-step destructive-action guard for project deletion — warning dialog for projects with expenses, followed by a case-sensitive name-verification input before the delete is executed

### Modified Capabilities

- None — no existing spec files cover project deletion confirmation behavior

## Impact

- **`app/api/projects/[id]/route.ts`** — `DELETE` handler: wrap deletion in a `db.$transaction` that explicitly deletes expenses, then categories, then the project
- **`components/projects/ProjectList.tsx`** — replace inline confirm state with a modal dialog component driven by a state machine (`idle → warning → verifying`)
- **No new dependencies** — modal built with Tailwind classes and React state; no external dialog library needed
- **No schema or migration changes**
