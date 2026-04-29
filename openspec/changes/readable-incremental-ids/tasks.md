## 1. Prisma Schema Update

- [x] 1.1 In `prisma/schema.prisma`, change `User.id` from `String @id @default(cuid())` to `Int @id @default(autoincrement())`
- [x] 1.2 Change `Project.id`, `Expense.id`, and `Category.id` from `String @id @default(cuid())` to `Int @id @default(autoincrement())`
- [x] 1.3 Change all FK columns referencing these models to `Int`: `Project.userId`, `Expense.userId`, `Expense.categoryId`, `Expense.projectId`, `Expense.recurrenceParentId`, `Category.userId`, `Category.projectId`
- [x] 1.4 Change Auth.js FK columns `Account.userId` and `Session.userId` from `String` to `Int` to match the new `User.id` type
- [x] 1.5 Leave `Account.id`, `Session.id`, and `VerificationToken` fields as `String` (Auth.js internal, do not change)

## 2. Database Migration

- [x] 2.1 Run `npx prisma migrate reset` to drop and recreate the SQLite database with the new integer ID schema
- [x] 2.2 Run `npx prisma generate` to regenerate the Prisma client with updated types
- [x] 2.3 Run `npx prisma db seed` if a seed script exists, to repopulate test data

## 3. Session Type Augmentation

- [x] 3.1 In `auth.ts` or a `types/next-auth.d.ts` declaration file, augment the `Session` type so `session.user.id` is typed as `number` (not `string`)
- [x] 3.2 In `auth.config.ts` or the Auth.js callbacks, ensure `token.sub` / `session.user.id` is cast to a number when setting the session

## 4. API Routes — ID Parsing

- [x] 4.1 Update `app/api/categories/[id]/route.ts` — parse `params.id` with `z.coerce.number().int().positive()` instead of using as string
- [x] 4.2 Update `app/api/expenses/[id]/route.ts` — parse `params.id` as integer
- [x] 4.3 Update `app/api/expenses/[id]/cancel-recurrence/route.ts` — parse `params.id` as integer
- [x] 4.4 Update `app/api/projects/[id]/route.ts` — parse `params.id` as integer
- [x] 4.5 Update `app/api/projects/[id]/expenses/route.ts` — parse `params.id` as integer
- [x] 4.6 Update `app/api/projects/[id]/expenses/[expenseId]/route.ts` — parse both `params.id` and `params.expenseId` as integers
- [x] 4.7 Update `app/api/reports/projects/[id]/route.ts` — parse `params.id` as integer
- [x] 4.8 Update `app/api/profile/route.ts` — use `session.user.id` as number in Prisma queries
- [x] 4.9 Update `app/api/reports/general/route.ts` and `app/api/reports/summary/route.ts` — use `session.user.id` as number

## 5. Mobile API Routes — ID Parsing

- [x] 5.1 Update `app/api/mobile/expenses/[id]/route.ts` — parse `params.id` as integer
- [x] 5.2 Update `app/api/mobile/projects/[id]/route.ts` — parse `params.id` as integer
- [x] 5.3 Update `app/api/mobile/expenses/route.ts` and `app/api/mobile/projects/route.ts` — use user ID as number in queries
- [x] 5.4 Update `app/api/mobile/categories/route.ts` — use user ID as number in queries

## 6. Dashboard Pages — ID Handling

- [x] 6.1 Update `app/(dashboard)/expenses/[id]/page.tsx` — parse `params.id` as integer
- [x] 6.2 Update `app/(dashboard)/projects/[id]/page.tsx` — parse `params.id` as integer
- [x] 6.3 Update `app/(dashboard)/reports/projects/[id]/page.tsx` — parse `params.id` as integer
- [x] 6.4 Audit remaining dashboard pages (`page.tsx`, `projects/page.tsx`, `reports/page.tsx`) for any hardcoded string ID usage

## 7. Verification

- [ ] 7.1 Run `npx prisma studio` or inspect the DB to confirm ID columns are integers starting at 1
- [x] 7.2 Run `npm test && npm run lint` and fix all errors
- [ ] 7.3 Start the dev server and verify: sign in, create an expense, create a project, visit expense detail and project detail pages — confirm URLs show numeric IDs
- [ ] 7.4 Test sign-in and sign-out to confirm Auth.js adapter works with integer User IDs
