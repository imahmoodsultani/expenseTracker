"use client";

import Link from "next/link";
import { useState } from "react";
import { formatCurrency } from "@/lib/format-currency";

interface Project {
  id: string;
  name: string;
  expenseCount: number;
  totalAmount: string;
}

interface ProjectListProps {
  projects: Project[];
  onDelete: (id: string) => void;
}

export default function ProjectList({ projects, onDelete }: ProjectListProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      onDelete(id);
    }
    setConfirmId(null);
  }

  if (projects.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        No projects yet. Create one to get started.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <div key={project.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-1 text-base font-semibold text-gray-900">{project.name}</h3>
          <p className="text-sm text-gray-500">
            {project.expenseCount} expense{project.expenseCount !== 1 ? "s" : ""}
          </p>
          <p className="mt-1 text-lg font-bold text-gray-900">{formatCurrency(project.totalAmount)}</p>

          <div className="mt-4 flex gap-2">
            <Link
              href={`/projects/${project.id}`}
              className="flex-1 rounded-md bg-blue-600 px-3 py-1.5 text-center text-sm text-white hover:bg-blue-700"
            >
              Open
            </Link>

            {confirmId === project.id ? (
              <div className="flex gap-1">
                <button
                  onClick={() => handleDelete(project.id)}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmId(null)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmId(project.id)}
                className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
