import { PrismaClient } from "@prisma/client";

const BREVO_API_BASE = "https://api.brevo.com/v3";

type BrevoSendResponse = {
  messageId?: string;
};

function getBrevoConfig() {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.MAIL_FROM_EMAIL;
  const fromName = process.env.MAIL_FROM_NAME || "Club";

  if (!apiKey || !fromEmail) {
    return null;
  }

  return {
    apiKey,
    fromEmail,
    fromName,
  };
}

function buildEmailSubject(payload: Record<string, unknown> | null) {
  if (!payload) return "Information planning";
  const section = typeof payload.section === "string" ? payload.section : "Section";
  const date = typeof payload.date === "string" ? payload.date : "";
  const event = typeof payload.event === "string" ? payload.event : "updated";
  const label = event === "deleted" ? "Créneau supprimé" : "Créneau modifié";
  return `${label} - ${section}${date ? ` (${date})` : ""}`;
}

function buildEmailText(payload: Record<string, unknown> | null) {
  if (!payload) return "Un changement de planning a ete enregistre.";
  const message = typeof payload.message === "string" ? payload.message : null;
  if (message) return message;

  const title = typeof payload.trainingTitle === "string" ? payload.trainingTitle : "entrainement";
  const section = typeof payload.section === "string" ? payload.section : "section";
  const date = typeof payload.date === "string" ? payload.date : "date inconnue";
  const start = typeof payload.startTime === "string" ? payload.startTime : "";
  const end = typeof payload.endTime === "string" ? payload.endTime : "";
  const event = typeof payload.event === "string" ? payload.event : "updated";
  const eventText = event === "deleted" ? "supprime" : "modifie";

  return `Le creneau ${title} du ${date} ${start && end ? `(${start}-${end}) ` : ""}a ete ${eventText}. Section: ${section}.`;
}

export async function sendBrevoEmail(to: string, subject: string, textContent: string) {
  const config = getBrevoConfig();
  if (!config) {
    throw new Error("Email non configure (BREVO_API_KEY / MAIL_FROM_EMAIL manquants).");
  }

  const response = await fetch(`${BREVO_API_BASE}/smtp/email`, {
    method: "POST",
    headers: {
      "api-key": config.apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: config.fromEmail,
        name: config.fromName,
      },
      to: [{ email: to }],
      subject,
      textContent,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Echec envoi email Brevo: ${errorText}`);
  }

  return (await response.json()) as BrevoSendResponse;
}

export async function dispatchPendingEmailNotifications(
  prisma: PrismaClient,
  trainingId: string,
) {
  const config = getBrevoConfig();
  if (!config) {
    return { sentCount: 0, failedCount: 0, skipped: true };
  }

  const pending = await prisma.notification.findMany({
    where: {
      trainingId,
      channel: "email",
      status: "pending",
    },
    orderBy: { createdAt: "asc" },
  });

  let sentCount = 0;
  let failedCount = 0;

  for (const notification of pending) {
    try {
      const payload =
        typeof notification.payload === "object" && notification.payload !== null
          ? (notification.payload as Record<string, unknown>)
          : null;

      const subject = buildEmailSubject(payload);
      const textContent = buildEmailText(payload);
      const result = await sendBrevoEmail(notification.recipient, subject, textContent);

      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: "sent",
          sentAt: new Date(),
          payload: {
            ...(payload ?? {}),
            provider: "brevo",
            providerMessageId: result.messageId ?? null,
          },
        },
      });

      sentCount += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur inconnue";
      const payload =
        typeof notification.payload === "object" && notification.payload !== null
          ? (notification.payload as Record<string, unknown>)
          : {};

      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: "failed",
          payload: {
            ...payload,
            deliveryError: message,
          },
        },
      });

      failedCount += 1;
    }
  }

  return { sentCount, failedCount, skipped: false };
}