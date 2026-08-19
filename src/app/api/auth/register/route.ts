import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, dateOfBirth, mobile, gender, gradeLevel, studyLevel, exams } = body;

    if (body._hp) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!firstName || !lastName || !email || !password || !mobile || !gender || !gradeLevel) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    const tenantId = request.headers.get("x-tenant-id") || "default";

    let tenant = await prisma.tenant.findUnique({
      where: { subdomain: tenantId },
    });

    if (!tenant) {
      tenant = await prisma.tenant.findFirst();
      if (!tenant) {
        tenant = await prisma.tenant.create({
          data: {
            name: "Default Agency",
            slug: "default",
            subdomain: "default",
            brandName: "Study Abroad Platform",
          },
        });
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        role: "STUDENT",
        tenantId: tenant.id,
        studentProfile: {
          create: {
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            mobile: mobile || null,
            gender: gender || null,
            gradeLevel: gradeLevel || null,
            studyLevel: studyLevel || null,
            exams: exams || [],
            featureAccess: { create: {} },
          },
        },
      },
      include: { studentProfile: true },
    });

    return NextResponse.json(
      { message: "Account created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
