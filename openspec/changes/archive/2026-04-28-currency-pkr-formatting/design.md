## Context

All monetary amounts in the expense tracker are currently displayed with a hardcoded `$` prefix and `toFixed(2)` formatting (e.g., `$1500.00`). The formatting logic is duplicated across eight files — component files and page files. The app targets Pakistani users who expect PKR (Pakistani Rupee) with comma-separated thousands (e.g., `Rs. 1,500.00`).

## Goals / Non-Goals

**Goals:**
- Display all monetary amounts in PKR using `Rs.` symbol
- Add comma formatting for thousands separators (e.g., `1,500`, `12,50,000`)
- Centralise formatting in a single `lib/format-currency.ts` utility to eliminate duplication

**Non-Goals:**
- Storing currency in the database — amounts remain plain numbers
- Supporting multiple currencies or user-selectable currency
- Changing API response formats
- Modifying the amount input field (entry remains numeric)

## Decisions

### Decision 1: Single shared utility vs inline Intl.NumberFormat

**Choice**: Introduce `lib/format-currency.ts` with a `formatCurrency(amount: number | string): string` function.

**Rationale**: Eight call sites currently duplicate the `$` prefix + `toFixed(2)` pattern. A single utility keeps the locale/symbol configuration in one place and makes a future currency change a one-line edit.

**Alternative considered**: Update each file inline with `Intl.NumberFormat`. Rejected because it scatters locale config across the codebase.

### Decision 2: Locale for comma formatting

**Choice**: Use `en-PK` locale with `Intl.NumberFormat` (`minimumFractionDigits: 2`, `maximumFractionDigits: 2`), which produces Western-style thousands separators (1,500,000.00) rather than South Asian grouping (15,00,000.00).

**Rationale**: Western-style grouping (`1,234,567`) is universally legible and matches what users already expect from financial apps. South Asian grouping (`12,34,567`) is less common in software UIs.

**Alternative considered**: `ur-PK` locale (South Asian grouping). Rejected for readability reasons above.

### Decision 3: Symbol prefix

**Choice**: `Rs. ` prefix (with a trailing space) rather than the ISO code `PKR`.

**Rationale**: `Rs.` is the conventional informal symbol for Pakistani Rupee and is shorter and cleaner in the UI. `PKR` is more appropriate for formal/international contexts.

## Risks / Trade-offs

- [Locale availability] `en-PK` may not be available in all JS runtimes → Mitigation: fall back gracefully using `en-US` grouping, which produces the same comma pattern.
- [Decimal display] Amounts stored as integers (e.g., from Prisma) will still format correctly since `Number()` coercion handles both strings and integers.

## Migration Plan

1. Create `lib/format-currency.ts`
2. Update the three component files to import and use `formatCurrency`
3. Update the five page files to use `formatCurrency` instead of inline `$` + `toFixed`
4. No database migration or API changes needed
5. Rollback: revert the utility file and all call sites — no persistent state is affected
