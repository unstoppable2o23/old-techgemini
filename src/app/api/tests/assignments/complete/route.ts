import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { token, report } = await request.json();
    if (!token || typeof token !== "string" || !report) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const assignment = await prisma.testAssignment.findUnique({ where: { token } });
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    await prisma.testAssignment.update({
      where: { id: assignment.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        result: report,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save test result:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
