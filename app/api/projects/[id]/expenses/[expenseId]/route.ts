import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { expenseBaseSchema } from "@/lib/schemas/expense.schema";

type Params = { params: Promise<{ id: string; expenseId: string }> };

export async function PUT(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: rawId, expenseId: rawExpenseId } = await params;
  const projectId = parseInt(rawId, 10);
  const expenseId = parseInt(rawExpenseId, 10);
  if (isNaN(projectId) || isNaN(expenseId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const expense = await db.expense.findUnique({ where: { id: expenseId } });
  if (!expense || expense.projectId !== projectId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (expense.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = expenseBaseSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { title, amount, date, categoryId: categoryIdStr, description } = parsed.data;
  const categoryId = categoryIdStr ? parseInt(categoryIdStr, 10) : undefined;

  const updated = await db.expense.update({
    where: { id: expenseId },
    data: {
      ...(title && { title }),
      ...(amount && { amount }),
      ...(date && { date: new Date(date) }),
      ...(categoryId && { categoryId }),
      description: description !== undefined ? description ?? null : undefined,
    },
    include: { category: { select: { id: true, name: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: rawId, expenseId: rawExpenseId } = await params;
  const projectId = parseInt(rawId, 10);
  const expenseId = parseInt(rawExpenseId, 10);
  if (isNaN(projectId) || isNaN(expenseId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const expense = await db.expense.findUnique({ where: { id: expenseId } });
  if (!expense || expense.projectId !== projectId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (expense.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.expense.delete({ where: { id: expenseId } });
  return NextResponse.json({ deleted: true });
}
