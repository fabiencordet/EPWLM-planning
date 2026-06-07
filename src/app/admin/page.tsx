import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminBackofficeTabs from "@/components/admin-backoffice-tabs";
import { prisma } from "@/lib/prisma";
import { sortSections } from "@/lib/sections";
import { toLabelTitle, toLabelType } from "@/lib/training-mapper";
import { getIsoWeek } from "@/lib/date";
import SignOutButton from "@/components/sign-out-button";
import { WeekType } from "@prisma/client";

function mondayOfCurrentWeek() {
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export const metadata = {
  title: "Back-office planning",
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const weekStart = mondayOfCurrentWeek();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  const iso = getIsoWeek(weekStart);

  const [rawSections, users, trainings, weekProfile] = await Promise.all([
    prisma.section.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    }),
    prisma.user.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, role: true, email: true },
    }),
    prisma.training.findMany({
      where: {
        date: { gte: weekStart, lte: weekEnd },
        status: { not: "cancelled" },
      },
      include: {
        section: { select: { name: true } },
        coach: { select: { name: true } },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }),
    prisma.weekProfile.upsert({
      where: { isoYear_isoWeek: { isoYear: iso.year, isoWeek: iso.week } },
      update: {},
      create: {
        isoYear: iso.year,
        isoWeek: iso.week,
        type: WeekType.STANDARD,
        label: `Semaine ${iso.week}`,
      },
    }),
  ]);

  const sections = sortSections(rawSections);

  const initialMembers = await prisma.skaterSection.findMany({
    where: {
      endsAt: null,
      skater: { isActive: true },
    },
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

  const normalizedMembers = initialMembers as Array<{
    id: string;
    section: { id: string; name: string };
    skater: {
      id: string;
      firstName: string;
      lastName: string;
      parentEmail: string | null;
      parentPhone: string | null;
    };
  }>;

  const initialItems = trainings.map((training) => ({
    id: training.id,
    sectionId: training.sectionId,
    section: training.section.name,
    coachId: training.coachId,
    coach: training.coach.name,
    title: toLabelTitle(training.title),
    titleKey: training.title,
    type: toLabelType(training.type),
    typeKey: training.type,
    date: training.date.toISOString(),
    startTime: training.startTime,
    endTime: training.endTime,
    location: training.location,
    notes: training.notes,
    status: training.status,
  }));

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <section className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Back-office planning</h1>
            <p className="mt-2 text-sm text-slate-300">
              Connecté en tant que {session.user.name} ({session.user.role}).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              className="rounded-md border border-cyan-700 px-3 py-1.5 text-sm font-medium text-cyan-200 transition hover:bg-cyan-950/30"
              href="/"
            >
              Retour agenda public
            </Link>
            <SignOutButton
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-600 text-slate-200 transition hover:bg-slate-800"
            />
          </div>
        </div>

        <AdminBackofficeTabs
          sections={sections}
          users={users}
          initialItems={initialItems}
          initialWeekType={weekProfile.type}
          initialMembers={normalizedMembers.map((membership) => ({
            membershipId: membership.id,
            skaterId: membership.skater.id,
            sectionId: membership.section.id,
            sectionName: membership.section.name,
            firstName: membership.skater.firstName,
            lastName: membership.skater.lastName,
            city: null,
            parentEmail: membership.skater.parentEmail,
            parentPhone: membership.skater.parentPhone,
          }))}
        />

      </section>
    </main>
  );
}
