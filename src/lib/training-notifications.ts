import { PrismaClient } from "@prisma/client";
import { dispatchPendingEmailNotifications } from "@/lib/email";

type NotificationEvent = "updated" | "deleted";

function describeEvent(event: NotificationEvent) {
  return event === "updated" ? "modifie" : "supprime";
}

export async function createSectionMemberNotifications(
  prisma: PrismaClient,
  trainingId: string,
  event: NotificationEvent,
) {
  const training = await prisma.training.findUnique({
    where: { id: trainingId },
    include: {
      section: { select: { name: true } },
      coach: { select: { name: true } },
    },
  });

  if (!training) return 0;

  const recipients = await prisma.skaterSection.findMany({
    where: {
      sectionId: training.sectionId,
      startsAt: { lte: training.date },
      OR: [{ endsAt: null }, { endsAt: { gte: training.date } }],
      skater: { isActive: true },
    },
    include: {
      skater: {
        select: {
          firstName: true,
          lastName: true,
          parentEmail: true,
          parentPhone: true,
        },
      },
    },
  });

  const message = `Le creneau ${training.title.toLowerCase()} du ${training.date.toISOString().slice(0, 10)} (${training.startTime}-${training.endTime}) a ete ${describeEvent(event)}. Section: ${training.section.name}.`;

  const payloads: Array<{
    trainingId: string;
    channel: string;
    recipient: string;
    status: string;
    payload: {
      event: NotificationEvent;
      section: string;
      trainingTitle: string;
      date: string;
      startTime: string;
      endTime: string;
      location: string;
      coach: string;
      message: string;
    };
  }> = [];

  for (const row of recipients) {
    const email = row.skater.parentEmail?.trim();

    if (email) {
      payloads.push({
        trainingId,
        channel: "email",
        recipient: email,
        status: "pending",
        payload: {
          event,
          section: training.section.name,
          trainingTitle: training.title,
          date: training.date.toISOString().slice(0, 10),
          startTime: training.startTime,
          endTime: training.endTime,
          location: training.location,
          coach: training.coach.name,
          message,
        },
      });
    }
  }

  if (payloads.length === 0) return 0;

  await prisma.notification.createMany({ data: payloads });
  await dispatchPendingEmailNotifications(prisma, trainingId);

  return payloads.length;
}
