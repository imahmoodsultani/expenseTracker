"use client";

interface Category {
  id: string;
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
    <div className="flex flex-wrap gap-3">
      <input
        type="text"
        placeholder="Search expenses..."
        value={filters.search}
        onChange={(e) => update("search", e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <select
        value={filters.category}
        onChange={(e) => update("category", e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={filters.startDate}
        onChange={(e) => update("startDate", e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <input
        type="date"
        value={filters.endDate}
        onChange={(e) => update("endDate", e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {(filters.search || filters.category || filters.startDate || filters.endDate) && (
        <button
          onClick={() => onFilterChange({ search: "", category: "", startDate: "", endDate: "" })}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          Clear
        </button>
      )}
    </div>
  );
}
