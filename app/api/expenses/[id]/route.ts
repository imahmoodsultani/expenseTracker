import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { expenseBaseSchema } from "@/lib/schemas/expense.schema";
import { getNextDueDate } from "@/lib/utils/recurrence";

type RecurrenceFrequency = "WEEKLY" | "MONTHLY" | "YEARLY";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const expense = await db.expense.findUnique({
    where: { id },
    include: { category: { select: { id: true, name: true } } },
  });
  if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (expense.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(expense);
}

export async function PUT(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const existing = await db.expense.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = expenseBaseSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { title, amount, date, categoryId: categoryIdStr, description, isRecurring, recurrenceFrequency } = parsed.data;
  const categoryId = categoryIdStr ? parseInt(categoryIdStr, 10) : undefined;
  const expenseDate = date ? new Date(date) : undefined;
  const newIsRecurring = isRecurring ?? existing.isRecurring;
  const newFrequency = (recurrenceFrequency as RecurrenceFrequency) ?? existing.recurrenceFrequency;
  const nextDueDate =
    newIsRecurring && newFrequency && expenseDate
      ? getNextDueDate(expenseDate, newFrequency)
      : newIsRecurring && newFrequency && existing.nextDueDate
      ? existing.nextDueDate
      : null;

  const updated = await db.expense.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(amount && { amount }),
      ...(expenseDate && { date: expenseDate }),
      ...(categoryId && { categoryId }),
      description: description !== undefined ? description ?? null : undefined,
      isRecurring: newIsRecurring,
      recurrenceFrequency: newFrequency ?? null,
      nextDueDate,
    },
    include: { category: { select: { id: true, name: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const existing = await db.expense.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.expense.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
