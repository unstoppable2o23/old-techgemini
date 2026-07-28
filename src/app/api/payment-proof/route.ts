import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const appointmentId = formData.get("appointmentId") as string;
    const file = formData.get("file") as File;

    if (!appointmentId || !file) {
      return NextResponse.json({ error: "appointmentId and file are required" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be under 5MB" }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { paymentProof: true },
    });

    if (!appointment) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    if (appointment.userId !== session.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    if (appointment.paymentProof) return NextResponse.json({ error: "Payment proof already uploaded" }, { status: 409 });

    const counselorProfile = await prisma.counselorProfile.findUnique({
      where: { userId: appointment.counselorId },
    });
    if (!counselorProfile) return NextResponse.json({ error: "Counselor profile not found" }, { status: 404 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const proof = await prisma.paymentProof.create({
      data: {
        appointmentId,
        fileUrl: dataUrl,
        fileName: file.name,
        counselorId: counselorProfile.id,
        expiresAt,
      },
    });

    return NextResponse.json({ proof }, { status: 201 });
  } catch (error) {
    console.error("Failed to upload payment proof:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
