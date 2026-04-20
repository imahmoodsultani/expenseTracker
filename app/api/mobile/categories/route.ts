import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getMobileUser } from "@/lib/mobile-jwt";

export async function GET(req: Request) {
  const user = await getMobileUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  const categories = await db.category.findMany({
    where: {
      isDeleted: false,
      OR: [
        { scope: "GLOBAL" },
        { scope: "PROJECT", projectId: projectId ?? undefined },
        { userId: user.id },
      ],
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(categories);
}
