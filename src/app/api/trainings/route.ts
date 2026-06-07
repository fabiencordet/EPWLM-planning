import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Prisma, TrainingTitle, TrainingType, WeekType } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getIsoWeek, weekRangeFromDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { toLabelTitle, toLabelType } from "@/lib/training-mapper";

const createTrainingSchema = z.object({
  sectionId: z.string().cuid(),
  title: z.nativeEnum(TrainingTitle),
  type: z.nativeEnum(TrainingType),
  date: z.string().datetime(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  location: z.string().min(2).max(120),
  coachId: z.string().cuid(),
  notes: z.string().max(600).optional(),
  weekType: z.nativeEnum(WeekType).optional(),
});

function serializeTraining(training: {
  id: string;
  sectionId: string;
  coachId: string;
  title: TrainingTitle;
  type: TrainingType;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  notes: string | null;
  status: string;
  section: { name: string };
  coach: { name: string };
}) {
  return {
    id: training.id,
    sectionId: training.sectionId,
    coachId: training.coachId,
    section: training.section.name,
    title: toLabelTitle(training.title),
    titleKey: training.title,
    type: toLabelType(training.type),
    typeKey: training.type,
    date: training.date.toISOString(),
    startTime: training.startTime,
    endTime: training.endTime,
    location: training.location,
    coach: training.coach.name,
    notes: training.notes,
    status: training.status,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sectionIds = searchParams.getAll("sectionId").filter(Boolean);
  const coachIds = searchParams.getAll("coachId").filter(Boolean);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  let dateFilter: { gte: Date; lte: Date } | undefined;
  if (start && end) {
    dateFilter = { gte: new Date(start), lte: new Date(end) };
  } else {
    const { start: weekStart, end: weekEnd } = weekRangeFromDate(new Date().toISOString());
    dateFilter = { gte: weekStart, lte: weekEnd };
  }

  try {
    const trainings = await prisma.training.findMany({
      where: {
        ...(sectionIds.length > 0 ? { sectionId: { in: sectionIds } } : {}),
        ...(coachIds.length > 0 ? { coachId: { in: coachIds } } : {}),
        date: dateFilter,
        status: { not: "cancelled" },
      },
      include: {
        section: { select: { name: true } },
        coach: { select: { name: true } },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json({ trainings: trainings.map(serializeTraining) });
  } catch {
    return NextResponse.json({ trainings: [] });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createTrainingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;
  if (payload.startTime >= payload.endTime) {
    return NextResponse.json(
      { error: "L'heure de fin doit etre superieure a l'heure de debut." },
      { status: 400 },
    );
  }

  const date = new Date(payload.date);
  const iso = getIsoWeek(date);

  try {
    const weekProfile = await prisma.weekProfile.upsert({
      where: { isoYear_isoWeek: { isoYear: iso.year, isoWeek: iso.week } },
      update: {
        type: payload.weekType ?? undefined,
      },
      create: {
        isoYear: iso.year,
        isoWeek: iso.week,
        type: payload.weekType ?? WeekType.STANDARD,
        label: `Semaine ${iso.week}`,
      },
    });

    const created = await prisma.training.create({
      data: {
        weekProfileId: weekProfile.id,
        sectionId: payload.sectionId,
        title: payload.title,
        type: payload.type,
        date,
        startTime: payload.startTime,
        endTime: payload.endTime,
        location: payload.location,
        coachId: payload.coachId,
        notes: payload.notes,
        status: "draft",
        updatedById: session.user.id,
      },
    });

    return NextResponse.json({ training: created }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        {
          error:
            "Un creneau identique existe deja (section, date, horaire et lieu). Modifie au moins une de ces informations.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Erreur serveur lors de la creation du creneau." },
      { status: 500 },
    );
  }
}
