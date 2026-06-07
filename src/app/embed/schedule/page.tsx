import Link from "next/link";
import { CLUB_NAME } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { toLabelTitle } from "@/lib/training-mapper";

export const metadata = {
  title: "Agenda iframe",
};

export const dynamic = "force-dynamic";

type EmbedPageProps = {
  searchParams: Promise<{ section?: string }>;
};

export default async function EmbedSchedulePage({ searchParams }: EmbedPageProps) {
  const params = await searchParams;
  const section = params.section;

  const trainings = await prisma.training.findMany({
    where: {
      section: section ? { name: section } : undefined,
      status: { not: "cancelled" },
    },
    include: {
      section: { select: { name: true } },
      coach: { select: { name: true } },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return (
    <main className="min-h-screen bg-white p-4 text-slate-900">
      <header className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
        <h1 className="text-lg font-bold">Agenda Club - Version iframe</h1>
        <span className="text-xs text-slate-500">{CLUB_NAME}</span>
      </header>

      <ul className="grid gap-2">
        {trainings.map((training) => (
          <li key={training.id} className="rounded-md border border-slate-200 p-3">
            <p className="text-sm font-semibold">
              {training.section.name} - {toLabelTitle(training.title)}
            </p>
            <p className="text-sm">
              {training.date.toISOString().slice(0, 10)} | {training.startTime} - {training.endTime}
            </p>
            <p className="text-xs text-slate-600">{training.location} | {training.coach.name}</p>
          </li>
        ))}
      </ul>

      <div className="mt-4 text-right text-xs text-slate-500">
        <Link href="/">Ouvrir la version complète</Link>
      </div>
    </main>
  );
}
