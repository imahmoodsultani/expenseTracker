## Why

All primary keys in the database currently use `cuid()` — opaque 25-character strings that look encrypted to end users and developers alike. Replacing them with auto-incrementing integers makes the database human-readable, simplifies debugging, and produces cleaner URLs (e.g., `/projects/3` instead of `/projects/clx8m2k0p0000abc12345xyz`).

## What Changes

- **BREAKING** Replace `String @id @default(cuid())` with `Int @id @default(autoincrement())` for `User`, `Project`, `Category`, and `Expense` models
- **BREAKING** Update all foreign key fields (`userId`, `projectId`, `categoryId`, `expenseId`, `recurrenceParentId`) from `String` to `Int`
- Write and apply a Prisma migration that recreates tables with integer PKs (data migration required if any existing data must be preserved)
- Update all TypeScript types, API route handlers, server actions, and component props that reference these ID fields as `string` to use `number`

## Capabilities

### New Capabilities

_(none — this is a data-layer refactor, not a new user-facing capability)_

### Modified Capabilities

- `user-profile-management`: User ID type changes from `string` to `number` — any code reading `session.user.id` must be updated to treat it as a number.

## Impact

- `prisma/schema.prisma` — ID field type changes across all models
- `prisma/migrations/` — new migration file
- `app/api/**/*.ts` — all route handlers that parse or pass IDs
- `app/(dashboard)/**/*.tsx` — pages and server actions using IDs in params or queries
- `lib/` — any helper utilities referencing model ID types
- `auth.ts` / `auth.config.ts` — `session.user.id` type may need adjustment
- TypeScript interfaces/types derived from Prisma client will change automatically after `prisma generate`
