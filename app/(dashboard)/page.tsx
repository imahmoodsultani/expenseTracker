"use client";

import { useEffect, useState } from "react";
import ExpenseFilters, { type ExpenseFilterValues } from "@/components/expenses/ExpenseFilters";
import ExpenseList from "@/components/expenses/ExpenseList";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import { formatCurrency } from "@/lib/format-currency";

interface Category {
  id: string;
  name: string;
}

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
  projectId?: string | null;
}

export default function GeneralDashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<ExpenseFilterValues>({
    search: "",
    category: "",
    startDate: "",
    endDate: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchExpenses(f: ExpenseFilterValues) {
    const params = new URLSearchParams();
    if (f.search) params.set("search", f.search);
    if (f.category) params.set("category", f.category);
    if (f.startDate) params.set("startDate", f.startDate);
    if (f.endDate) params.set("endDate", f.endDate);
    const res = await fetch(`/api/expenses?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setExpenses(data.expenses);
    }
    setLoading(false);
  }

  async function fetchCategories() {
    const res = await fetch("/api/categories");
    if (res.ok) {
      const data = await res.json();
      setCategories(data.categories);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchExpenses(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  function handleFilterChange(f: ExpenseFilterValues) {
    setFilters(f);
  }

  function handleExpenseAdded(expense: Expense) {
    setExpenses((prev) => [expense, ...prev]);
    setShowForm(false);
  }

  function handleExpenseUpdated(updated: Expense) {
    setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setEditingExpense(null);
  }

  function handleDelete(id: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">General Expenses</h1>
          {!loading && (
            <p className="mt-1 text-sm text-gray-500">
              {expenses.length} expense{expenses.length !== 1 ? "s" : ""} · Total: {formatCurrency(totalAmount)}
            </p>
          )}
        </div>
        <button
          onClick={() => { setEditingExpense(null); setShowForm(true); }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add Expense
        </button>
      </div>

      {(showForm || editingExpense) && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            {editingExpense ? "Edit Expense" : "New Expense"}
          </h2>
          <ExpenseForm
            projectId={null}
            expense={editingExpense ?? undefined}
            onSuccess={editingExpense ? handleExpenseUpdated : handleExpenseAdded}
            onCancel={() => { setShowForm(false); setEditingExpense(null); }}
          />
        </div>
      )}

      <ExpenseFilters
        filters={filters}
        categories={categories}
        onFilterChange={handleFilterChange}
      />

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-md bg-gray-100" />
          ))}
        </div>
      ) : (
        <ExpenseList
          expenses={expenses}
          onEdit={(expense) => { setShowForm(false); setEditingExpense(expense as Expense); }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
