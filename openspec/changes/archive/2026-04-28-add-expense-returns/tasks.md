## 1. Validation

- [x] 1.1 In `lib/schemas/expense.schema.ts`, update the `amount` field — replace the `.positive()` / `.min()` constraint with `.refine(v => v !== 0, "Amount cannot be zero")` so negative values are accepted

## 2. Expense Form UI

- [x] 2.1 In `components/expenses/ExpenseForm.tsx`, add helper text below the amount input: "Enter a negative amount to record a return or refund"
- [x] 2.2 Confirm the amount field's `type="number"` allows negative input (no `min="0"` attribute); remove `min` if present

## 3. Expense List — Visual Distinction

- [x] 3.1 Create `components/expenses/ReturnBadge.tsx` — a small badge component (similar to `RecurringBadge.tsx`) that renders a "Return" label styled in red
- [x] 3.2 In `components/expenses/ExpenseList.tsx`, import `ReturnBadge` and render it next to any expense row where `amount < 0`
- [x] 3.3 In `ExpenseList.tsx`, apply a red text class to the amount cell when `amount < 0`

## 4. Verification

- [x] 4.1 Manually test: add a negative-amount expense and confirm it saves, shows the Return badge, and the amount is red
- [x] 4.2 Manually test: confirm zero amount is rejected with the validation error
- [x] 4.3 Manually test: open a report that includes a return expense and confirm the category total is correctly reduced
- [x] 4.4 Manually test: download a CSV from a report and confirm the negative amount appears correctly in the file
