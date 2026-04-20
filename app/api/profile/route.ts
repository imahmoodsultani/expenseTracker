import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const profileSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    email: z.string().email().optional(),
    phoneNumber: z.string().max(30).optional(),
    address: z.string().max(300).optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8).optional(),
  })
  .refine(
    (data) => {
      // If either password field is provided, both must be
      const hasCurrent = !!data.currentPassword;
      const hasNew = !!data.newPassword;
      return hasCurrent === hasNew;
    },
    { message: "Both currentPassword and newPassword are required to change password" }
  );

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { currentPassword, newPassword, ...profileFields } = parsed.data;

  // Resolve update data
  const updateData: Record<string, unknown> = {};
  if (profileFields.name !== undefined) updateData.name = profileFields.name;
  if (profileFields.email !== undefined) updateData.email = profileFields.email;
  if (profileFields.phoneNumber !== undefined) updateData.phoneNumber = profileFields.phoneNumber;
  if (profileFields.address !== undefined) updateData.address = profileFields.address;

  // Handle password change
  if (currentPassword && newPassword) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    updateData.password = await bcrypt.hash(newPassword, 10);
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    const updated = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        address: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Email address is already in use" },
        { status: 409 }
      );
    }
    throw err;
  }
}
