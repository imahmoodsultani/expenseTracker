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

type DialogState =
  | { step: "idle" }
  | { step: "warning"; project: Project }
  | { step: "verifying"; project: Project };

export default function ProjectList({ projects, onDelete }: ProjectListProps) {
  const [dialog, setDialog] = useState<DialogState>({ step: "idle" });
  const [nameInput, setNameInput] = useState("");
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  function openDelete(project: Project) {
    setNameInput("");
    setError("");
    if (project.expenseCount > 0) {
      setDialog({ step: "warning", project });
    } else {
      setDialog({ step: "verifying", project });
    }
  }

  function closeDialog() {
    setDialog({ step: "idle" });
    setNameInput("");
    setError("");
  }

  function advanceToVerify() {
    if (dialog.step !== "warning") return;
    setNameInput("");
    setError("");
    setDialog({ step: "verifying", project: dialog.project });
  }

  async function handleDelete() {
    if (dialog.step !== "verifying") return;
    const { project } = dialog;
    setIsDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to delete project. Please try again.");
        return;
      }
      onDelete(project.id);
      setDialog({ step: "idle" });
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (projects.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        No projects yet. Create one to get started.
      </p>
    );
  }

  return (
    <>
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
              <button
                onClick={() => openDelete(project)}
                className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Warning dialog — shown when project has expenses */}
      {dialog.step === "warning" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start gap-3">
              <span className="mt-0.5 text-2xl">⚠️</span>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Delete project?</h2>
                <p className="mt-1 text-sm text-gray-600">
                  <strong>&ldquo;{dialog.project.name}&rdquo;</strong> contains{" "}
                  <strong>{dialog.project.expenseCount} expense{dialog.project.expenseCount !== 1 ? "s" : ""}</strong>.
                  Deleting it will permanently remove the project and all its data. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDialog}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                No, keep it
              </button>
              <button
                onClick={advanceToVerify}
                className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                Yes, continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Name verification dialog */}
      {dialog.step === "verifying" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-1 text-base font-semibold text-gray-500">Confirm deletion</h2>
            <p className="mb-4 text-sm text-gray-600">
              Type the project name to confirm:{" "}
              <strong className="font-mono">{dialog.project.name}</strong>
            </p>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                setError("");
              }}
              placeholder="Type project name exactly…"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              autoFocus
            />
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={closeDialog}
                disabled={isDeleting}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={nameInput !== dialog.project.name || isDeleting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isDeleting ? "Deleting…" : "Delete project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
