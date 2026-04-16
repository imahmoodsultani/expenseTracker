"use client";

export interface ReportFilterValues {
  startDate: string;
  endDate: string;
}

interface ReportFiltersProps {
  filters: ReportFilterValues;
  onFilterChange: (filters: ReportFilterValues) => void;
  exportUrl: string;
}

export default function ReportFilters({ filters, onFilterChange, exportUrl }: ReportFiltersProps) {
  function update(key: keyof ReportFilterValues, value: string) {
    onFilterChange({ ...filters, [key]: value });
  }

  const csvHref = (() => {
    const params = new URLSearchParams({ export: "csv" });
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
    return `${exportUrl}?${params.toString()}`;
  })();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm text-gray-600">
        From
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => update("startDate", e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-gray-600">
        To
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => update("endDate", e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>

      <a
        href={csvHref}
        download
        className="ml-auto rounded-md bg-green-600 px-4 py-1.5 text-sm text-white hover:bg-green-700"
      >
        Export CSV
      </a>
    </div>
  );
}
