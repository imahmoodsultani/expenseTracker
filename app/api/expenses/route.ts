import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { expenseSchema } from "@/lib/schemas/expense.schema";
import { getNextDueDate } from "@/lib/utils/recurrence";
type RecurrenceFrequency = "WEEKLY" | "MONTHLY" | "YEARLY";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const startDate = searchParams.get("startDate") ?? undefined;
  const endDate = searchParams.get("endDate") ?? undefined;

  const expenses = await db.expense.findMany({
    where: {
      userId: session.user.id,
      projectId: null,
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      }),
      ...(category && { categoryId: category }),
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

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = expenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { title, amount, date, categoryId, description, isRecurring, recurrenceFrequency } = parsed.data;

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
      projectId: null,
      isRecurring: isRecurring ?? false,
      recurrenceFrequency: (recurrenceFrequency as RecurrenceFrequency) ?? null,
      nextDueDate,
    },
    include: { category: { select: { id: true, name: true } } },
  });

  return NextResponse.json(expense, { status: 201 });
}
