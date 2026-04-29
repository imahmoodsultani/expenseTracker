"use client";

import { useEffect, useState } from "react";
import ProjectList from "@/components/projects/ProjectList";
import ProjectForm from "@/components/projects/ProjectForm";

interface Project {
  id: number;
  name: string;
  expenseCount: number;
  totalAmount: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/projects");
    if (res.ok) {
      const data = await res.json();
      setProjects(data.projects);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function handleCreated(project: { id: number; name: string }) {
    setProjects((prev) => [{ ...project, expenseCount: 0, totalAmount: "0.00" }, ...prev]);
    setShowForm(false);
  }

  function handleDelete(id: number) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Projects</h1>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Project
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">New Project</h2>
          <ProjectForm onSuccess={handleCreated} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : (
        <ProjectList projects={projects} onDelete={handleDelete} />
      )}
    </div>
  );
}
