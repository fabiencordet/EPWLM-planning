import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sortSections } from "@/lib/sections";

export async function GET() {
  try {
    const rawSections = await prisma.section.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, code: true, name: true },
    });
    const sections = sortSections(rawSections);
    return NextResponse.json({ sections });
  } catch {
    return NextResponse.json({ sections: [] });
  }
}
