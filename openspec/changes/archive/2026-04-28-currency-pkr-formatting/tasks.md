## 1. Create Shared Utility

- [x] 1.1 Create `lib/format-currency.ts` exporting `formatCurrency(amount: number | string): string` using `Intl.NumberFormat` with `en-PK` locale, `Rs. ` prefix, and 2 decimal places

## 2. Update Components

- [x] 2.1 Update `components/expenses/ExpenseList.tsx`: replace `${Number(expense.amount).toFixed(2)}` with `formatCurrency(expense.amount)`
- [x] 2.2 Update `components/projects/ProjectList.tsx`: replace `$${Number(project.totalAmount).toFixed(2)}` with `formatCurrency(project.totalAmount)`
- [x] 2.3 Update `components/reports/CategoryTotalsChart.tsx`: replace the Tooltip formatter `$${value.toFixed(2)}` with `formatCurrency(value)`

## 3. Update Pages

- [x] 3.1 Update `app/(dashboard)/page.tsx`: replace `$${totalAmount}` with `formatCurrency(totalAmount)` (remove the `.toFixed(2)` call on `totalAmount` as `formatCurrency` handles it)
- [x] 3.2 Update `app/(dashboard)/projects/[id]/page.tsx`: replace `$${totalAmount}` with `formatCurrency(totalAmount)` (same as above)
- [x] 3.3 Update `app/(dashboard)/reports/general/page.tsx`: replace all `$${grandTotal}` and `$${row.total}` with `formatCurrency(...)`
- [x] 3.4 Update `app/(dashboard)/reports/projects/[id]/page.tsx`: replace all `$${grandTotal}` and `$${row.total}` with `formatCurrency(...)`
- [x] 3.5 Update `app/(dashboard)/reports/page.tsx`: replace all `$${grandTotal}`, `$${row.total}`, and `$${src.total}` with `formatCurrency(...)`
