"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReportFilters, { type ReportFilterValues } from "@/components/reports/ReportFilters";
import CategoryTotalsChart from "@/components/reports/CategoryTotalsChart";
import Link from "next/link";
import { formatCurrency } from "@/lib/format-currency";

interface CategoryTotal {
  categoryId: number;
  categoryName: string;
  total: string;
  count: number;
}

export default function ProjectReportPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [totals, setTotals] = useState<CategoryTotal[]>([]);
  const [grandTotal, setGrandTotal] = useState("0.00");
  const [projectName, setProjectName] = useState("");
  const [filters, setFilters] = useState<ReportFilterValues>({ startDate: "", endDate: "" });
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  async function fetchReport(f: ReportFilterValues) {
    const params = new URLSearchParams();
    if (f.startDate) params.set("startDate", f.startDate);
    if (f.endDate) params.set("endDate", f.endDate);
    const res = await fetch(`/api/reports/projects/${projectId}?${params.toString()}`);
    if (res.status === 404 || res.status === 403) {
      setNotFound(true);
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setTotals(data.totals);
      setGrandTotal(data.grandTotal);
      setProjectName(data.projectName);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchReport(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  if (notFound) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-500">Project not found.</p>
        <Link href="/reports" className="mt-2 text-sm text-blue-600 hover:underline">
          Back to reports
        </Link>
      </div>
    );
  }

  const chartData = totals.map((t) => ({ categoryName: t.categoryName, total: Number(t.total) }));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/reports" className="hover:text-blue-600">Reports</Link>
          <span>/</span>
          <span>{projectName || "..."}</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          {projectName ? `${projectName} — Report` : "Project Report"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">Total: {formatCurrency(grandTotal)}</p>
      </div>

      <ReportFilters
        filters={filters}
        onFilterChange={setFilters}
        exportUrl={`/api/reports/projects/${projectId}`}
      />

      {loading ? (
        <div className="h-72 animate-pulse rounded-lg bg-gray-100" />
      ) : (
        <>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <CategoryTotalsChart data={chartData} />
          </div>

          {totals.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Category</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Count</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {totals.map((row) => (
                    <tr key={row.categoryId}>
                      <td className="px-4 py-3 text-gray-900">{row.categoryName}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-gray-600">{row.count}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(row.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-gray-200">
                  <tr>
                    <td colSpan={2} className="px-4 py-3 font-semibold text-gray-900">Grand Total</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(grandTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
