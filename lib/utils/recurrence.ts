type RecurrenceFrequency = "WEEKLY" | "MONTHLY" | "YEARLY";

/**
 * Returns the next due date for a recurring expense.
 * WEEKLY  → +7 days
 * MONTHLY → +1 calendar month
 * YEARLY  → +1 calendar year
 */
export function getNextDueDate(date: Date, frequency: RecurrenceFrequency): Date {
  const next = new Date(date);
  switch (frequency) {
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
    case "YEARLY":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}
