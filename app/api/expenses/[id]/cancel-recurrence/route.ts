import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const existing = await db.expense.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updated = await db.expense.update({
    where: { id },
    data: {
      isRecurring: false,
      recurrenceFrequency: null,
      nextDueDate: null,
      recurrenceLastGeneratedDate: null,
    },
  });

  return NextResponse.json({
    id: updated.id,
    isRecurring: updated.isRecurring,
    nextDueDate: updated.nextDueDate,
  });
}
