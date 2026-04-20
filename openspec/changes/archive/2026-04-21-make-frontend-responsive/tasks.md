## 1. Dashboard Layout & Navigation

- [x] 1.1 Verify viewport meta tag exists in `app/layout.tsx` root layout (`<meta name="viewport" content="width=device-width, initial-scale=1" />`)
- [x] 1.2 Create `components/MobileNav.tsx` — hamburger button + slide-in drawer with all nav links, closes on route change via `usePathname`
- [x] 1.3 Update `app/(dashboard)/layout.tsx` header: add `hidden md:flex` to desktop nav, add `md:hidden` hamburger button, hide email on mobile, render `<MobileNav>`
- [x] 1.4 Reduce header gap from `gap-6`/`gap-3` to `gap-3 md:gap-6`/`gap-2 md:gap-3` for mobile fit

## 2. Forms

- [x] 2.1 In `components/ExpenseForm.tsx`, change `grid-cols-2` to `grid-cols-1 sm:grid-cols-2` on the Amount/Date grid
- [x] 2.2 In `components/ExpenseForm.tsx`, update `gap-4` to `gap-3 sm:gap-4` and button padding to ensure ≥ 44px touch targets
- [x] 2.3 In `components/ProfileForm.tsx` (profile/ProfileForm.tsx), change any fixed multi-column grids to `grid-cols-1` and reduce card padding from `p-6` to `p-4 sm:p-6`

## 3. Expense List

- [x] 3.1 In `components/ExpenseList.tsx`, change the row container from `flex items-center gap-4` to `flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4`
- [x] 3.2 Ensure amount and action buttons wrap to a second line on mobile using `flex items-center justify-between sm:justify-end`
- [x] 3.3 Increase action button padding to at least `py-2.5 px-3` to ensure 44px touch targets

## 4. Expense Filters

- [x] 4.1 In `components/ExpenseFilters.tsx`, ensure all filter inputs use `w-full` and the wrapping `flex-wrap` container stacks to full-width inputs on mobile

## 5. Page Layouts

- [x] 5.1 In `app/(dashboard)/page.tsx`, update heading from `text-2xl` to `text-xl sm:text-2xl` and page spacing from `space-y-6` to `space-y-4 sm:space-y-6`
- [x] 5.2 In `app/(dashboard)/page.tsx`, update the title+button row from `flex items-center justify-between` to `flex flex-wrap items-center justify-between gap-2`
- [x] 5.3 In `app/(dashboard)/projects/page.tsx`, apply same heading and spacing responsive changes as 5.1 and 5.2
- [x] 5.4 In `app/(dashboard)/reports/page.tsx` and sub-report pages, apply same heading and spacing responsive changes

## 6. Report Tables

- [x] 6.1 Wrap all `<table>` elements in report pages with `<div className="overflow-x-auto">` to prevent horizontal overflow on mobile
- [x] 6.2 Ensure table cells have `whitespace-nowrap` on key columns (amount, date) to prevent awkward wrapping within cells

## 7. Auth Pages

- [x] 7.1 In `app/(auth)/login/page.tsx`, update card padding from `p-8` to `p-6 sm:p-8` and heading from `text-2xl` to `text-xl sm:text-2xl`
- [x] 7.2 In `app/(auth)/register/page.tsx`, apply same padding and heading changes as 7.1

## 8. Verification

- [ ] 8.1 Open the app in a browser at 375px viewport width and verify the hamburger menu appears and navigation works
- [ ] 8.2 Verify the expense form fields stack to single column at 375px
- [ ] 8.3 Verify expense list rows stack vertically on mobile
- [ ] 8.4 Verify report tables scroll horizontally without breaking page layout
- [ ] 8.5 Verify profile form is usable at 375px with no overflow
