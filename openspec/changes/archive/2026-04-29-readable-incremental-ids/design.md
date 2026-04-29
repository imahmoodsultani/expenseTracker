## Context

All Prisma models (`User`, `Account`, `Session`, `Project`, `Expense`, `Category`) use `String @id @default(cuid())`. CUIDs are 25-character opaque strings. The user wants integer auto-increment IDs for readability. Auth.js v5 adapter relations (`Account`, `Session`, `VerificationToken`) also use string IDs internally. This is a breaking, schema-wide change that touches every table and most API surface area.

## Goals / Non-Goals

**Goals:**
- Change `id` fields on `User`, `Project`, `Expense`, `Category` to `Int @id @default(autoincrement())`
- Update all FK columns (`userId`, `projectId`, `categoryId`, `recurrenceParentId`) to `Int` accordingly
- Update all TypeScript code that treats these IDs as `string` to use `number`
- Produce a clean Prisma migration

**Non-Goals:**
- Changing Auth.js adapter models (`Account`, `Session`, `VerificationToken`) — these are framework-owned; their internal string IDs should remain unchanged to avoid breaking Auth.js
- Supporting old CUID-based URLs after migration (no redirect layer)
- Zero-downtime migration (this is a dev/staging environment)

## Decisions

**Decision: Keep Auth.js adapter models as String IDs**
`Account`, `Session`, and `VerificationToken` are managed by the Auth.js Prisma adapter. Changing their ID types risks breaking the adapter's internal queries. The `User.id` field IS changed to `Int` but the `Account.userId` and `Session.userId` FK fields must also change to `Int` to stay consistent. The adapter typically accepts whatever type the user model uses as long as it matches the FK.

**Decision: Fresh migration (drop & recreate) rather than ALTER TABLE**
SQLite does not support `ALTER COLUMN` to change a column type. The migration must drop and recreate tables. Since this is a development project without production data to preserve, `prisma migrate reset` + new baseline migration is the cleanest path. Alternative: data migration script — rejected as unnecessary complexity for a dev environment.

**Decision: Parse IDs as integers at API boundaries**
Route handlers and server actions currently receive IDs as strings from URL params (e.g., `params.id`). After this change they must call `parseInt(params.id, 10)` and validate that the result is a positive integer before querying Prisma. This validation should be done with Zod (`z.coerce.number().int().positive()`).

## Risks / Trade-offs

- [Risk: Auth.js adapter breaks with Int User.id] → Test sign-in flow after migration; if adapter rejects Int, revert User.id to String and keep only Project/Expense/Category as Int
- [Risk: `session.user.id` is typed as `string` in NextAuth types] → Augment the session type in `auth.ts` to cast/declare `id` as `number` (or string representation of number); use `Number(session.user.id)` at call sites
- [Risk: SQLite migration requires full table drop] → Use `prisma migrate reset` in dev; acceptable since no production data exists
- [Risk: URL params are always strings] → Zod coercion at every API boundary prevents silent NaN bugs

## Migration Plan

1. Update `prisma/schema.prisma` — change `id` types and FK types
2. Run `npx prisma migrate reset` to wipe SQLite and apply fresh migration
3. Run `npx prisma generate` to regenerate the client
4. Update all API routes, server actions, and components — change `string` ID handling to `number`
5. Augment Auth.js session type for `user.id` as `number`
6. Run `npm test && npm run lint`

## Open Questions

- Should `Account.id` also become `Int`? It has no FK pointing to it from user-space code, so it can remain `String` safely. Recommend leaving it.
- If Auth.js adapter rejects `Int` on `User.id`, fall back to keeping `User.id` as `String` and only convert `Project`, `Expense`, and `Category` IDs.
