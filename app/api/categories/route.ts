import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { categorySchema } from "@/lib/schemas/category.schema";
const CategoryType = { PREDEFINED: "PREDEFINED", CUSTOM: "CUSTOM" } as const;
const CategoryScope = { GLOBAL: "GLOBAL", PROJECT: "PROJECT" } as const;

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectIdRaw = searchParams.get("projectId");
  const projectId = projectIdRaw ? parseInt(projectIdRaw, 10) : null;

  const categories = await db.category.findMany({
    where: {
      isDeleted: false,
      OR: [
        // Always include predefined categories
        { type: CategoryType.PREDEFINED },
        // Always include user's global custom categories
        { type: CategoryType.CUSTOM, scope: CategoryScope.GLOBAL, userId: session.user.id },
        // Include project-scoped categories if projectId is provided
        ...(projectId
          ? [{ type: CategoryType.CUSTOM, scope: CategoryScope.PROJECT, projectId }]
          : []),
      ],
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { name, projectId: projectIdStr } = parsed.data;
  const projectId = projectIdStr ? parseInt(projectIdStr, 10) : null;
  const scope = projectId ? CategoryScope.PROJECT : CategoryScope.GLOBAL;

  // Enforce name uniqueness within scope per user
  const duplicate = await db.category.findFirst({
    where: {
      name: { equals: name },
      type: CategoryType.CUSTOM,
      scope,
      userId: session.user.id,
      isDeleted: false,
      ...(projectId ? { projectId } : { projectId: null }),
    },
  });

  if (duplicate) {
    return NextResponse.json(
      { errors: { name: ["A category with this name already exists"] } },
      { status: 422 }
    );
  }

  const category = await db.category.create({
    data: {
      name,
      type: CategoryType.CUSTOM,
      scope,
      userId: session.user.id,
      projectId: projectId ?? null,
    },
  });

  return NextResponse.json(category, { status: 201 });
}
