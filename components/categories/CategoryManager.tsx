"use client";

import { useEffect, useState } from "react";

interface Category {
  id: number;
  name: string;
  type: "PREDEFINED" | "CUSTOM";
  scope: "GLOBAL" | "PROJECT";
  projectId: number | null;
}

interface CategoryManagerProps {
  projectId?: string | null;
}

export default function CategoryManager({ projectId }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const url = projectId ? `/api/categories?projectId=${projectId}` : "/api/categories";
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setCategories(data.categories);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function handleDelete(id: number) {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
    setConfirmId(null);
  }

  const customCategories = categories.filter((c) => c.type === "CUSTOM");

  if (loading) {
    return <div className="h-20 animate-pulse rounded-md bg-gray-100" />;
  }

  if (customCategories.length === 0) {
    return (
      <p className="text-sm text-gray-500">No custom categories yet.</p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
      {customCategories.map((cat) => (
        <li key={cat.id} className="flex items-center justify-between px-4 py-3">
          <div>
            <span className="text-sm font-medium text-gray-900">{cat.name}</span>
            <span className="ml-2 text-xs text-gray-400">
              {cat.scope === "PROJECT" ? "Project" : "Global"}
            </span>
          </div>

          {confirmId === cat.id ? (
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(cat.id)}
                className="rounded-md bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmId(null)}
                className="rounded-md border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmId(cat.id)}
              className="rounded-md border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
