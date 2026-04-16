import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getNextDueDate } from "@/lib/utils/recurrence";
type RecurrenceFrequency = "WEEKLY" | "MONTHLY" | "YEARLY";

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = await db.expense.findMany({
    where: {
      isRecurring: true,
      nextDueDate: { lte: today },
      OR: [
        { recurrenceLastGeneratedDate: null },
        { recurrenceLastGeneratedDate: { lt: today } },
      ],
    },
  });

  let generated = 0;
  const errors: string[] = [];

  for (const parent of due) {
    try {
      await db.expense.create({
        data: {
          title: parent.title,
          amount: parent.amount,
          date: parent.nextDueDate!,
          description: parent.description,
          categoryId: parent.categoryId,
          userId: parent.userId,
          projectId: parent.projectId,
          isRecurring: false,
          recurrenceParentId: parent.id,
        },
      });

      await db.expense.update({
        where: { id: parent.id },
        data: {
          nextDueDate: getNextDueDate(
            parent.nextDueDate!,
            parent.recurrenceFrequency as RecurrenceFrequency
          ),
          recurrenceLastGeneratedDate: today,
        },
      });

      console.log(JSON.stringify({ event: "cron.expense_generated", parentId: parent.id, userId: parent.userId, title: parent.title }));
      generated++;
    } catch (err) {
      const msg = `Failed for expense ${parent.id}: ${String(err)}`;
      errors.push(msg);
      console.error(JSON.stringify({ event: "cron.expense_error", parentId: parent.id, error: String(err) }));
    }
  }

  console.log(JSON.stringify({ event: "cron.run_complete", generated, errorCount: errors.length }));
  return NextResponse.json({ generated, errors });
}
