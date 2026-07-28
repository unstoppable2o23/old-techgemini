import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const counselor = await prisma.counselorProfile.findFirst();
  if (!counselor) return NextResponse.json({ error: "No counselor found" }, { status: 404 });

  const result = await prisma.studentProfile.updateMany({
    where: { counselorId: null },
    data: { counselorId: counselor.id },
  });

  return NextResponse.json({ updated: result.count, counselorId: counselor.id });
}
