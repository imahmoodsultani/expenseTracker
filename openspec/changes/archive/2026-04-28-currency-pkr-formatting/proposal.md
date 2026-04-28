## Why

The expense tracker currently displays all monetary values with USD (`$`) formatting, but the target users operate in Pakistan and require Pakistani Rupee (PKR) formatting with proper comma-separated thousands for readability. Large amounts like 150000 are hard to scan at a glance and need to display as Rs. 1,50,000 or PKR 150,000.

## What Changes

- Replace all hardcoded `$` currency symbols with `Rs.` (PKR symbol)
- Replace raw `toFixed(2)` formatting with locale-aware number formatting that adds commas
- Introduce a shared `formatCurrency` utility function to centralise formatting logic and avoid duplication
- Update all display sites: expense list, project list, project detail page, dashboard page, reports pages, and the chart tooltip

## Capabilities

### New Capabilities

- `currency-formatting`: A shared utility for formatting monetary values as PKR with comma-separated thousands (e.g., `Rs. 1,50,000` using `en-PK` locale), used across all amount display points in the UI

### Modified Capabilities

<!-- No existing spec-level requirements are changing — this is purely a display/formatting change with no API or data model impact -->

## Impact

- **Components**: `components/expenses/ExpenseList.tsx`, `components/projects/ProjectList.tsx`, `components/reports/CategoryTotalsChart.tsx`
- **Pages**: `app/(dashboard)/page.tsx`, `app/(dashboard)/projects/[id]/page.tsx`, `app/(dashboard)/reports/general/page.tsx`, `app/(dashboard)/reports/projects/[id]/page.tsx`, `app/(dashboard)/reports/page.tsx`
- **New file**: `lib/format-currency.ts` (shared utility)
- **No API or database changes** — this is a pure frontend display change
