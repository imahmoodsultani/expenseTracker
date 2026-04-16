"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ExpenseForm from "@/components/expenses/ExpenseForm";

interface Expense {
  id: string;
  title: string;
  amount: string | number;
  date: string;
  categoryId: string;
  category: { id: string; name: string };
  description?: string | null;
  isRecurring: boolean;
  recurrenceFrequency?: "WEEKLY" | "MONTHLY" | "YEARLY" | null;
  projectId: null;
}

export default function EditExpensePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/expenses/${id}`);
      if (res.status === 404) {
        setNotFound(true);
      } else if (res.ok) {
        const data = await res.json();
        setExpense(data);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-md bg-gray-100" />
        <div className="h-64 animate-pulse rounded-md bg-gray-100" />
      </div>
    );
  }

  if (notFound || !expense) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Expense not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Edit Expense</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <ExpenseForm
          projectId={null}
          expense={expense}
          onSuccess={() => router.push("/")}
          onCancel={() => router.push("/")}
        />
      </div>
    </div>
  );
}
