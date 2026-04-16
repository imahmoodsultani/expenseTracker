"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema, type ExpenseFormValues } from "@/lib/schemas/expense.schema";
import CategoryDropdown from "@/components/categories/CategoryDropdown";
import { useEffect } from "react";

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

interface ExpenseFormProps {
  projectId?: string | null;
  expense?: Expense;
  onSuccess: (expense: Expense) => void;
  onCancel: () => void;
}

export default function ExpenseForm({ projectId, expense, onSuccess, onCancel }: ExpenseFormProps) {
  const isEdit = !!expense;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: expense?.title ?? "",
      amount: expense ? String(expense.amount) : "",
      date: expense?.date ? expense.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      categoryId: expense?.categoryId ?? "",
      description: expense?.description ?? "",
      isRecurring: expense?.isRecurring ?? false,
      recurrenceFrequency: expense?.recurrenceFrequency ?? null,
    },
  });

  const isRecurring = watch("isRecurring");

  // Clear frequency when recurring is turned off
  useEffect(() => {
    if (!isRecurring) setValue("recurrenceFrequency", null);
  }, [isRecurring, setValue]);

  async function onSubmit(data: ExpenseFormValues) {
    const endpoint = isEdit
      ? projectId
        ? `/api/projects/${projectId}/expenses/${expense!.id}`
        : `/api/expenses/${expense!.id}`
      : projectId
      ? `/api/projects/${projectId}/expenses`
      : "/api/expenses";

    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      if (result.errors) {
        Object.entries(result.errors).forEach(([field, msgs]) => {
          setError(field as keyof ExpenseFormValues, { message: (msgs as string[])[0] });
        });
      }
      return;
    }

    onSuccess(result);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("title")}
          className={`mt-1 w-full rounded-md border px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Amount <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            {...register("amount")}
            className={`mt-1 w-full rounded-md border px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.amount ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register("date")}
            className={`mt-1 w-full rounded-md border px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.date ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Category <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <CategoryDropdown
            value={watch("categoryId")}
            onChange={(id) => setValue("categoryId", id, { shouldValidate: true })}
            projectId={projectId}
            error={errors.categoryId?.message}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          rows={3}
          {...register("description")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" {...register("isRecurring")} className="rounded border-gray-300" />
          Recurring expense
        </label>
      </div>

      {isRecurring && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Frequency <span className="text-red-500">*</span>
          </label>
          <select
            {...register("recurrenceFrequency")}
            className={`mt-1 w-full rounded-md border px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.recurrenceFrequency ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select frequency...</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </select>
          {errors.recurrenceFrequency && (
            <p className="mt-1 text-xs text-red-600">{errors.recurrenceFrequency.message}</p>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : isEdit ? "Update Expense" : "Add Expense"}
        </button>
      </div>
    </form>
  );
}
