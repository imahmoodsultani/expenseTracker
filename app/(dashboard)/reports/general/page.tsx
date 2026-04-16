"use client";

import { useEffect, useState } from "react";
import ReportFilters, { type ReportFilterValues } from "@/components/reports/ReportFilters";
import CategoryTotalsChart from "@/components/reports/CategoryTotalsChart";
import { formatCurrency } from "@/lib/format-currency";

interface CategoryTotal {
  categoryName: string;
  total: string;
  count: number;
}

export default function GeneralReportPage() {
  const [totals, setTotals] = useState<CategoryTotal[]>([]);
  const [grandTotal, setGrandTotal] = useState("0.00");
  const [filters, setFilters] = useState<ReportFilterValues>({ startDate: "", endDate: "" });
  const [loading, setLoading] = useState(true);

  async function fetchReport(f: ReportFilterValues) {
    const params = new URLSearchParams();
    if (f.startDate) params.set("startDate", f.startDate);
    if (f.endDate) params.set("endDate", f.endDate);
    const res = await fetch(`/api/reports/general?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setTotals(data.totals);
      setGrandTotal(data.grandTotal);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchReport(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const chartData = totals.map((t) => ({ categoryName: t.categoryName, total: Number(t.total) }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">General Expense Report</h1>
        <p className="mt-1 text-sm text-gray-500">Total: {formatCurrency(grandTotal)}</p>
      </div>

      <ReportFilters
        filters={filters}
        onFilterChange={setFilters}
        exportUrl="/api/reports/general"
      />

      {loading ? (
        <div className="h-72 animate-pulse rounded-lg bg-gray-100" />
      ) : (
        <>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <CategoryTotalsChart data={chartData} />
          </div>

          {totals.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white">
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
                    <tr key={row.categoryName}>
                      <td className="px-4 py-3 text-gray-900">{row.categoryName}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{row.count}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(row.total)}</td>
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
