"use client";

import { useState } from "react";
import RecurringBadge from "./RecurringBadge";
import { formatCurrency } from "@/lib/format-currency";

type RecurrenceFrequency = "WEEKLY" | "MONTHLY" | "YEARLY";

interface Expense {
  id: string;
  title: string;
  amount: string | number;
  date: string;
  categoryId: string;
  category: { id: string; name: string };
  description?: string | null;
  isRecurring: boolean;
  recurrenceFrequency?: RecurrenceFrequency | null;
  projectId?: string | null;
}

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export default function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function handleDelete(id: string, projectId?: string | null) {
    const url = projectId ? `/api/projects/${projectId}/expenses/${id}` : `/api/expenses/${id}`;
    const res = await fetch(url, { method: "DELETE" });
    if (res.ok) onDelete(id);
    setConfirmId(null);
  }

  if (expenses.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        No expenses yet. Add one to get started.
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-100 rounded-md border border-gray-200 bg-white">
      {expenses.map((expense) => (
        <div key={expense.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium text-gray-900">{expense.title}</span>
              {expense.isRecurring && expense.recurrenceFrequency && (
                <RecurringBadge frequency={expense.recurrenceFrequency} />
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
              <span>{expense.date.slice(0, 10)}</span>
              <span>·</span>
              <span>{expense.category.name}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 sm:contents">
            <span className="shrink-0 text-sm font-semibold text-gray-900">
              {formatCurrency(expense.amount)}
            </span>

            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => onEdit(expense)}
                className="rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50"
              >
                Edit
              </button>

              {confirmId === expense.id ? (
                <>
                  <button
                    onClick={() => handleDelete(expense.id, expense.projectId)}
                    className="rounded-md bg-red-600 px-3 py-2 text-xs text-white hover:bg-red-700"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmId(expense.id)}
                  className="rounded-md border border-red-200 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
