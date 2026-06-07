import { hashSync } from "bcryptjs";
import { PrismaClient, Role, TrainingTitle, TrainingType, WeekType } from "@prisma/client";

const prisma = new PrismaClient();

function getIsoWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

async function main() {
  const coachPassword = process.env.COACH_PASSWORD ?? "coach123";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";

  await prisma.user.deleteMany({
    where: {
      OR: [{ name: "Coach Démo" }, { email: "coach@epwlm.local" }],
    },
  });

  const deborah = await prisma.user.upsert({
    where: { email: "deborah.wattelier@epwlm.local" },
    update: {
      name: "Deborah Wattelier",
      role: Role.COACH,
      isActive: true,
      passwordHash: hashSync(coachPassword, 10),
    },
    create: {
      name: "Deborah Wattelier",
      email: "deborah.wattelier@epwlm.local",
      role: Role.COACH,
      isActive: true,
      passwordHash: hashSync(coachPassword, 10),
    },
  });

  const camille = await prisma.user.upsert({
    where: { email: "camille.zouita@epwlm.local" },
    update: {
      name: "Camille Zouita",
      role: Role.COACH,
      isActive: true,
      passwordHash: hashSync(coachPassword, 10),
    },
    create: {
      name: "Camille Zouita",
      email: "camille.zouita@epwlm.local",
      role: Role.COACH,
      isActive: true,
      passwordHash: hashSync(coachPassword, 10),
    },
  });

  const angela = await prisma.user.upsert({
    where: { email: "angela.tamburrino@epwlm.local" },
    update: {
      name: "Angela Tamburrino",
      role: Role.COACH,
      isActive: true,
      passwordHash: hashSync(coachPassword, 10),
    },
    create: {
      name: "Angela Tamburrino",
      email: "angela.tamburrino@epwlm.local",
      role: Role.COACH,
      isActive: true,
      passwordHash: hashSync(coachPassword, 10),
    },
  });

  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? "admin@epwlm.local" },
    update: {
      name: "Admin Démo",
      role: Role.ADMIN,
      isActive: true,
      passwordHash: hashSync(adminPassword, 10),
    },
    create: {
      name: "Admin Démo",
      email: process.env.ADMIN_EMAIL ?? "admin@epwlm.local",
      role: Role.ADMIN,
      isActive: true,
      passwordHash: hashSync(adminPassword, 10),
    },
  });

  const sections = [
    ["LOISIR", "Loisirs"],
    ["ADULT_ART", "Artistique Adultes"],
    ["ART_NAT", "Artistique Nationaux"],
    ["ART_REG", "Artistique Régionaux"],
    ["ADULT_DANSE", "Danse Adultes"],
    ["DANSE_NAT", "Danse Nationaux"],
    ["DANSE_REG", "Danse Régionaux"],
    ["SYNCHRO_DETECT", "Synchro Détection"],
    ["SYNCHRO_JUV", "Synchro Juvéniles"],
    ["SYNCHRO_NOV_B", "Synchro Novices B"],
    ["ARTISTIQUE", "Artistique"],
  ] as const;

  const createdSections = [] as { id: string; name: string }[];
  for (const [code, name] of sections) {
    const section = await prisma.section.upsert({
      where: { code },
      update: { name, isActive: true },
      create: { code, name, isActive: true },
    });
    createdSections.push({ id: section.id, name: section.name });
  }

  await prisma.section.updateMany({
    where: { code: "ARTISTIQUE" },
    data: { isActive: false, name: "Artistique" },
  });

  const { year, week } = getIsoWeek(new Date("2026-06-08T00:00:00.000Z"));
  const weekProfile = await prisma.weekProfile.upsert({
    where: { isoYear_isoWeek: { isoYear: year, isoWeek: week } },
    update: { type: WeekType.STANDARD, label: `Semaine ${week}` },
    create: {
      isoYear: year,
      isoWeek: week,
      type: WeekType.STANDARD,
      label: `Semaine ${week}`,
      isPublished: true,
    },
  });

  const loisir = createdSections.find((s) => s.name === "Loisirs")!;
  const syncJuv = createdSections.find((s) => s.name === "Synchro Juvéniles")!;
  const artNat = createdSections.find((s) => s.name === "Artistique Nationaux")!;
  const danseNat = createdSections.find((s) => s.name === "Danse Nationaux")!;

  const trainings = [
    {
      sectionId: loisir.id,
      title: TrainingTitle.GLACE,
      type: TrainingType.HEBDOMADAIRE,
      date: new Date("2026-06-08T00:00:00.000Z"),
      startTime: "18:00",
      endTime: "19:30",
      location: "Patinoire A",
      coachId: angela.id,
      notes: "Créneau loisir hebdo",
    },
    {
      sectionId: syncJuv.id,
      title: TrainingTitle.GLACE,
      type: TrainingType.HEBDOMADAIRE,
      date: new Date("2026-06-09T00:00:00.000Z"),
      startTime: "19:00",
      endTime: "21:00",
      location: "Patinoire A",
      coachId: angela.id,
      notes: "Synchro Juvéniles",
    },
    {
      sectionId: artNat.id,
      title: TrainingTitle.PPG,
      type: TrainingType.STAGE,
      date: new Date("2026-06-10T00:00:00.000Z"),
      startTime: "17:30",
      endTime: "18:30",
      location: "Salle Sol 2",
      coachId: camille.id,
      notes: "Préparation stage",
    },
    {
      sectionId: danseNat.id,
      title: TrainingTitle.SOL,
      type: TrainingType.HEBDOMADAIRE,
      date: new Date("2026-06-11T00:00:00.000Z"),
      startTime: "20:00",
      endTime: "21:00",
      location: "Salle Sol 1",
      coachId: deborah.id,
      notes: "Danse nationaux",
    },
  ];

  for (const t of trainings) {
    await prisma.training.upsert({
      where: {
        sectionId_date_startTime_endTime_location: {
          sectionId: t.sectionId,
          date: t.date,
          startTime: t.startTime,
          endTime: t.endTime,
          location: t.location,
        },
      },
      update: {
        weekProfileId: weekProfile.id,
        sectionId: t.sectionId,
        title: t.title,
        type: t.type,
        date: t.date,
        startTime: t.startTime,
        endTime: t.endTime,
        location: t.location,
        coachId: t.coachId,
        notes: t.notes,
        status: "published",
      },
      create: {
        weekProfileId: weekProfile.id,
        sectionId: t.sectionId,
        title: t.title,
        type: t.type,
        date: t.date,
        startTime: t.startTime,
        endTime: t.endTime,
        location: t.location,
        coachId: t.coachId,
        notes: t.notes,
        status: "published",
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed terminé.");
  })
  .catch(async (error) => {
    await prisma.$disconnect();
    console.error(error);
    process.exit(1);
  });
