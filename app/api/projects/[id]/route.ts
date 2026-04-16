import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await db.project.findUnique({ where: { id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (project.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(project);
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await db.project.findUnique({ where: { id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (project.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Cascade handled by Prisma schema (onDelete: Cascade on expenses + categories)
  await db.project.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
