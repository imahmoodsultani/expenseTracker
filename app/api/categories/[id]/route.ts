import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
const CategoryType = { PREDEFINED: "PREDEFINED", CUSTOM: "CUSTOM" } as const;

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const category = await db.category.findUnique({ where: { id } });
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (category.type === CategoryType.PREDEFINED) {
    return NextResponse.json({ error: "Predefined categories cannot be deleted" }, { status: 403 });
  }
  if (category.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.category.update({ where: { id }, data: { isDeleted: true } });
  return NextResponse.json({ deleted: true });
}
