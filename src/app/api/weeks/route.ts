import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { TrainingType } from "@prisma/client";
import { WeekType } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { getIsoWeek } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z.object({
  date: z.string().datetime(),
  type: z.nativeEnum(WeekType),
});

function mondayFromIsoWeek(year: number, week: number) {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1 + (week - 1) * 7);
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawDate = searchParams.get("date");
  const current = getIsoWeek(rawDate ? new Date(rawDate) : new Date());

  try {
    const week = await prisma.weekProfile.upsert({
      where: { isoYear_isoWeek: { isoYear: current.year, isoWeek: current.week } },
      update: {},
      create: {
        isoYear: current.year,
        isoWeek: current.week,
        type: WeekType.STANDARD,
        label: `Semaine ${current.week}`,
      },
    });

    return NextResponse.json({
      week,
      supportedTypes: ["standard", "stage"],
    });
  } catch {
    return NextResponse.json({
      week: { isoYear: current.year, isoWeek: current.week, type: "STANDARD" },
      supportedTypes: ["standard", "stage"],
    });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const actorId = session.user.id;

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const date = new Date(parsed.data.date);
  const iso = getIsoWeek(date);

  const week = await prisma.weekProfile.upsert({
    where: { isoYear_isoWeek: { isoYear: iso.year, isoWeek: iso.week } },
    update: { type: parsed.data.type },
    create: {
      isoYear: iso.year,
      isoWeek: iso.week,
      type: parsed.data.type,
      label: `Semaine ${iso.week}`,
    },
  });

  let inheritedCount = 0;

  if (parsed.data.type === WeekType.STANDARD) {
    const existingCount = await prisma.training.count({
      where: { weekProfileId: week.id, status: { not: "cancelled" } },
    });

    if (existingCount === 0) {
      const candidates = await prisma.weekProfile.findMany({
        where: { type: WeekType.STANDARD },
        orderBy: [{ isoYear: "desc" }, { isoWeek: "desc" }],
        include: {
          trainings: {
            where: { status: { not: "cancelled" } },
            orderBy: [{ date: "asc" }, { startTime: "asc" }],
          },
        },
      });

      const sourceWeek = candidates.find(
        (candidate) =>
          candidate.id !== week.id &&
          (candidate.isoYear < iso.year ||
            (candidate.isoYear === iso.year && candidate.isoWeek < iso.week)),
      );

      if (sourceWeek && sourceWeek.trainings.length > 0) {
        const monday = mondayFromIsoWeek(iso.year, iso.week);

        const data = sourceWeek.trainings.map((training) => {
          const weekday = (training.date.getUTCDay() + 6) % 7;
          const targetDate = new Date(monday);
          targetDate.setUTCDate(monday.getUTCDate() + weekday);

          return {
            weekProfileId: week.id,
            sectionId: training.sectionId,
            title: training.title,
            type: TrainingType.HEBDOMADAIRE,
            date: targetDate,
            startTime: training.startTime,
            endTime: training.endTime,
            location: training.location,
            coachId: training.coachId,
            notes: training.notes,
            source: "inherited",
            status: "draft",
            updatedById: actorId,
          };
        });

        const created = await prisma.training.createMany({
          data,
          skipDuplicates: true,
        });

        inheritedCount = created.count;
      }
    }
  }

  return NextResponse.json({
    week,
    inheritedCount,
  });
}
