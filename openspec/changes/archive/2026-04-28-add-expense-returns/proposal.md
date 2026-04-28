## Why

Users sometimes need to record expense returns (e.g., returning purchased goods for a refund) without going back to edit the original expense — which would destroy the audit trail. Supporting negative-amount expenses lets users log returns as discrete entries that naturally offset totals in reports.

## What Changes

- Allow expense amounts to be negative values (returns/refunds)
- Update validation to accept negative numbers (while still rejecting zero)
- Display return expenses visually distinct in expense lists (e.g., "Return" badge, red amount)
- Ensure category totals and report summaries correctly subtract negative amounts
- Update CSV export to include negative amounts as-is

## Capabilities

### New Capabilities

- `expense-returns`: Ability to create expenses with a negative amount representing a return or refund; these appear in lists and reports as offsets against positive expenses in the same category

### Modified Capabilities

- None — the existing expense management and reporting specs do not need requirement-level changes; negative amounts are handled as a natural extension of the amount field

## Impact

- **Validation schemas** (`lib/schemas/`) — remove the positive-only constraint on `amount`
- **Expense form** (`components/expenses/`) — add UI cue that a negative amount represents a return; no new fields needed
- **Expense list** (`components/expenses/`) — visually differentiate negative-amount rows
- **Report calculations** (`app/api/reports/`, `components/reports/`) — already use `SUM`; negative values will automatically reduce category totals
- **CSV export** — no change needed; negative numbers serialize correctly
- **Prisma schema** — `amount Decimal` already supports negatives; no migration required
