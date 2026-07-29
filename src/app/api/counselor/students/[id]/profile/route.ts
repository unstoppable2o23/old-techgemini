import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const student = await prisma.user.findUnique({
    where: { id },
    include: { studentProfile: true },
  });
  if (!student || student.role !== "STUDENT") return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.user.role === "COUNSELOR") {
    const cp = await prisma.counselorProfile.findUnique({ where: { userId: session.user.id } });
    if (!cp || student.studentProfile?.counselorId !== cp.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.json({ student });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const student = await prisma.user.findUnique({
    where: { id },
    include: { studentProfile: true },
  });
  if (!student || student.role !== "STUDENT") return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.user.role === "COUNSELOR") {
    const cp = await prisma.counselorProfile.findUnique({ where: { userId: session.user.id } });
    if (!cp || student.studentProfile?.counselorId !== cp.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  try {
    const body = await request.json();
    const userData: any = {};
    const profileData: any = {};

    if (body.firstName !== undefined) userData.firstName = body.firstName;
    if (body.lastName !== undefined) userData.lastName = body.lastName;
    if (body.email !== undefined) userData.email = body.email;
    if (body.mobile !== undefined) profileData.mobile = body.mobile || null;
    if (body.gender !== undefined) profileData.gender = body.gender || null;
    if (body.gradeLevel !== undefined) profileData.gradeLevel = body.gradeLevel || null;
    if (body.dateOfBirth !== undefined) profileData.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
    if (body.preferredCareer !== undefined) profileData.preferredCareer = body.preferredCareer || null;
    if (body.targetColleges !== undefined) profileData.targetColleges = body.targetColleges;
    if (body.targetCountries !== undefined) profileData.targetCountries = body.targetCountries;
    if (body.prospectiveSessions !== undefined) profileData.prospectiveSessions = body.prospectiveSessions;

    if (Object.keys(userData).length > 0) {
      await prisma.user.update({ where: { id }, data: userData });
    }
    if (Object.keys(profileData).length > 0) {
      await prisma.studentProfile.update({ where: { userId: id }, data: profileData });
    }

    const updated = await prisma.user.findUnique({
      where: { id },
      include: { studentProfile: true },
    });

    return NextResponse.json({ student: updated });
  } catch (error) {
    console.error("Failed to update student:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
