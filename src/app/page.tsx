import Link from "next/link";
import { getServerSession } from "next-auth";
import WeeklyCalendar from "@/components/weekly-calendar";
import { authOptions } from "@/lib/auth";
import { CLUB_NAME } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { sortSections } from "@/lib/sections";
import { toLabelTitle, toLabelType } from "@/lib/training-mapper";
import SignOutButton from "@/components/sign-out-button";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const canManage = session?.user?.role === "coach" || session?.user?.role === "admin";
  const isCoach = session?.user?.role === "coach";

  const [rawSections, trainings, users] = await Promise.all([
    prisma.section
      .findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, code: true, name: true },
      })
      .catch(() => []),
    prisma.training
      .findMany({
        where: isCoach && session?.user?.id ? { coachId: session.user.id } : undefined,
        include: {
          section: { select: { name: true } },
          coach: { select: { name: true } },
        },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
        take: 100,
      })
      .catch(() => []),
    canManage
      ? prisma.user
          .findMany({
            where: { isActive: true },
            orderBy: { name: "asc" },
            select: { id: true, name: true, role: true },
          })
          .catch(() => [])
      : Promise.resolve([]),
  ]);

  const sections = sortSections(rawSections);

  const serializedTrainings = trainings.map((t) => ({
    id: t.id,
    sectionId: t.sectionId,
    coachId: t.coachId,
    section: t.section.name,
    title: toLabelTitle(t.title),
    titleKey: t.title,
    type: toLabelType(t.type),
    typeKey: t.type,
    date: t.date.toISOString(),
    startTime: t.startTime,
    endTime: t.endTime,
    location: t.location,
    coach: t.coach.name,
    notes: t.notes,
    status: t.status,
  }));

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#ecfeff_0%,_#f8fafc_45%,_#ffffff_100%)] px-1 py-3 text-slate-900 md:px-6 md:py-6">
      <section className="mx-auto w-full max-w-none">
        <header className="rounded-xl border border-cyan-100 bg-white/90 p-3 shadow-sm backdrop-blur-sm md:rounded-2xl md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">Planning Club</p>
              <h1 className="mt-2 text-3xl font-bold">{CLUB_NAME}</h1>
            </div>
            {session?.user ? (
              <SignOutButton
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm ring-1 ring-slate-700 transition hover:bg-slate-800"
              />
            ) : (
              <Link
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cyan-700 text-white shadow-sm ring-1 ring-cyan-800 transition hover:bg-cyan-800"
                href="/login"
                aria-label="Se connecter"
                title="Se connecter"
              >
                <span className="material-symbols-rounded text-[20px] leading-none" aria-hidden="true">
                  login
                </span>
              </Link>
            )}
          </div>
        </header>

        <section className="mt-3 grid gap-2 rounded-xl border border-slate-200 bg-white p-1 shadow-sm md:mt-6 md:gap-4 md:rounded-2xl md:p-4">
          <WeeklyCalendar
            initialSections={sections}
            initialTrainings={serializedTrainings}
            canManage={canManage}
            currentUser={
              session?.user?.id && session?.user?.role
                ? { id: session.user.id, role: session.user.role }
                : undefined
            }
            users={users.map((user) => ({
              id: user.id,
              name: user.name,
              role: user.role,
            }))}
          />
        </section>
      </section>
    </main>
  );
}
