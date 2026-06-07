import { PrismaClient, TrainingTitle, TrainingType, WeekType } from "@prisma/client";

const prisma = new PrismaClient();

function getIsoWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

type Slot = {
  sectionCode: string;
  day: string;
  title: TrainingTitle;
  start: string;
  end: string;
  note?: string;
};

type WeekDef = {
  key: string;
  label: string;
  slots: Slot[];
};

function dateIso(day: string): Date {
  return new Date(`${day}T00:00:00.000Z`);
}

async function ensureBaseData() {
  const sections = [
    { code: "LOISIR", name: "Loisirs" },
    { code: "ADULT_ART", name: "Artistique Adultes" },
    { code: "ART_NAT", name: "Artistique Nationaux" },
    { code: "ART_REG", name: "Artistique Régionaux" },
    { code: "ADULT_DANSE", name: "Danse Adultes" },
    { code: "DANSE_NAT", name: "Danse Nationaux" },
    { code: "DANSE_REG", name: "Danse Régionaux" },
    { code: "SYNCHRO_DETECT", name: "Synchro Détection" },
    { code: "SYNCHRO_NOV_B", name: "Synchro Novices B" },
    { code: "SYNCHRO_JUV", name: "Synchro Juvéniles" },
  ] as const;

  const sectionMap = new Map<string, string>();
  for (const section of sections) {
    const created = await prisma.section.upsert({
      where: { code: section.code },
      update: { name: section.name, isActive: true },
      create: { code: section.code, name: section.name, isActive: true },
    });
    sectionMap.set(section.code, created.id);
  }

  const coaches = await prisma.user.findMany({
    where: {
      name: {
        in: ["Deborah Wattelier", "Camille Zouita", "Angela Tamburrino"],
      },
    },
    select: { id: true, name: true },
  });

  const coachByName = new Map(coaches.map((c) => [c.name, c.id]));
  const deborahId = coachByName.get("Deborah Wattelier");
  const camilleId = coachByName.get("Camille Zouita");
  const angelaId = coachByName.get("Angela Tamburrino");

  if (!deborahId || !camilleId || !angelaId) {
    throw new Error("Coachs introuvables. Lance d'abord npm run db:seed.");
  }

  return { sectionMap, deborahId, camilleId, angelaId };
}

function coachForSectionCode(
  code: string,
  ids: { deborahId: string; camilleId: string; angelaId: string },
) {
  if (code.startsWith("DANSE")) return ids.deborahId;
  if (code.startsWith("ART")) return ids.camilleId;
  return ids.angelaId;
}

function locationForTitle(title: TrainingTitle) {
  return title === TrainingTitle.GLACE ? "Patinoire (stage)" : "Salle Sol (stage)";
}

const weeks: WeekDef[] = [
  {
    key: "S1",
    label: "Stage été 2026 - Semaine 1",
    slots: [
      { sectionCode: "DANSE_NAT", day: "2026-06-01", title: TrainingTitle.GLACE, start: "19:00", end: "20:15" },
      { sectionCode: "DANSE_NAT", day: "2026-06-02", title: TrainingTitle.GLACE, start: "16:15", end: "17:15" },
      { sectionCode: "DANSE_NAT", day: "2026-06-03", title: TrainingTitle.GLACE, start: "10:15", end: "12:15" },
      { sectionCode: "DANSE_NAT", day: "2026-06-04", title: TrainingTitle.GLACE, start: "16:15", end: "18:15" },
      { sectionCode: "DANSE_NAT", day: "2026-06-05", title: TrainingTitle.GLACE, start: "06:40", end: "08:00" },
      { sectionCode: "DANSE_NAT", day: "2026-06-06", title: TrainingTitle.GLACE, start: "06:40", end: "08:05" },
      { sectionCode: "DANSE_NAT", day: "2026-06-01", title: TrainingTitle.SOL, start: "18:00", end: "18:45" },
      { sectionCode: "DANSE_NAT", day: "2026-06-04", title: TrainingTitle.SOL, start: "14:30", end: "15:15" },

      { sectionCode: "DANSE_REG", day: "2026-06-02", title: TrainingTitle.GLACE, start: "17:15", end: "18:15" },
      { sectionCode: "DANSE_REG", day: "2026-06-03", title: TrainingTitle.GLACE, start: "10:15", end: "12:15" },
      { sectionCode: "DANSE_REG", day: "2026-06-04", title: TrainingTitle.GLACE, start: "16:15", end: "18:15" },
      { sectionCode: "DANSE_REG", day: "2026-06-06", title: TrainingTitle.GLACE, start: "08:20", end: "09:45" },
      { sectionCode: "DANSE_REG", day: "2026-06-02", title: TrainingTitle.SOL, start: "18:30", end: "19:15" },
      { sectionCode: "DANSE_REG", day: "2026-06-03", title: TrainingTitle.SOL, start: "09:00", end: "09:45" },

      { sectionCode: "ART_NAT", day: "2026-06-01", title: TrainingTitle.GLACE, start: "19:00", end: "20:15" },
      { sectionCode: "ART_NAT", day: "2026-06-02", title: TrainingTitle.GLACE, start: "16:15", end: "17:15" },
      { sectionCode: "ART_NAT", day: "2026-06-03", title: TrainingTitle.GLACE, start: "13:15", end: "14:15" },
      { sectionCode: "ART_NAT", day: "2026-06-04", title: TrainingTitle.GLACE, start: "16:15", end: "18:15" },
      { sectionCode: "ART_NAT", day: "2026-06-05", title: TrainingTitle.GLACE, start: "06:40", end: "08:00" },
      { sectionCode: "ART_NAT", day: "2026-06-06", title: TrainingTitle.GLACE, start: "06:40", end: "08:05" },
      { sectionCode: "ART_NAT", day: "2026-06-01", title: TrainingTitle.SOL, start: "18:00", end: "18:45" },
      { sectionCode: "ART_NAT", day: "2026-06-04", title: TrainingTitle.SOL, start: "14:30", end: "15:15" },

      { sectionCode: "ART_REG", day: "2026-06-01", title: TrainingTitle.GLACE, start: "17:00", end: "18:45" },
      { sectionCode: "ART_REG", day: "2026-06-02", title: TrainingTitle.GLACE, start: "17:15", end: "18:15" },
      { sectionCode: "ART_REG", day: "2026-06-03", title: TrainingTitle.GLACE, start: "10:15", end: "12:15" },
      { sectionCode: "ART_REG", day: "2026-06-04", title: TrainingTitle.GLACE, start: "16:15", end: "18:15" },
      { sectionCode: "ART_REG", day: "2026-06-06", title: TrainingTitle.GLACE, start: "08:20", end: "09:45" },
      { sectionCode: "ART_REG", day: "2026-06-02", title: TrainingTitle.SOL, start: "18:30", end: "19:15" },
      { sectionCode: "ART_REG", day: "2026-06-03", title: TrainingTitle.SOL, start: "09:00", end: "09:45" },

      { sectionCode: "SYNCHRO_JUV", day: "2026-06-02", title: TrainingTitle.GLACE, start: "17:15", end: "18:15" },
      { sectionCode: "SYNCHRO_JUV", day: "2026-06-03", title: TrainingTitle.GLACE, start: "10:15", end: "12:15" },
      { sectionCode: "SYNCHRO_JUV", day: "2026-06-06", title: TrainingTitle.GLACE, start: "08:20", end: "09:45" },
      { sectionCode: "SYNCHRO_JUV", day: "2026-06-02", title: TrainingTitle.SOL, start: "18:30", end: "19:15" },

      { sectionCode: "SYNCHRO_NOV_B", day: "2026-06-01", title: TrainingTitle.GLACE, start: "20:15", end: "21:30" },
      { sectionCode: "SYNCHRO_NOV_B", day: "2026-06-02", title: TrainingTitle.GLACE, start: "18:30", end: "19:45" },
      { sectionCode: "SYNCHRO_NOV_B", day: "2026-06-03", title: TrainingTitle.GLACE, start: "12:30", end: "13:30" },
      { sectionCode: "SYNCHRO_NOV_B", day: "2026-06-04", title: TrainingTitle.GLACE, start: "12:30", end: "14:00" },
    ],
  },
  {
    key: "S2",
    label: "Stage été 2026 - Semaine 2",
    slots: [
      { sectionCode: "DANSE_NAT", day: "2026-06-08", title: TrainingTitle.GLACE, start: "18:30", end: "19:45" },
      { sectionCode: "DANSE_NAT", day: "2026-06-09", title: TrainingTitle.GLACE, start: "17:15", end: "18:30" },
      { sectionCode: "DANSE_NAT", day: "2026-06-10", title: TrainingTitle.GLACE, start: "13:15", end: "14:15" },
      { sectionCode: "DANSE_NAT", day: "2026-06-11", title: TrainingTitle.GLACE, start: "16:15", end: "18:15" },
      { sectionCode: "DANSE_NAT", day: "2026-06-12", title: TrainingTitle.GLACE, start: "06:40", end: "08:00" },
      { sectionCode: "DANSE_NAT", day: "2026-06-13", title: TrainingTitle.GLACE, start: "06:40", end: "08:05" },
      { sectionCode: "DANSE_NAT", day: "2026-06-11", title: TrainingTitle.SOL, start: "14:30", end: "15:15" },
      { sectionCode: "DANSE_NAT", day: "2026-06-12", title: TrainingTitle.SOL, start: "18:30", end: "19:15" },

      { sectionCode: "DANSE_REG", day: "2026-06-08", title: TrainingTitle.GLACE, start: "17:15", end: "18:15" },
      { sectionCode: "DANSE_REG", day: "2026-06-09", title: TrainingTitle.GLACE, start: "17:15", end: "18:30" },
      { sectionCode: "DANSE_REG", day: "2026-06-10", title: TrainingTitle.GLACE, start: "10:15", end: "12:15" },
      { sectionCode: "DANSE_REG", day: "2026-06-11", title: TrainingTitle.GLACE, start: "16:15", end: "18:15" },
      { sectionCode: "DANSE_REG", day: "2026-06-13", title: TrainingTitle.GLACE, start: "08:20", end: "09:45" },
      { sectionCode: "DANSE_REG", day: "2026-06-12", title: TrainingTitle.SOL, start: "09:00", end: "09:45" },
      { sectionCode: "DANSE_REG", day: "2026-06-13", title: TrainingTitle.SOL, start: "10:00", end: "11:00" },

      { sectionCode: "SYNCHRO_NOV_B", day: "2026-06-08", title: TrainingTitle.GLACE, start: "19:45", end: "21:15" },
      { sectionCode: "SYNCHRO_NOV_B", day: "2026-06-09", title: TrainingTitle.GLACE, start: "18:30", end: "19:45" },
      { sectionCode: "SYNCHRO_NOV_B", day: "2026-06-10", title: TrainingTitle.GLACE, start: "12:30", end: "13:30" },
      { sectionCode: "SYNCHRO_NOV_B", day: "2026-06-11", title: TrainingTitle.GLACE, start: "12:30", end: "14:00" },
    ],
  },
  {
    key: "S3",
    label: "Stage été 2026 - Semaine 3",
    slots: [
      { sectionCode: "ART_NAT", day: "2026-06-15", title: TrainingTitle.GLACE, start: "18:00", end: "19:15", note: "AN + AR" },
      { sectionCode: "ART_NAT", day: "2026-06-16", title: TrainingTitle.GLACE, start: "18:00", end: "19:15", note: "AN + AR" },
      { sectionCode: "ART_NAT", day: "2026-06-17", title: TrainingTitle.GLACE, start: "17:45", end: "19:15", note: "AN + AR" },
      { sectionCode: "ART_NAT", day: "2026-06-18", title: TrainingTitle.GLACE, start: "18:00", end: "19:15", note: "AN + AR" },
      { sectionCode: "ART_NAT", day: "2026-06-19", title: TrainingTitle.GLACE, start: "18:00", end: "19:15", note: "AN + AR" },
      { sectionCode: "ART_NAT", day: "2026-06-15", title: TrainingTitle.SOL, start: "19:30", end: "20:15", note: "AN + AR" },
      { sectionCode: "ART_NAT", day: "2026-06-16", title: TrainingTitle.SOL, start: "19:30", end: "20:15", note: "AN + AR" },
      { sectionCode: "ART_NAT", day: "2026-06-17", title: TrainingTitle.SOL, start: "16:45", end: "17:30", note: "AN + AR" },
      { sectionCode: "ART_NAT", day: "2026-06-18", title: TrainingTitle.SOL, start: "19:30", end: "20:15", note: "AN + AR" },
      { sectionCode: "ART_NAT", day: "2026-06-19", title: TrainingTitle.SOL, start: "19:30", end: "20:15", note: "AN + AR" },

      { sectionCode: "ART_REG", day: "2026-06-15", title: TrainingTitle.GLACE, start: "18:00", end: "19:15", note: "AN + AR" },
      { sectionCode: "ART_REG", day: "2026-06-16", title: TrainingTitle.GLACE, start: "18:00", end: "19:15", note: "AN + AR" },
      { sectionCode: "ART_REG", day: "2026-06-17", title: TrainingTitle.GLACE, start: "17:45", end: "19:15", note: "AN + AR" },
      { sectionCode: "ART_REG", day: "2026-06-18", title: TrainingTitle.GLACE, start: "18:00", end: "19:15", note: "AN + AR" },
      { sectionCode: "ART_REG", day: "2026-06-19", title: TrainingTitle.GLACE, start: "18:00", end: "19:15", note: "AN + AR" },
      { sectionCode: "ART_REG", day: "2026-06-15", title: TrainingTitle.SOL, start: "19:30", end: "20:15", note: "AN + AR" },
      { sectionCode: "ART_REG", day: "2026-06-16", title: TrainingTitle.SOL, start: "19:30", end: "20:15", note: "AN + AR" },
      { sectionCode: "ART_REG", day: "2026-06-17", title: TrainingTitle.SOL, start: "16:45", end: "17:30", note: "AN + AR" },
      { sectionCode: "ART_REG", day: "2026-06-18", title: TrainingTitle.SOL, start: "19:30", end: "20:15", note: "AN + AR" },
      { sectionCode: "ART_REG", day: "2026-06-19", title: TrainingTitle.SOL, start: "19:30", end: "20:15", note: "AN + AR" },

      { sectionCode: "SYNCHRO_NOV_B", day: "2026-06-15", title: TrainingTitle.GLACE, start: "19:30", end: "20:45" },
      { sectionCode: "SYNCHRO_NOV_B", day: "2026-06-16", title: TrainingTitle.GLACE, start: "19:30", end: "20:45" },
      { sectionCode: "SYNCHRO_NOV_B", day: "2026-06-17", title: TrainingTitle.GLACE, start: "12:45", end: "14:15" },
      { sectionCode: "SYNCHRO_NOV_B", day: "2026-06-18", title: TrainingTitle.GLACE, start: "19:30", end: "20:45" },
      { sectionCode: "SYNCHRO_NOV_B", day: "2026-06-19", title: TrainingTitle.GLACE, start: "19:30", end: "20:45" },
      { sectionCode: "SYNCHRO_NOV_B", day: "2026-06-20", title: TrainingTitle.GLACE, start: "08:30", end: "09:45" },
      { sectionCode: "SYNCHRO_NOV_B", day: "2026-06-15", title: TrainingTitle.SOL, start: "18:30", end: "19:15" },
      { sectionCode: "SYNCHRO_NOV_B", day: "2026-06-16", title: TrainingTitle.SOL, start: "18:30", end: "19:15" },
      { sectionCode: "SYNCHRO_NOV_B", day: "2026-06-17", title: TrainingTitle.SOL, start: "14:45", end: "15:45" },
      { sectionCode: "SYNCHRO_NOV_B", day: "2026-06-18", title: TrainingTitle.SOL, start: "18:30", end: "19:15" },
      { sectionCode: "SYNCHRO_NOV_B", day: "2026-06-19", title: TrainingTitle.SOL, start: "18:30", end: "19:15" },
      { sectionCode: "SYNCHRO_NOV_B", day: "2026-06-20", title: TrainingTitle.SOL, start: "10:00", end: "11:00" },
    ],
  },
];

async function importWeek(
  week: WeekDef,
  maps: {
    sectionMap: Map<string, string>;
    deborahId: string;
    camilleId: string;
    angelaId: string;
  },
) {
  const firstDate = dateIso(week.slots[0].day);
  const iso = getIsoWeek(firstDate);

  const weekProfile = await prisma.weekProfile.upsert({
    where: { isoYear_isoWeek: { isoYear: iso.year, isoWeek: iso.week } },
    update: { type: WeekType.STAGE, label: week.label, isPublished: true },
    create: {
      isoYear: iso.year,
      isoWeek: iso.week,
      type: WeekType.STAGE,
      label: week.label,
      isPublished: true,
    },
  });

  let count = 0;

  for (const slot of week.slots) {
    const sectionId = maps.sectionMap.get(slot.sectionCode);
    if (!sectionId) {
      throw new Error(`Section introuvable: ${slot.sectionCode}`);
    }

    const date = dateIso(slot.day);
    const coachId = coachForSectionCode(slot.sectionCode, maps);
    const location = locationForTitle(slot.title);

    await prisma.training.upsert({
      where: {
        sectionId_date_startTime_endTime_location: {
          sectionId,
          date,
          startTime: slot.start,
          endTime: slot.end,
          location,
        },
      },
      update: {
        weekProfileId: weekProfile.id,
        title: slot.title,
        type: TrainingType.STAGE,
        coachId,
        notes: slot.note ?? "Import PDF stage été 2026 (mode strict)",
        source: "pdf-import",
        status: "published",
      },
      create: {
        weekProfileId: weekProfile.id,
        sectionId,
        title: slot.title,
        type: TrainingType.STAGE,
        date,
        startTime: slot.start,
        endTime: slot.end,
        location,
        coachId,
        notes: slot.note ?? "Import PDF stage été 2026 (mode strict)",
        source: "pdf-import",
        status: "published",
      },
    });

    count += 1;
  }

  return { key: week.key, count };
}

async function main() {
  const maps = await ensureBaseData();

  const results = [] as Array<{ key: string; count: number }>;
  for (const week of weeks) {
    const result = await importWeek(week, maps);
    results.push(result);
  }

  console.log("Import terminé:");
  for (const result of results) {
    console.log(`- ${result.key}: ${result.count} créneaux stage importés`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    await prisma.$disconnect();
    console.error(error);
    process.exit(1);
  });
