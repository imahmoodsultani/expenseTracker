import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { expenseSchema } from "@/lib/schemas/expense.schema";
import { getNextDueDate } from "@/lib/utils/recurrence";
const CategoryType = { PREDEFINED: "PREDEFINED", CUSTOM: "CUSTOM" } as const;
const CategoryScope = { GLOBAL: "GLOBAL", PROJECT: "PROJECT" } as const;
type RecurrenceFrequency = "WEEKLY" | "MONTHLY" | "YEARLY";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: rawId } = await params;
  const projectId = parseInt(rawId, 10);
  if (isNaN(projectId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (project.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const categoryRaw = searchParams.get("category");
  const categoryId = categoryRaw ? parseInt(categoryRaw, 10) : undefined;
  const startDate = searchParams.get("startDate") ?? undefined;
  const endDate = searchParams.get("endDate") ?? undefined;

  const expenses = await db.expense.findMany({
    where: {
      projectId,
      userId: session.user.id,
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(startDate || endDate
        ? {
            date: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate + "T23:59:59") }),
            },
          }
        : {}),
    },
    include: { category: { select: { id: true, name: true } } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ expenses, total: expenses.length });
}

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: rawId } = await params;
  const projectId = parseInt(rawId, 10);
  if (isNaN(projectId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (project.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = expenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { title, amount, date, categoryId: categoryIdStr, description, isRecurring, recurrenceFrequency } = parsed.data;
  const categoryId = parseInt(categoryIdStr, 10);

  // Validate category is accessible within this project
  const category = await db.category.findUnique({ where: { id: categoryId } });
  if (!category) return NextResponse.json({ errors: { categoryId: ["Category not found"] } }, { status: 422 });
  const isAccessible =
    category.type === CategoryType.PREDEFINED ||
    (category.type === CategoryType.CUSTOM && category.scope === CategoryScope.GLOBAL && category.userId === session.user.id) ||
    (category.type === CategoryType.CUSTOM && category.scope === CategoryScope.PROJECT && category.projectId === projectId);
  if (!isAccessible) return NextResponse.json({ errors: { categoryId: ["Category not accessible"] } }, { status: 422 });

  const expenseDate = new Date(date);
  const nextDueDate =
    isRecurring && recurrenceFrequency
      ? getNextDueDate(expenseDate, recurrenceFrequency as RecurrenceFrequency)
      : null;

  const expense = await db.expense.create({
    data: {
      title,
      amount,
      date: expenseDate,
      categoryId,
      description: description ?? null,
      userId: session.user.id,
      projectId,
      isRecurring: isRecurring ?? false,
      recurrenceFrequency: (recurrenceFrequency as RecurrenceFrequency) ?? null,
      nextDueDate,
    },
    include: { category: { select: { id: true, name: true } } },
  });

  return NextResponse.json(expense, { status: 201 });
}
