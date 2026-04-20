import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getMobileUser } from "@/lib/mobile-jwt";

const createSchema = z.object({ name: z.string().min(1) });

export async function GET(req: Request) {
  const user = await getMobileUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await db.project.findMany({
    where: { userId: user.id },
    include: { _count: { select: { expenses: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const user = await getMobileUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const project = await db.project.create({
    data: { name: parsed.data.name, userId: user.id },
    include: { _count: { select: { expenses: true } } },
  });

  return NextResponse.json(project, { status: 201 });
}
