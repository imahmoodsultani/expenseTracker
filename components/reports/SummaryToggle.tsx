"use client";

interface SummaryToggleProps {
  breakdown: boolean;
  onToggle: (breakdown: boolean) => void;
}

export default function SummaryToggle({ breakdown, onToggle }: SummaryToggleProps) {
  return (
    <div className="inline-flex rounded-md border border-gray-300 bg-white">
      <button
        onClick={() => onToggle(false)}
        className={`rounded-l-md px-4 py-2 text-sm font-medium transition-colors ${
          !breakdown
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        Flat
      </button>
      <button
        onClick={() => onToggle(true)}
        className={`rounded-r-md px-4 py-2 text-sm font-medium transition-colors ${
          breakdown
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        Breakdown
      </button>
    </div>
  );
}
