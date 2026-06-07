import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isUnknownCitySelectError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes("Unknown field `city`") &&
    error.message.includes("model `Skater`")
  );
}

const updateMemberSchema = z.object({
  firstName: z.string().min(1).max(80).optional(),
  lastName: z.string().min(1).max(80).optional(),
  city: z.string().max(120).optional().or(z.literal("")).nullable(),
  parentEmail: z.string().email().optional().or(z.literal("")).nullable(),
  parentPhone: z.string().max(40).optional().or(z.literal("")).nullable(),
});

async function requireSession() {
  const session = await getServerSession(authOptions);
  return session?.user ? session : null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ membershipId: string }> },
) {
  const session = await requireSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { membershipId } = await params;
  const raw = await request.json();
  const parsed = updateMemberSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const membership = await prisma.skaterSection.findUnique({
    where: { id: membershipId },
    include: { section: { select: { id: true, name: true } } },
  });

  if (!membership) {
    return NextResponse.json({ error: "Membre introuvable." }, { status: 404 });
  }

  const payload = parsed.data;

  let updated: {
    id: string;
    firstName: string;
    lastName: string;
    city: string | null;
    parentEmail: string | null;
    parentPhone: string | null;
  };

  try {
    updated = await prisma.skater.update({
      where: { id: membership.skaterId },
      data: {
        firstName: payload.firstName?.trim(),
        lastName: payload.lastName?.trim(),
        city:
          payload.city === ""
            ? null
            : payload.city === undefined
              ? undefined
              : payload.city,
        parentEmail:
          payload.parentEmail === ""
            ? null
            : payload.parentEmail === undefined
              ? undefined
              : payload.parentEmail,
        parentPhone:
          payload.parentPhone === ""
            ? null
            : payload.parentPhone === undefined
              ? undefined
              : payload.parentPhone,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        city: true,
        parentEmail: true,
        parentPhone: true,
      },
    });
  } catch (error) {
    if (!isUnknownCitySelectError(error)) {
      throw error;
    }

    const fallbackUpdated = await prisma.skater.update({
      where: { id: membership.skaterId },
      data: {
        firstName: payload.firstName?.trim(),
        lastName: payload.lastName?.trim(),
        parentEmail:
          payload.parentEmail === ""
            ? null
            : payload.parentEmail === undefined
              ? undefined
              : payload.parentEmail,
        parentPhone:
          payload.parentPhone === ""
            ? null
            : payload.parentPhone === undefined
              ? undefined
              : payload.parentPhone,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        parentEmail: true,
        parentPhone: true,
      },
    });

    updated = {
      ...fallbackUpdated,
      city: null,
    };
  }

  return NextResponse.json({
    member: {
      membershipId,
      skaterId: updated.id,
      sectionId: membership.section.id,
      sectionName: membership.section.name,
      firstName: updated.firstName,
      lastName: updated.lastName,
      city: updated.city,
      parentEmail: updated.parentEmail,
      parentPhone: updated.parentPhone,
    },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ membershipId: string }> },
) {
  const session = await requireSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { membershipId } = await params;

  await prisma.skaterSection.update({
    where: { id: membershipId },
    data: { endsAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
