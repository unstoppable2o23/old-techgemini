import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const assignment = await prisma.testAssignment.findUnique({
    where: { token },
    select: { status: true, result: true, completedAt: true },
  });

  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: assignment.status,
    report: assignment.result,
    completedAt: assignment.completedAt,
  });
}

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
