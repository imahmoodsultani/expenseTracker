"use client";

import { useEffect, useState } from "react";
import SummaryToggle from "@/components/reports/SummaryToggle";
import ReportFilters, { type ReportFilterValues } from "@/components/reports/ReportFilters";
import CategoryTotalsChart from "@/components/reports/CategoryTotalsChart";
import { formatCurrency } from "@/lib/format-currency";

interface FlatTotal {
  categoryName: string;
  total: string;
  count: number;
}

interface BreakdownSource {
  source: string;
  projectId: string | null;
  total: string;
}

interface BreakdownTotal {
  categoryName: string;
  total: string;
  sources: BreakdownSource[];
}

export default function SummaryReportPage() {
  const [flatTotals, setFlatTotals] = useState<FlatTotal[]>([]);
  const [breakdownTotals, setBreakdownTotals] = useState<BreakdownTotal[]>([]);
  const [grandTotal, setGrandTotal] = useState("0.00");
  const [breakdown, setBreakdown] = useState(false);
  const [filters, setFilters] = useState<ReportFilterValues>({ startDate: "", endDate: "" });
  const [loading, setLoading] = useState(true);

  async function fetchReport(f: ReportFilterValues, isBreakdown: boolean) {
    setLoading(true);
    const params = new URLSearchParams();
    if (f.startDate) params.set("startDate", f.startDate);
    if (f.endDate) params.set("endDate", f.endDate);
    if (isBreakdown) params.set("breakdown", "true");
    const res = await fetch(`/api/reports/summary?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setGrandTotal(data.grandTotal);
      if (isBreakdown) {
        setBreakdownTotals(data.totals);
      } else {
        setFlatTotals(data.totals);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchReport(filters, breakdown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, breakdown]);

  const chartData = breakdown
    ? breakdownTotals.map((t) => ({ categoryName: t.categoryName, total: Number(t.total) }))
    : flatTotals.map((t) => ({ categoryName: t.categoryName, total: Number(t.total) }));

  // Build export URL — summary CSV always exports flat individual rows
  const csvParams = new URLSearchParams({ export: "csv" });
  if (filters.startDate) csvParams.set("startDate", filters.startDate);
  if (filters.endDate) csvParams.set("endDate", filters.endDate);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overall Summary</h1>
        <p className="mt-1 text-sm text-gray-500">Total across all sources: {formatCurrency(grandTotal)}</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <SummaryToggle breakdown={breakdown} onToggle={setBreakdown} />
        <ReportFilters
          filters={filters}
          onFilterChange={setFilters}
          exportUrl="/api/reports/summary"
        />
      </div>

      {loading ? (
        <div className="h-72 animate-pulse rounded-lg bg-gray-100" />
      ) : (
        <>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <CategoryTotalsChart data={chartData} />
          </div>

          {!breakdown && flatTotals.length > 0 && (
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
                  {flatTotals.map((row) => (
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

          {breakdown && breakdownTotals.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Category / Source</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {breakdownTotals.map((row) => (
                    <>
                      <tr key={row.categoryName} className="bg-gray-50">
                        <td className="px-4 py-2 font-semibold text-gray-900">{row.categoryName}</td>
                        <td className="px-4 py-2 text-right font-semibold text-gray-900">{formatCurrency(row.total)}</td>
                      </tr>
                      {row.sources.map((src) => (
                        <tr key={`${row.categoryName}-${src.source}`} className="bg-white">
                          <td className="py-2 pl-10 pr-4 text-gray-600">↳ {src.source}</td>
                          <td className="px-4 py-2 text-right text-gray-600">{formatCurrency(src.total)}</td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
                <tfoot className="border-t border-gray-200">
                  <tr>
                    <td className="px-4 py-3 font-semibold text-gray-900">Grand Total</td>
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
