import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { TrainingTitle, TrainingType } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSectionMemberNotifications } from "@/lib/training-notifications";

const updateSchema = z.object({
  sectionId: z.string().cuid().optional(),
  title: z.nativeEnum(TrainingTitle).optional(),
  type: z.nativeEnum(TrainingType).optional(),
  date: z.string().datetime().optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  location: z.string().min(2).max(120).optional(),
  coachId: z.string().cuid().optional(),
  notes: z.string().max(600).optional().nullable(),
  status: z.string().optional(),
});

async function requireSession() {
  const session = await getServerSession(authOptions);
  return session?.user ? session : null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const raw = await request.json();
  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;
  const updated = await prisma.training.update({
    where: { id },
    data: {
      sectionId: payload.sectionId,
      title: payload.title,
      type: payload.type,
      date: payload.date ? new Date(payload.date) : undefined,
      startTime: payload.startTime,
      endTime: payload.endTime,
      location: payload.location,
      coachId: payload.coachId,
      notes: payload.notes,
      status: payload.status,
      updatedById: session.user.id,
    },
  });

  const notificationCount = await createSectionMemberNotifications(prisma, updated.id, "updated");

  return NextResponse.json({ training: updated, notificationCount });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const cancelled = await prisma.training.update({
    where: { id },
    data: {
      status: "cancelled",
      updatedById: session.user.id,
    },
  });

  const notificationCount = await createSectionMemberNotifications(prisma, cancelled.id, "deleted");

  return NextResponse.json({ success: true, notificationCount });
}
