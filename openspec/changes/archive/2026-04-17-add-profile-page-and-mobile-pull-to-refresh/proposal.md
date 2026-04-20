## Why

Users currently have no way to view or update their account details (name, email, password, phone number, or address) within the app. Additionally, mobile users lack a native pull-to-refresh gesture to reload expense data, forcing them to navigate away and back. Both gaps degrade the user experience for a self-service financial tool.

## What Changes

- Add a `/profile` page (web) where authenticated users can view and edit their name, email, password, phone number, and address
- Persist profile changes to the database via a secure API endpoint
- Add pull-to-refresh (swipe-down gesture) to the mobile app's expense list screen so users can reload data without navigating away

## Capabilities

### New Capabilities

- `user-profile-management`: Web profile page allowing authenticated users to view and update their account details (name, email, password, phone number, address) with form validation and secure persistence
- `mobile-pull-to-refresh`: Pull-to-refresh gesture on the mobile expense list screen that triggers a data reload when the user swipes down

### Modified Capabilities

<!-- No existing spec-level requirements are changing -->

## Impact

- **Database**: `User` model extended with `phoneNumber` and `address` fields (Prisma migration required)
- **API**: New `PATCH /api/profile` endpoint for updating user profile; existing `GET /api/user` may be reused or extended
- **Web frontend**: New `app/profile/page.tsx` and supporting form components
- **Mobile**: Pull-to-refresh wired into the expense list screen (React Native `RefreshControl` or equivalent)
- **Auth**: Password update requires current-password verification before hashing the new one
- **Dependencies**: No new web dependencies; mobile may use built-in `RefreshControl` from React Native
