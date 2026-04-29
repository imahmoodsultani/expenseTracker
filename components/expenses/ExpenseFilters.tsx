"use client";

interface Category {
  id: number;
  name: string;
}

export interface ExpenseFilterValues {
  search: string;
  category: string;
  startDate: string;
  endDate: string;
}

interface ExpenseFiltersProps {
  filters: ExpenseFilterValues;
  categories: Category[];
  onFilterChange: (filters: ExpenseFilterValues) => void;
}

export default function ExpenseFilters({ filters, categories, onFilterChange }: ExpenseFiltersProps) {
  function update(key: keyof ExpenseFilterValues, value: string) {
    onFilterChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
      <input
        type="text"
        placeholder="Search expenses..."
        value={filters.search}
        onChange={(e) => update("search", e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto"
      />

      <select
        value={filters.category}
        onChange={(e) => update("category", e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto"
      >
        <option value="">All categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <div className="flex gap-2">
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => update("startDate", e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:flex-none"
        />

        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => update("endDate", e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:flex-none"
        />
      </div>

      {(filters.search || filters.category || filters.startDate || filters.endDate) && (
        <button
          onClick={() => onFilterChange({ search: "", category: "", startDate: "", endDate: "" })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 sm:w-auto"
        >
          Clear
        </button>
      )}
    </div>
  );
}
