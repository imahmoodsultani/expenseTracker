import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getMobileUser } from "@/lib/mobile-jwt";

const createSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  date: z.string(),
  categoryId: z.string(),
  projectId: z.string().optional(),
  description: z.string().optional(),
});

export async function GET(req: Request) {
  const user = await getMobileUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const limit = parseInt(searchParams.get("limit") ?? "50");

  const expenses = await db.expense.findMany({
    where: { userId: user.id, ...(projectId ? { projectId } : {}) },
    include: { category: true, project: true },
    orderBy: { date: "desc" },
    take: limit,
  });

  return NextResponse.json(expenses);
}

export async function POST(req: Request) {
  const user = await getMobileUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 });
  }

  const expense = await db.expense.create({
    data: {
      ...parsed.data,
      amount: parsed.data.amount,
      date: new Date(parsed.data.date),
      userId: user.id,
    },
    include: { category: true, project: true },
  });

  return NextResponse.json(expense, { status: 201 });
}
