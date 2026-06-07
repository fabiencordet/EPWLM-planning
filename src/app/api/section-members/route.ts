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

const createMemberSchema = z.object({
  sectionId: z.string().cuid(),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  city: z.string().max(120).optional().or(z.literal("")),
  parentEmail: z.string().email().optional().or(z.literal("")),
  parentPhone: z.string().max(40).optional().or(z.literal("")),
});

async function requireSession() {
  const session = await getServerSession(authOptions);
  return session?.user ? session : null;
}

export async function GET(request: Request) {
  const session = await requireSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sectionId = searchParams.get("sectionId");
  const query = searchParams.get("q")?.trim() ?? "";

  const where = {
    ...(sectionId ? { sectionId } : {}),
    endsAt: null,
    skater: {
      isActive: true,
      ...(query
        ? {
            OR: [
              { firstName: { contains: query, mode: "insensitive" as const } },
              { lastName: { contains: query, mode: "insensitive" as const } },
              { parentPhone: { contains: query, mode: "insensitive" as const } },
              { city: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
  };

  let members: Array<{
    id: string;
    section: { id: string; name: string };
    skater: {
      id: string;
      firstName: string;
      lastName: string;
      city: string | null;
      parentEmail: string | null;
      parentPhone: string | null;
    };
  }> = [];

  try {
    members = await prisma.skaterSection.findMany({
      where,
      include: {
        section: { select: { id: true, name: true } },
        skater: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            city: true,
            parentEmail: true,
            parentPhone: true,
          },
        },
      },
      orderBy: [{ skater: { lastName: "asc" } }, { skater: { firstName: "asc" } }],
    });
  } catch (error) {
    if (!isUnknownCitySelectError(error)) {
      throw error;
    }

    const fallbackWhere = {
      ...(sectionId ? { sectionId } : {}),
      endsAt: null,
      skater: {
        isActive: true,
        ...(query
          ? {
              OR: [
                { firstName: { contains: query, mode: "insensitive" as const } },
                { lastName: { contains: query, mode: "insensitive" as const } },
                { parentPhone: { contains: query, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
    };

    const fallbackMembers = await prisma.skaterSection.findMany({
      where: fallbackWhere,
      include: {
        section: { select: { id: true, name: true } },
        skater: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            parentEmail: true,
            parentPhone: true,
          },
        },
      },
      orderBy: [{ skater: { lastName: "asc" } }, { skater: { firstName: "asc" } }],
    });

    members = fallbackMembers.map((membership) => ({
      ...membership,
      skater: {
        ...membership.skater,
        city: null,
      },
    }));
  }

  return NextResponse.json({
    members: members.map((membership) => ({
      membershipId: membership.id,
      skaterId: membership.skater.id,
      sectionId: membership.section.id,
      sectionName: membership.section.name,
      firstName: membership.skater.firstName,
      lastName: membership.skater.lastName,
      city: membership.skater.city,
      parentEmail: membership.skater.parentEmail,
      parentPhone: membership.skater.parentPhone,
    })),
  });
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await request.json();
  const parsed = createMemberSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;
  const city = payload.city || null;
  const parentEmail = payload.parentEmail || null;
  const parentPhone = payload.parentPhone || null;

  let skater: {
    id: string;
    firstName: string;
    lastName: string;
    city: string | null;
    parentEmail: string | null;
    parentPhone: string | null;
  };

  try {
    skater = await prisma.skater.create({
      data: {
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        city,
        parentEmail,
        parentPhone,
        isActive: true,
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

    const fallbackSkater = await prisma.skater.create({
      data: {
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        parentEmail,
        parentPhone,
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        parentEmail: true,
        parentPhone: true,
      },
    });

    skater = {
      ...fallbackSkater,
      city: null,
    };
  }

  const membership = await prisma.skaterSection.create({
    data: {
      skaterId: skater.id,
      sectionId: payload.sectionId,
      startsAt: new Date(),
    },
  });

  return NextResponse.json(
    {
      member: {
        membershipId: membership.id,
        skaterId: skater.id,
        sectionId: payload.sectionId,
        sectionName: "",
        firstName: skater.firstName,
        lastName: skater.lastName,
        city: skater.city,
        parentEmail: skater.parentEmail,
        parentPhone: skater.parentPhone,
      },
    },
    { status: 201 },
  );
}
