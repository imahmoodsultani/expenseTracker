## Why

The header currently shows a redundant email address that clutters the nav bar — it's already visible on the profile page. The plain "Profile" text link also wastes an opportunity to give the app a polished, app-like feel with quick access to account info inline.

## What Changes

- Remove `{session.user.email}` text from the desktop header
- Replace the "Profile" `NavLink` text with a circular user avatar icon (using a generic user icon, e.g. from `lucide-react`)
- Clicking the avatar opens a popover/dialog showing the user's name and email as read-only fields
- The dialog includes an "Edit Details" button that navigates to `/profile`

## Capabilities

### New Capabilities

- `header-profile-avatar`: User avatar icon in the header that opens a quick-view dialog with read-only name/email and a link to the full profile edit page.

### Modified Capabilities

- `user-profile-management`: The header entry point to the profile page changes from a text nav link to an avatar icon with inline preview dialog. No spec-level requirement changes to the profile page itself.

## Impact

- `app/(dashboard)/layout.tsx` — remove email span, replace `NavLink` with avatar button + popover
- New component: `components/ui/ProfileAvatarMenu.tsx` (client component for avatar + dialog/popover)
- No API or database changes required
