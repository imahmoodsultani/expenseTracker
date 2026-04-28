## Context

The app currently validates expense amounts as strictly positive numbers (> 0). Users who need to record a return or refund must edit the original expense — destroying the original record — or add a separate note. This change extends the amount field to accept negative values so a return can be logged as a standalone expense entry.

The Prisma schema uses `amount Decimal`, which natively supports negatives. No database migration is needed. Report queries already use aggregation (`SUM`), so negative amounts automatically reduce category totals without any query changes.

## Goals / Non-Goals

**Goals:**
- Allow negative expense amounts (returns/refunds)
- Visually differentiate return entries in expense lists
- Ensure form validation still rejects zero
- Confirm reports/CSV work correctly with negative values

**Non-Goals:**
- Linking a return to a specific original expense (no parent-child relationship)
- A dedicated "Return" transaction type or separate UI flow
- Partial return tracking against an original expense's remaining balance

## Decisions

### 1. No new field — negative amount is the signal
**Decision**: Reuse the existing `amount` field; a negative value means a return. No new `isReturn` boolean or `type` field.

**Rationale**: Keeps the data model minimal. The sign of the amount is self-documenting, consistent with double-entry bookkeeping conventions, and requires zero schema migration. An explicit `isReturn` flag would be redundant — it would always equal `amount < 0`.

**Alternative considered**: Add `isReturn: Boolean` + enforce `amount > 0`. Rejected because it adds a column, complicates validation, and splits the concept across two fields.

### 2. UI label "Return" derived from sign
**Decision**: In the expense list, any row with `amount < 0` renders a "Return" badge and shows the amount in red. The form itself shows helper text "Enter a negative amount to record a return/refund" below the amount field.

**Rationale**: No extra field needed; the sign is the canonical indicator. Badge + color make returns immediately scannable.

### 3. Validation change: allow negatives, still reject zero
**Decision**: Update Zod schema from `z.number().positive()` to `z.number().refine(v => v !== 0, "Amount cannot be zero")`.

**Rationale**: Zero has no semantic meaning (neither an expense nor a return). Negative is valid (return). Positive is valid (expense).

## Risks / Trade-offs

- **Accidental negatives** — A user could accidentally type `-` before an amount. Mitigation: helper text in the form field clarifying that negative = return.
- **Report readability** — Category totals could go negative if returns exceed expenses. This is mathematically correct but may confuse users. Mitigation: no change for now; negative totals are accurate and meaningful. A future enhancement could add a warning.
- **Recurring returns** — A user could mark a negative expense as recurring. This is technically valid but unusual. Mitigation: no restriction; it's the user's responsibility.
