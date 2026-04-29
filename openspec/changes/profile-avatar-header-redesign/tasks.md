## 1. Dependencies

- [x] 1.1 Verify `@radix-ui/react-popover` is in `package.json`; if missing, install it (`npm install @radix-ui/react-popover`)
- [x] 1.2 Verify `lucide-react` is in `package.json`; if missing, install it (`npm install lucide-react`)

## 2. ProfileAvatarMenu Component

- [x] 2.1 Create `components/ui/ProfileAvatarMenu.tsx` as a `"use client"` component that accepts `name: string | null` and `email: string | null` props
- [x] 2.2 Implement a `CircleUser` (or `UserCircle`) icon from `lucide-react` as the trigger button inside a Radix `Popover.Root` / `Popover.Trigger`
- [x] 2.3 Inside `Popover.Content`, render the user's name (or "No name set" if null) and email as read-only text (not form inputs)
- [x] 2.4 Add an "Edit Details" link/button inside the popover that navigates to `/profile` using Next.js `Link`
- [x] 2.5 Style the popover content with Tailwind: white background, shadow, rounded corners, padding, z-index above header

## 3. Header Layout Update

- [x] 3.1 In `app/(dashboard)/layout.tsx`, remove the `<span className="text-sm text-gray-500">{session.user.email}</span>` element
- [x] 3.2 Remove the `<NavLink href="/profile">Profile</NavLink>` element
- [x] 3.3 Import and render `<ProfileAvatarMenu name={session.user.name ?? null} email={session.user.email ?? null} />` in place of the removed elements, inside the existing `hidden md:flex` span

## 4. Verification

- [ ] 4.1 Start the dev server and confirm the desktop header shows the avatar icon, not the "Profile" text or email
- [ ] 4.2 Click the avatar and confirm the popover shows the user's name and email as non-editable text
- [ ] 4.3 Click "Edit Details" and confirm navigation to `/profile`
- [ ] 4.4 Click outside the popover and confirm it closes
- [ ] 4.5 Confirm mobile header is unchanged (MobileNav still renders correctly)

- [x] 4.6 Run `npm run lint` and fix any type errors
