## Context

The expense tracker is a Next.js 14 App Router app backed by MySQL (via Prisma) and Auth.js v5 for session management. The mobile client is an Expo/React Native app that communicates with the Next.js backend via JWT-authenticated REST endpoints under `/api/mobile/`.

The `User` model currently stores only `email` and `password`. No profile editing surface exists anywhere in the product. The mobile expense list uses a `FlatList` but has no `RefreshControl`, so users cannot trigger a reload by swiping down.

## Goals / Non-Goals

**Goals:**
- Let authenticated web users view and update name, email, password, phone number, and address on a dedicated `/profile` page
- Securely handle password changes (require current password, hash new password)
- Persist new profile fields in the database via a Prisma migration
- Add pull-to-refresh to the mobile expenses list screen (and optionally projects/index screens)

**Non-Goals:**
- Avatar / profile photo upload
- Email verification flow after email change
- Push notification preferences
- Profile editing on the mobile app (read-only display is fine for now)
- Rate-limiting or account-lockout on password change (deferred)

## Decisions

### 1. Extend `User` model with nullable profile fields

Add `name String?`, `phoneNumber String?`, and `address String?` to the Prisma `User` model. These are optional so existing rows require no backfill.

**Why nullable over required with default:** Existing users have no name/phone/address data. Making them nullable avoids a migration default value and keeps the data model honest.

**Alternative considered:** Separate `UserProfile` table. Rejected — the data volume is tiny and a join just to read the user's name adds unnecessary complexity.

### 2. Single `PATCH /api/profile` endpoint

A single endpoint handles all profile field updates. The request body is a partial object; only provided fields are updated. Password change requires `currentPassword` + `newPassword` fields and is validated server-side before hashing.

**Why PATCH:** Semantically correct for partial updates. Avoids the cognitive overhead of separate endpoints for name vs password.

**Password change flow:** `bcryptjs.compare(currentPassword, user.password)` → if mismatch, return 400. Otherwise `bcryptjs.hash(newPassword, 10)` → update DB.

### 3. Web profile page at `/profile`

A new `app/profile/page.tsx` (server component shell) renders a `ProfileForm` client component. The form is split into two sections: General Info (name, email, phone, address) and Change Password. Each section submits independently to avoid forcing users to fill in a password just to update their name.

**Form library:** React Hook Form + Zod (already in use across the app).

### 4. Mobile pull-to-refresh via `RefreshControl`

React Native's built-in `RefreshControl` is passed as the `refreshControl` prop to the existing `FlatList` (or `ScrollView`) on the expenses screen. It calls the existing `load()` callback when the user swipes down. No new library is needed.

**Why native `RefreshControl` over a third-party library:** Zero extra dependencies; `RefreshControl` is stable, well-tested, and matches platform conventions on both iOS and Android.

## Risks / Trade-offs

- **Email uniqueness on update**: If a user tries to change their email to one already in use, the Prisma upsert will throw a unique constraint error. The API must catch this and return a user-friendly 409 response. → Mitigation: wrap the Prisma call in a try/catch and check for Prisma error code `P2002`.

- **Session staleness after email change**: Auth.js sessions cache the user's email. After an email update the session JWT/cookie will reflect the old email until it expires or the user signs out. → Mitigation: document this known limitation in a UI hint ("Sign out and back in to see your new email reflected everywhere"). Full session invalidation is deferred.

- **Password exposure in logs**: Never log request bodies on the profile endpoint. → Mitigation: no structured logging of POST/PATCH bodies in this codebase; standard middleware only logs method + path.

- **Mobile refresh UX**: `RefreshControl` shows a spinner above the list while refreshing. If `load()` is slow the spinner may show for several seconds. → Acceptable trade-off; no mitigation needed at this stage.

## Migration Plan

1. Add nullable columns to `User` via Prisma migration (`prisma migrate dev`)
2. Deploy API endpoint and web profile page (no feature flag needed — new route, no existing behavior changed)
3. Deploy mobile update (Expo OTA or app store build depending on release cadence)
4. Rollback: revert API/page deploy; the migration columns are nullable so no data loss if rolled back before any user saves profile data
