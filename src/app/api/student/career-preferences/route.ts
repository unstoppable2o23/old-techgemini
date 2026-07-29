import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { targetColleges, targetCountries, preferredCareer, prospectiveSessions } = await request.json();

    await prisma.studentProfile.update({
      where: { userId: session.user.id },
      data: {
        targetColleges: targetColleges || [],
        targetCountries: targetCountries || [],
        preferredCareer: preferredCareer || null,
        prospectiveSessions: prospectiveSessions || [],
        careerPrefsFilled: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Career preferences error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
