type RecurrenceFrequency = "WEEKLY" | "MONTHLY" | "YEARLY";

const LABELS: Record<RecurrenceFrequency, string> = {
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

interface RecurringBadgeProps {
  frequency: RecurrenceFrequency;
}

export default function RecurringBadge({ frequency }: RecurringBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
      ↻ {LABELS[frequency]}
    </span>
  );
}
