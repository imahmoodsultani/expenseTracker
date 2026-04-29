import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { buildCsvResponse } from "@/lib/utils/csv";

type ExpenseWithRefs = {
  title: string;
  amount: unknown;
  date: Date;
  description: string | null;
  category: { name: string };
  project: { name: string } | null;
};

type GroupedRow = {
  categoryId: number;
  projectId: number | null;
  _sum: { amount: unknown };
};

type FlatGroupedRow = {
  categoryId: number;
  _sum: { amount: unknown };
  _count: { id: number };
};

type CategoryRow = { id: number; name: string };
type ProjectRow = { id: number; name: string };

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate") ?? undefined;
  const endDate = searchParams.get("endDate") ?? undefined;
  const breakdown = searchParams.get("breakdown") === "true";
  const exportCsv = searchParams.get("export") === "csv";

  const where = {
    userId: session.user.id,
    ...(startDate || endDate
      ? {
          date: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate + "T23:59:59") }),
          },
        }
      : {}),
  };

  if (exportCsv) {
    const expenses = await db.expense.findMany({
      where,
      include: {
        category: { select: { name: true } },
        project: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    }) as ExpenseWithRefs[];
    const rows = expenses.map((e) => ({
      Title: e.title,
      Amount: Number(e.amount).toFixed(2),
      Date: e.date.toISOString().split("T")[0],
      Category: e.category.name,
      Source: e.project ? e.project.name : "General",
      Description: e.description ?? "",
    }));
    return buildCsvResponse(rows, "summary-report.csv");
  }

  if (breakdown) {
    const grouped = await db.expense.groupBy({
      by: ["categoryId", "projectId"],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: where as any,
      _sum: { amount: true },
    }) as unknown as GroupedRow[];

    const categoryIds = Array.from(new Set(grouped.map((g) => g.categoryId)));
    const projectIds = Array.from(
      new Set(grouped.map((g) => g.projectId).filter((id): id is number => id !== null))
    );

    const [categories, projects] = await Promise.all([
      db.category.findMany({ where: { id: { in: categoryIds } }, select: { id: true, name: true } }),
      db.project.findMany({ where: { id: { in: projectIds } }, select: { id: true, name: true } }),
    ]) as [CategoryRow[], ProjectRow[]];

    const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
    const projMap = Object.fromEntries(projects.map((p) => [p.id, p.name]));

    const categoryMap = new Map<
      number,
      { categoryName: string; total: number; sources: { source: string; projectId: number | null; total: string }[] }
    >();

    for (const g of grouped) {
      const catName = catMap[g.categoryId] ?? "Unknown";
      const amount = Number(g._sum.amount ?? 0);
      const source = g.projectId ? (projMap[g.projectId] ?? "Unknown Project") : "General";

      if (!categoryMap.has(g.categoryId)) {
        categoryMap.set(g.categoryId, { categoryName: catName, total: 0, sources: [] });
      }
      const entry = categoryMap.get(g.categoryId)!;
      entry.total += amount;
      entry.sources.push({ source, projectId: g.projectId, total: amount.toFixed(2) });
    }

    const totals = Array.from(categoryMap.values()).map((entry) => ({
      categoryName: entry.categoryName,
      total: entry.total.toFixed(2),
      sources: entry.sources,
    }));

    const grandTotal = totals.reduce((sum: number, t) => sum + Number(t.total), 0).toFixed(2);
    return NextResponse.json({ totals, grandTotal });
  }

  // Flat view
  const grouped = await db.expense.groupBy({
    by: ["categoryId"],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: where as any,
    _sum: { amount: true },
    _count: { id: true },
  }) as unknown as FlatGroupedRow[];

  const categoryIds = grouped.map((g) => g.categoryId);
  const categories = await db.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  }) as CategoryRow[];
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  const totals = grouped.map((g) => ({
    categoryName: catMap[g.categoryId] ?? "Unknown",
    total: Number(g._sum.amount ?? 0).toFixed(2),
    count: g._count.id,
  }));

  const grandTotal = totals.reduce((sum: number, t) => sum + Number(t.total), 0).toFixed(2);
  return NextResponse.json({ totals, grandTotal });
}
