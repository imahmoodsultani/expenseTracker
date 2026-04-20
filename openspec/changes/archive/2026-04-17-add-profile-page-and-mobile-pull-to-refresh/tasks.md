## 1. Database Schema

- [x] 1.1 Add `name String?`, `phoneNumber String?`, and `address String?` nullable fields to the `User` model in `prisma/schema.prisma`
- [x] 1.2 Run `npx prisma migrate dev --name add-user-profile-fields` to generate and apply the migration
- [x] 1.3 Regenerate Prisma client with `npx prisma generate`

## 2. Profile API Endpoint

- [x] 2.1 Create `app/api/profile/route.ts` with a `PATCH` handler that reads the authenticated session and accepts a partial profile body (`name`, `email`, `phoneNumber`, `address`, `currentPassword`, `newPassword`)
- [x] 2.2 Validate the request body with a Zod schema (email format, newPassword min 8 chars if provided)
- [x] 2.3 If `currentPassword` + `newPassword` are provided, verify `currentPassword` against the stored hash using `bcryptjs.compare`; return 400 if mismatch
- [x] 2.4 Hash `newPassword` with `bcryptjs.hash(newPassword, 10)` before writing to DB
- [x] 2.5 Catch Prisma unique constraint error (`P2002`) on email and return a 409 with a user-friendly message
- [x] 2.6 Update the user record via `prisma.user.update` with only the provided fields and return the updated user (excluding `password`)

## 3. Web Profile Page

- [x] 3.1 Create `app/profile/page.tsx` as a server component that reads the session and passes the current user data as props to the client form
- [x] 3.2 Create `app/profile/ProfileForm.tsx` as a client component with two sections: **General Info** (name, email, phone number, address) and **Change Password** (current password, new password, confirm new password)
- [x] 3.3 Wire each section to its own `react-hook-form` instance with Zod resolver validation
- [x] 3.4 Implement `onSubmit` handlers that send `PATCH /api/profile` requests with only the relevant fields for each section
- [x] 3.5 Display inline field-level validation errors and a success/error toast or banner after submit
- [x] 3.6 Add a link to `/profile` in the main navigation (sidebar or header) so users can discover the page

## 4. Mobile Pull-to-Refresh

- [x] 4.1 Import `RefreshControl` from `react-native` in `mobile/app/(tabs)/expenses.tsx`
- [x] 4.2 Add a `refreshing` boolean state variable (separate from `loading`) initialized to `false`
- [x] 4.3 Create a `handleRefresh` callback that sets `refreshing` to `true`, calls `load()`, and sets `refreshing` back to `false` when complete
- [x] 4.4 Pass `<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />` as the `refreshControl` prop on the existing `FlatList`
- [x] 4.5 Ensure the full-screen `ActivityIndicator` only renders when `loading` is `true` and `refreshing` is `false` so the two indicators don't overlap

## 5. Verification

- [x] 5.1 Test the profile page end-to-end: load page, update name/phone/address, verify persisted in DB
- [x] 5.2 Test email-already-in-use error path on the profile page
- [x] 5.3 Test password change: correct current password, incorrect current password, and too-short new password
- [ ] 5.4 Test pull-to-refresh on the mobile expenses screen on both iOS and Android simulators
- [x] 5.5 Run `npm test && npm run lint` and confirm all checks pass
