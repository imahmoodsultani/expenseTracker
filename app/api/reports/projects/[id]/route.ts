import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { buildCsvResponse } from "@/lib/utils/csv";

type Params = { params: Promise<{ id: string }> };

type ExpenseWithCategory = {
  title: string;
  amount: unknown;
  date: Date;
  description: string | null;
  category: { name: string };
};

type GroupedRow = {
  categoryId: string;
  _sum: { amount: unknown };
  _count: { id: number };
};

type CategoryRow = { id: string; name: string };

export async function GET(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: projectId } = await params;
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if ((project as { userId: string }).userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate") ?? undefined;
  const endDate = searchParams.get("endDate") ?? undefined;
  const exportCsv = searchParams.get("export") === "csv";

  const where = {
    userId: session.user.id,
    projectId,
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
      include: { category: { select: { name: true } } },
      orderBy: { date: "desc" },
    }) as ExpenseWithCategory[];
    const rows = expenses.map((e) => ({
      Title: e.title,
      Amount: Number(e.amount).toFixed(2),
      Date: e.date.toISOString().split("T")[0],
      Category: e.category.name,
      Description: e.description ?? "",
    }));
    const projectRecord = project as { name: string };
    return buildCsvResponse(rows, `project-${projectRecord.name.replace(/\s+/g, "-").toLowerCase()}-report.csv`);
  }

  const grouped = await db.expense.groupBy({
    by: ["categoryId"],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: where as any,
    _sum: { amount: true },
    _count: { id: true },
  }) as unknown as GroupedRow[];

  const categoryIds = grouped.map((g) => g.categoryId);
  const categories = await db.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  }) as CategoryRow[];
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  const totals = grouped.map((g) => ({
    categoryId: g.categoryId,
    categoryName: catMap[g.categoryId] ?? "Unknown",
    total: Number(g._sum.amount ?? 0).toFixed(2),
    count: g._count.id,
  }));

  const grandTotal = totals.reduce((sum: number, t) => sum + Number(t.total), 0).toFixed(2);
  const projectRecord = project as { name: string };

  return NextResponse.json({
    totals,
    grandTotal,
    projectName: projectRecord.name,
    dateRange: { start: startDate ?? null, end: endDate ?? null },
  });
}
