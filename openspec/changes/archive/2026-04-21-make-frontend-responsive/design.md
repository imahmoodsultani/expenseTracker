## Context

The expense tracker is a Next.js 15 App Router app styled with Tailwind CSS 3.4. The current frontend was built desktop-first with no responsive breakpoints on most components. Navigation is a horizontal header with all links always visible, forms use fixed two-column grids, and list/table layouts do not stack on small screens. No new packages are needed — Tailwind's built-in responsive prefix system (`sm:`, `md:`, `lg:`) covers all required layout changes, and the existing component structure can be augmented with a single new `MobileNav` component.

## Goals / Non-Goals

**Goals:**
- All pages usable on screens ≥ 375px wide (iPhone SE baseline)
- Navigation accessible on mobile via a hamburger/drawer pattern
- Forms, lists, and tables readable and interactable without horizontal scrolling
- Touch targets ≥ 44×44px on interactive elements
- No new runtime dependencies

**Non-Goals:**
- Dark mode support
- Native-app-style gestures (swipe to delete, pull-to-refresh)
- Changes to the React Native mobile app
- Performance optimizations unrelated to layout

## Decisions

### 1. Hamburger menu via local `useState` (no library)

**Decision**: Implement `MobileNav` as a self-contained component using a `useState` boolean to toggle a full-width drawer. Close on route change via `usePathname` + `useEffect`.

**Alternatives considered**:
- **Headless UI Dialog/Disclosure**: Adds a package dependency. Overkill for a single nav drawer.
- **Radix Sheet**: Same concern — unnecessary dependency for one component.

**Rationale**: The project has no pre-existing component library. A simple `useState` drawer is < 60 lines of code, zero dependencies, and fully sufficient.

### 2. Tailwind-only responsive classes (no CSS modules or custom media queries)

**Decision**: Apply responsive prefixes (`sm:`, `md:`, `lg:`) directly to existing Tailwind class lists. No custom media queries in CSS files.

**Alternatives considered**:
- **CSS Modules with media queries**: More verbose, inconsistent with the existing Tailwind-first codebase.
- **Container queries**: Overkill; all breakpoints are viewport-based.

**Rationale**: The entire codebase already uses Tailwind. Consistent approach, zero friction.

### 3. Breakpoint strategy: `md` (768px) as the mobile/desktop split

**Decision**: Use `md:` as the primary breakpoint for switching between mobile and desktop layouts. `sm:` (640px) used only for intermediate cases like the expense form 2-column grid.

**Rationale**: `md` maps to tablet portrait (768px), which is the natural inflection point for a sidebar/nav transition.

### 4. Tables: overflow-x-auto wrapper (no card conversion)

**Decision**: Wrap report tables in `overflow-x-auto` rather than converting them to card/list views on mobile.

**Alternatives considered**:
- **Card/stacked view on mobile**: Better UX but significantly more markup and conditional rendering per table.

**Rationale**: Report tables have 4–6 columns. Horizontal scroll is acceptable for report/data views. This keeps the change scope small and avoids duplicating table rendering logic.

## Risks / Trade-offs

- **[Risk] MobileNav drawer z-index conflicts** → Set `z-50` on the overlay and `z-40` on the sticky header. Validate manually.
- **[Risk] Expense list row height increases** → Stacking fields vertically on mobile will make each row taller, but the list is already scrollable so this is acceptable.
- **[Trade-off] overflow-x-auto tables** → Horizontal scroll is less discoverable than a card view. Acceptable for the report context; revisit if user feedback surfaces.
- **[Risk] Chart height responsiveness** → Recharts `ResponsiveContainer` with `width="100%"` already handles width. Fixed `height` is fine as-is for tablet; on very small screens 300px may feel tall. Mitigate by reducing to `height={220}` on mobile via a conditional or CSS class trick — out of scope for this change, as charts remain readable.

## Migration Plan

1. Implement `MobileNav` component and wire into dashboard layout
2. Update dashboard layout header for mobile (hide email, add hamburger)
3. Apply responsive classes to all page-level layouts (`space-y-*`, `flex-col md:flex-row`, heading sizes)
4. Fix `grid-cols-2` → `grid-cols-1 sm:grid-cols-2` in forms
5. Update `ExpenseList` row to stack on mobile
6. Wrap tables in `overflow-x-auto`
7. Update auth page padding/sizing for mobile
8. Verify viewport meta tag in root layout

No backend changes. No data migrations. Rollback = revert the CSS class edits.

## Open Questions

- None. All decisions resolved above.
