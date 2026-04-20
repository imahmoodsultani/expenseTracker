## Why

The expense tracker web app currently has no mobile or tablet responsive design — the navigation overflows on small screens, forms render in fixed two-column grids that break below 500px, and tables have no horizontal scroll protection. Users who open the app on a phone or tablet get a broken UI that is difficult or impossible to use.

## What Changes

- Add a hamburger menu with a mobile drawer to replace the always-visible horizontal nav on small screens
- Fix form layouts that use `grid-cols-2` without responsive breakpoints (ExpenseForm, ProfileForm)
- Make expense list rows stack vertically on mobile instead of a cramped single row
- Add `overflow-x-auto` and responsive column visibility to report tables
- Increase button/touch-target sizes to meet the 44×44px minimum for touch devices
- Make spacing, padding, and heading sizes scale with screen size using Tailwind responsive prefixes
- Reduce header clutter on mobile (hide email, adjust gaps)
- Make chart heights responsive
- Ensure viewport meta tag is correct in the root layout

## Capabilities

### New Capabilities

- `mobile-navigation`: Hamburger menu with a slide-in drawer for mobile screens (replaces visible nav on < md breakpoint)
- `responsive-layout`: Responsive spacing, typography, grid layouts, and padding across all pages and components

### Modified Capabilities

- `user-profile-management`: Profile form layout changes to single-column on mobile (requirement: form must be usable on screens ≥ 375px)

## Impact

- **Files changed**: `app/(dashboard)/layout.tsx`, `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`, `components/ExpenseList.tsx`, `components/ExpenseForm.tsx`, `components/ExpenseFilters.tsx`, `components/CategoryTotalsChart.tsx`, `components/ProfileForm.tsx`, `app/(dashboard)/page.tsx`, `app/(dashboard)/projects/page.tsx`, `app/(dashboard)/reports/page.tsx`
- **New components**: `components/MobileNav.tsx` (hamburger + drawer)
- **Dependencies**: No new packages required — Tailwind CSS responsive utilities cover all needs
- **APIs**: None affected
- **Breaking changes**: None — visual-only changes
