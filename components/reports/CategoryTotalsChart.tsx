"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/format-currency";

interface ChartItem {
  categoryName: string;
  total: number;
}

interface CategoryTotalsChartProps {
  data: ChartItem[];
}

export default function CategoryTotalsChart({ data }: CategoryTotalsChartProps) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">No data to display.</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="categoryName" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(value: number) => [formatCurrency(value), "Total"]} />
        <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
