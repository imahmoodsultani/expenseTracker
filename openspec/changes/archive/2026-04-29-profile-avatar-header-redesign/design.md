## Context

The dashboard layout (`app/(dashboard)/layout.tsx`) is a Next.js server component that reads the session and renders the sticky header. Currently it renders:
1. A `NavLink` with text "Profile" linking to `/profile`
2. A `<span>` showing `session.user.email`

Both are visible only on `md+` viewports. The goal is to collapse these into a single avatar icon that reveals an inline popover with read-only account info and a link to the full edit page.

## Goals / Non-Goals

**Goals:**
- Remove redundant email from header
- Replace "Profile" text link with a circular user avatar icon button
- Avatar click opens a small popover/dialog with: read-only name, read-only email, "Edit Details" button that goes to `/profile`
- No layout regressions on mobile (mobile uses `MobileNav` which is unaffected)

**Non-Goals:**
- Uploading a custom avatar image
- Inline editing within the popover (full edit stays at `/profile`)
- Changing the mobile navigation

## Decisions

**Decision: Shadcn `Popover` over a custom modal**
The app already uses Tailwind/shadcn-style components. A `Popover` (from `@radix-ui/react-popover`) is lighter than a full `Dialog` and aligns better with the UX pattern of a header profile menu. If shadcn `Popover` is not yet installed, it should be added. Alternative considered: custom `Dialog` — rejected as heavier than needed for a small info card.

**Decision: New `ProfileAvatarMenu` client component**
The layout is a server component and must stay server-rendered to access the session. The interactive popover logic (open/close state) needs `"use client"`. Solution: extract a dedicated `ProfileAvatarMenu` client component that receives `name` and `email` as props from the server layout. This keeps the layout server-only.

**Decision: Generic user icon instead of initials avatar**
Using a `lucide-react` `UserCircle` or `CircleUser` icon avoids needing to render initials (which require handling null name). Simpler, no edge cases.

## Risks / Trade-offs

- [Risk: Popover may conflict with sticky header z-index] → Set popover z-index higher than header (`z-20`+); test on scroll
- [Risk: `@radix-ui/react-popover` not installed] → Check `package.json`; add via shadcn CLI or direct install if missing
- [Risk: Name may be null for users who haven't set it] → Show "No name set" or just the email in the popover; never crash on null

## Migration Plan

1. Install `@radix-ui/react-popover` if not present (or use shadcn `add popover`)
2. Create `components/ui/ProfileAvatarMenu.tsx`
3. Update `app/(dashboard)/layout.tsx` to use the new component, removing the email span and Profile NavLink
4. Verify desktop and mobile renders; no DB or API changes needed
