"use client";

import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
}

interface CategoryDropdownProps {
  value: string;
  onChange: (id: string) => void;
  projectId?: string | null;
  error?: string;
  disabled?: boolean;
}

export default function CategoryDropdown({ value, onChange, projectId, error, disabled }: CategoryDropdownProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [addError, setAddError] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchCategories() {
    const url = projectId ? `/api/categories?projectId=${projectId}` : "/api/categories";
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setCategories(data.categories);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function handleAddCategory() {
    setAddError("");
    if (!newName.trim()) {
      setAddError("Name is required");
      return;
    }
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), projectId: projectId ?? null }),
    });
    const data = await res.json();
    if (!res.ok) {
      setAddError(data.errors?.name?.[0] ?? "Failed to add category");
      return;
    }
    await fetchCategories();
    onChange(data.id);
    setNewName("");
    setAdding(false);
  }

  if (loading) {
    return <div className="h-10 animate-pulse rounded-md bg-gray-100" />;
  }

  return (
    <div className="space-y-1">
      {!adding ? (
        <select
          value={value}
          onChange={(e) => {
            if (e.target.value === "__add__") {
              setAdding(true);
            } else {
              onChange(e.target.value);
            }
          }}
          disabled={disabled}
          className={`w-full rounded-md border px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select category...</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
          <option value="__add__">+ Add new category...</option>
        </select>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Category name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
            autoFocus
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => { setAdding(false); setNewName(""); setAddError(""); }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      )}
      {(error || addError) && (
        <p className="text-xs text-red-600">{addError || error}</p>
      )}
    </div>
  );
}
