"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ExpenseFilters, { type ExpenseFilterValues } from "@/components/expenses/ExpenseFilters";
import ExpenseList from "@/components/expenses/ExpenseList";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import CategoryManager from "@/components/categories/CategoryManager";
import Link from "next/link";
import { formatCurrency } from "@/lib/format-currency";

interface Category {
  id: number;
  name: string;
}

interface Expense {
  id: number;
  title: string;
  amount: string | number;
  date: string;
  categoryId: number;
  category: { id: number; name: string };
  description?: string | null;
  isRecurring: boolean;
  recurrenceFrequency?: "WEEKLY" | "MONTHLY" | "YEARLY" | null;
  projectId?: number | null;
}

interface Project {
  id: number;
  name: string;
}

export default function ProjectDetailPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
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
  const [notFound, setNotFound] = useState(false);

  async function fetchExpenses(f: ExpenseFilterValues) {
    const params = new URLSearchParams();
    if (f.search) params.set("search", f.search);
    if (f.category) params.set("category", f.category);
    if (f.startDate) params.set("startDate", f.startDate);
    if (f.endDate) params.set("endDate", f.endDate);
    const res = await fetch(`/api/projects/${projectId}/expenses?${params.toString()}`);
    if (res.status === 404) {
      setNotFound(true);
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setExpenses(data.expenses);
    }
  }

  async function fetchProject() {
    const res = await fetch(`/api/projects/${projectId}`);
    if (res.status === 404 || res.status === 403) {
      setNotFound(true);
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setProject(data);
    }
  }

  async function fetchCategories() {
    const res = await fetch(`/api/categories?projectId=${projectId}`);
    if (res.ok) {
      const data = await res.json();
      setCategories(data.categories);
    }
  }

  useEffect(() => {
    Promise.all([fetchProject(), fetchCategories()]).then(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!notFound) fetchExpenses(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, notFound]);

  function handleExpenseAdded(expense: Expense) {
    setExpenses((prev) => [expense, ...prev]);
    setShowForm(false);
  }

  function handleExpenseUpdated(updated: Expense) {
    setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setEditingExpense(null);
  }

  function handleDelete(id: number) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  if (notFound) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-500">Project not found.</p>
        <Link href="/projects" className="mt-2 text-sm text-blue-600 hover:underline">
          Back to projects
        </Link>
      </div>
    );
  }

  const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/projects" className="hover:text-blue-600">
              Projects
            </Link>
            <span>/</span>
            <span>{loading ? "..." : project?.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{loading ? "..." : project?.name}</h1>
          {!loading && (
            <p className="mt-1 text-sm text-gray-500">
              {expenses.length} expense{expenses.length !== 1 ? "s" : ""} · Total: {formatCurrency(totalAmount)}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Link
            href={`/reports/projects/${projectId}`}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            View Report
          </Link>
          <button
            onClick={() => { setEditingExpense(null); setShowForm(true); }}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Add Expense
          </button>
        </div>
      </div>

      {(showForm || editingExpense) && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            {editingExpense ? "Edit Expense" : "New Expense"}
          </h2>
          <ExpenseForm
            projectId={projectId}
            expense={editingExpense ?? undefined}
            onSuccess={editingExpense ? handleExpenseUpdated : handleExpenseAdded}
            onCancel={() => { setShowForm(false); setEditingExpense(null); }}
          />
        </div>
      )}

      <ExpenseFilters
        filters={filters}
        categories={categories}
        onFilterChange={setFilters}
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

      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-900">Custom Categories</h2>
        <CategoryManager projectId={projectId} />
      </div>
    </div>
  );
}
