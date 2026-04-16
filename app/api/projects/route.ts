import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { projectSchema } from "@/lib/schemas/project.schema";

type ProjectWithAggregates = {
  id: string;
  name: string;
  createdAt: Date;
  _count: { expenses: number };
  expenses: { amount: unknown }[];
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await db.project.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { expenses: true } },
      expenses: { select: { amount: true } },
    },
  }) as ProjectWithAggregates[];

  const result = projects.map((p) => ({
    id: p.id,
    name: p.name,
    createdAt: p.createdAt,
    expenseCount: p._count.expenses,
    totalAmount: p.expenses
      .reduce((sum: number, e) => sum + Number(e.amount), 0)
      .toFixed(2),
  }));

  return NextResponse.json({ projects: result });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const project = await db.project.create({
    data: { name: parsed.data.name, userId: session.user.id },
  });

  return NextResponse.json(project, { status: 201 });
}
